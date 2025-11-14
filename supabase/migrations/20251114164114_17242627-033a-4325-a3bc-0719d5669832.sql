-- Add quality_tracking table for historical trends
CREATE TABLE IF NOT EXISTS public.quality_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  overall_score NUMERIC(5,2),
  completeness_score NUMERIC(5,2),
  accuracy_score NUMERIC(5,2),
  freshness_score NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  total_entries INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add validation_rules table for configurable rules
CREATE TABLE IF NOT EXISTS public.validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL, -- 'field', 'business_logic', 'consistency'
  severity TEXT NOT NULL, -- 'error', 'warning', 'info'
  condition JSONB NOT NULL,
  error_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add quality alert preferences to user_notification_preferences
ALTER TABLE public.user_notification_preferences
ADD COLUMN IF NOT EXISTS email_quality_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS quality_alert_threshold NUMERIC(5,2) DEFAULT 70.0,
ADD COLUMN IF NOT EXISTS daily_quality_digest BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.quality_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quality_tracking
CREATE POLICY "Users can view organization quality tracking"
  ON public.quality_tracking FOR SELECT
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert organization quality tracking"
  ON public.quality_tracking FOR INSERT
  WITH CHECK (is_org_member(auth.uid(), organization_id));

-- RLS Policies for validation_rules
CREATE POLICY "Users can view organization validation rules"
  ON public.validation_rules FOR SELECT
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Admins can manage organization validation rules"
  ON public.validation_rules FOR ALL
  USING (is_org_member(auth.uid(), organization_id) AND has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quality_tracking_org_date ON public.quality_tracking(organization_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_validation_rules_org_active ON public.validation_rules(organization_id, is_active);

-- Create trigger for updated_at
CREATE TRIGGER update_validation_rules_updated_at
  BEFORE UPDATE ON public.validation_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();