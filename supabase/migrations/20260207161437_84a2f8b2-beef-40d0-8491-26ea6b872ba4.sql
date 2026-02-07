-- Core events table for user behavior tracking
CREATE TABLE public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  event_properties JSONB DEFAULT '{}',
  page_path VARCHAR(255),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_user_events_user_date ON public.user_events(user_id, created_at DESC);
CREATE INDEX idx_user_events_name ON public.user_events(event_name);
CREATE INDEX idx_user_events_category ON public.user_events(event_category);
CREATE INDEX idx_user_events_org ON public.user_events(organization_id, created_at DESC);
CREATE INDEX idx_user_events_session ON public.user_events(session_id);

-- Feature usage aggregates table
CREATE TABLE public.feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  feature_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  first_used_at TIMESTAMPTZ DEFAULT NOW(),
  period_start DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_name, period_start)
);

-- Indexes for feature_usage
CREATE INDEX idx_feature_usage_user ON public.feature_usage(user_id, period_start DESC);
CREATE INDEX idx_feature_usage_feature ON public.feature_usage(feature_name);

-- Enable RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_events
-- Users can insert their own events
CREATE POLICY "Users can insert own events"
ON public.user_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own events
CREATE POLICY "Users can view own events"
ON public.user_events
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all events in their organization
CREATE POLICY "Admins can view org events"
ON public.user_events
FOR SELECT
USING (
  organization_id IS NOT NULL 
  AND has_role(auth.uid(), 'admin')
  AND is_org_member(auth.uid(), organization_id)
);

-- RLS Policies for feature_usage
-- Users can insert their own usage
CREATE POLICY "Users can insert own usage"
ON public.feature_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own usage
CREATE POLICY "Users can update own usage"
ON public.feature_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own usage
CREATE POLICY "Users can view own usage"
ON public.feature_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view org usage
CREATE POLICY "Admins can view org usage"
ON public.feature_usage
FOR SELECT
USING (
  organization_id IS NOT NULL 
  AND has_role(auth.uid(), 'admin')
  AND is_org_member(auth.uid(), organization_id)
);