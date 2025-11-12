-- Migration: Email Reports and Notifications Infrastructure

-- 1. User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_weekly_insights BOOLEAN DEFAULT true,
  email_anomaly_alerts BOOLEAN DEFAULT true,
  email_critical_only BOOLEAN DEFAULT false,
  email_frequency TEXT DEFAULT 'weekly' CHECK (email_frequency IN ('daily', 'weekly', 'monthly')),
  notification_anomaly_alerts BOOLEAN DEFAULT true,
  notification_insights BOOLEAN DEFAULT true,
  notification_sound BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" 
ON public.user_notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" 
ON public.user_notification_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
ON public.user_notification_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_notification_prefs_user ON public.user_notification_preferences(user_id);

-- 2. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('anomaly', 'insight', 'report', 'goal', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  related_id UUID,
  related_table TEXT,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- 3. Email Reports Log Table
CREATE TABLE IF NOT EXISTS public.email_reports_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('weekly_insights', 'anomaly_alert', 'monthly_summary')),
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'queued')),
  email_to TEXT NOT NULL,
  subject TEXT,
  insights_count INTEGER DEFAULT 0,
  anomalies_count INTEGER DEFAULT 0,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.email_reports_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own email logs" 
ON public.email_reports_log FOR SELECT 
USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_email_reports_user_sent ON public.email_reports_log(user_id, sent_at DESC);

-- 4. Data Quality Metrics Table
CREATE TABLE IF NOT EXISTS public.data_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  total_entries INTEGER DEFAULT 0,
  complete_entries INTEGER DEFAULT 0,
  incomplete_entries INTEGER DEFAULT 0,
  completeness_score DECIMAL(5,2) DEFAULT 0,
  validation_errors INTEGER DEFAULT 0,
  missing_fields JSONB DEFAULT '[]'::jsonb,
  data_freshness_days INTEGER DEFAULT 0,
  last_entry_date DATE,
  scope_1_completeness DECIMAL(5,2) DEFAULT 0,
  scope_2_completeness DECIMAL(5,2) DEFAULT 0,
  scope_3_completeness DECIMAL(5,2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.data_quality_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quality metrics" 
ON public.data_quality_metrics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quality metrics" 
ON public.data_quality_metrics FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_quality_metrics_user_date ON public.data_quality_metrics(user_id, metric_date DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_severity TEXT DEFAULT 'info',
  p_related_id UUID DEFAULT NULL,
  p_related_table TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    severity,
    related_id,
    related_table,
    action_url
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_severity,
    p_related_id,
    p_related_table,
    p_action_url
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Trigger to create notifications for critical anomalies
CREATE OR REPLACE FUNCTION public.notify_critical_anomaly()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.severity = 'critical' AND NEW.is_acknowledged = false THEN
    PERFORM create_notification(
      NEW.user_id,
      'anomaly',
      'Critical Anomaly Detected',
      NEW.description,
      'error',
      NEW.id,
      'emissions_anomalies',
      '/advanced-analytics?tab=anomalies'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_critical_anomaly
  AFTER INSERT ON public.emissions_anomalies
  FOR EACH ROW
  EXECUTE FUNCTION notify_critical_anomaly();

-- Trigger to create notifications for high-priority insights
CREATE OR REPLACE FUNCTION public.notify_high_priority_insight()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.priority IN ('high', 'critical') AND NEW.is_dismissed = false THEN
    PERFORM create_notification(
      NEW.user_id,
      'insight',
      'New ' || NEW.priority || ' Priority Insight',
      NEW.title,
      CASE WHEN NEW.priority = 'critical' THEN 'error' ELSE 'warning' END,
      NEW.id,
      'emissions_insights',
      '/advanced-analytics?tab=insights'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_high_priority_insight
  AFTER INSERT ON public.emissions_insights
  FOR EACH ROW
  EXECUTE FUNCTION notify_high_priority_insight();