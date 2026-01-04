-- Stakeholder registry
CREATE TABLE public.stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  influence TEXT NOT NULL,
  interest TEXT NOT NULL,
  engagement_methods TEXT[],
  topic_priorities TEXT[],
  last_engaged TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materiality assessments
CREATE TABLE public.materiality_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id),
  user_id UUID NOT NULL,
  topic_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  topic_category TEXT NOT NULL,
  esrs_standard TEXT,
  
  -- Impact materiality
  impact_scale INTEGER,
  impact_scope INTEGER,
  impact_irremediability INTEGER,
  impact_likelihood INTEGER,
  impact_score NUMERIC,
  
  -- Financial materiality
  financial_magnitude INTEGER,
  financial_likelihood INTEGER,
  financial_time_horizon TEXT,
  financial_score NUMERIC,
  
  is_material BOOLEAN DEFAULT FALSE,
  stakeholder_ids UUID[],
  evidence TEXT,
  assessed_by UUID,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiality_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stakeholders
CREATE POLICY "Users can view stakeholders in their organization" 
  ON public.stakeholders FOR SELECT 
  USING (auth.uid() = user_id OR organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create stakeholders" 
  ON public.stakeholders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stakeholders" 
  ON public.stakeholders FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stakeholders" 
  ON public.stakeholders FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for materiality_assessments
CREATE POLICY "Users can view assessments in their organization" 
  ON public.materiality_assessments FOR SELECT 
  USING (auth.uid() = user_id OR organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create assessments" 
  ON public.materiality_assessments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
  ON public.materiality_assessments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments" 
  ON public.materiality_assessments FOR DELETE 
  USING (auth.uid() = user_id);