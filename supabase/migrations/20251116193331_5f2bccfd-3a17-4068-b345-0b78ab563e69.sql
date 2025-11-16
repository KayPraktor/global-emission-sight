-- Phase 1: Enterprise Metrics Table
CREATE TABLE IF NOT EXISTS public.enterprise_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  total_emissions NUMERIC,
  carbon_cost NUMERIC,
  compliance_score NUMERIC,
  carbon_intensity NUMERIC,
  net_zero_progress NUMERIC,
  risk_exposure NUMERIC,
  scope_1_emissions NUMERIC,
  scope_2_emissions NUMERIC,
  scope_3_emissions NUMERIC,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, metric_date)
);

ALTER TABLE public.enterprise_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org metrics" ON public.enterprise_metrics
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "System can insert metrics" ON public.enterprise_metrics
  FOR INSERT WITH CHECK (true);

-- Phase 2: Enterprise Insights Table
CREATE TABLE IF NOT EXISTS public.enterprise_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  insight_type TEXT NOT NULL,
  priority TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact_co2_reduction NUMERIC,
  impact_cost_saving NUMERIC,
  confidence_score NUMERIC,
  category TEXT,
  source TEXT,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.enterprise_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org insights" ON public.enterprise_insights
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update their org insights" ON public.enterprise_insights
  FOR UPDATE USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "System can insert insights" ON public.enterprise_insights
  FOR INSERT WITH CHECK (true);

-- Phase 3: Enterprise Scenarios Table
CREATE TABLE IF NOT EXISTS public.enterprise_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  scenario_name TEXT NOT NULL,
  description TEXT,
  baseline_emissions NUMERIC NOT NULL,
  baseline_year INTEGER NOT NULL,
  target_year INTEGER NOT NULL,
  projected_emissions JSONB,
  projected_costs JSONB,
  interventions JSONB,
  probability NUMERIC,
  impact_score NUMERIC,
  confidence_level TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.enterprise_scenarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org scenarios" ON public.enterprise_scenarios
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert their org scenarios" ON public.enterprise_scenarios
  FOR INSERT WITH CHECK (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update their org scenarios" ON public.enterprise_scenarios
  FOR UPDATE USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete their org scenarios" ON public.enterprise_scenarios
  FOR DELETE USING (is_org_member(auth.uid(), organization_id));

-- Phase 4: Compliance Framework Tables
CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  framework_name TEXT NOT NULL,
  status TEXT NOT NULL,
  score NUMERIC,
  next_deadline DATE,
  completeness_percentage NUMERIC DEFAULT 0,
  estimated_cost NUMERIC,
  risk_level TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org frameworks" ON public.compliance_frameworks
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can manage their org frameworks" ON public.compliance_frameworks
  FOR ALL USING (is_org_member(auth.uid(), organization_id));

CREATE TABLE IF NOT EXISTS public.compliance_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  framework_id UUID REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completion_percentage NUMERIC DEFAULT 0,
  assignee_id UUID,
  documents TEXT[],
  dependencies TEXT[],
  estimated_hours NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.compliance_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org deadlines" ON public.compliance_deadlines
  FOR SELECT USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can manage their org deadlines" ON public.compliance_deadlines
  FOR ALL USING (is_org_member(auth.uid(), organization_id));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enterprise_metrics_org_date ON public.enterprise_metrics(organization_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_enterprise_insights_org_status ON public.enterprise_insights(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_enterprise_scenarios_org ON public.enterprise_scenarios(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_frameworks_org ON public.compliance_frameworks(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_deadlines_org_date ON public.compliance_deadlines(organization_id, due_date);

-- Create triggers for updated_at
CREATE TRIGGER update_enterprise_scenarios_updated_at
  BEFORE UPDATE ON public.enterprise_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_frameworks_updated_at
  BEFORE UPDATE ON public.compliance_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compliance_deadlines_updated_at
  BEFORE UPDATE ON public.compliance_deadlines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();