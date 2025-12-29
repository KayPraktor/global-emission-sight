-- CSRD/ISSB Disclosure Tracking
CREATE TABLE public.csrd_disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  disclosure_standard TEXT NOT NULL, -- 'ESRS_E1', 'ISSB_S2', 'GRI', 'CDP'
  disclosure_id TEXT NOT NULL, -- 'E1-1', 'E1-2', etc.
  disclosure_name TEXT NOT NULL,
  status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'draft', 'review', 'complete'
  completeness_score INTEGER DEFAULT 0,
  data_quality_score INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  reviewer_id UUID,
  review_notes TEXT,
  due_date DATE,
  content JSONB, -- Stores the actual disclosure content
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Data Gap Analysis
CREATE TABLE public.compliance_data_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  disclosure_id TEXT NOT NULL,
  disclosure_name TEXT NOT NULL,
  gap_type TEXT NOT NULL, -- 'missing_data', 'quality_issue', 'methodology_gap', 'coverage_gap'
  description TEXT NOT NULL,
  severity TEXT NOT NULL, -- 'critical', 'high', 'medium', 'low'
  recommendation TEXT,
  estimated_effort TEXT, -- 'low', 'medium', 'high'
  resolution_status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'accepted_risk'
  owner_id UUID,
  due_date DATE,
  resolved_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ISSB Assessment Responses
CREATE TABLE public.issb_assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Governance', 'Strategy', 'Risk Management', 'Metrics & Targets'
  response TEXT NOT NULL, -- 'yes', 'partial', 'no'
  notes TEXT,
  evidence_links TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE public.csrd_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_data_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issb_assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for csrd_disclosures
CREATE POLICY "Users can view their own disclosures"
  ON public.csrd_disclosures FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own disclosures"
  ON public.csrd_disclosures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own disclosures"
  ON public.csrd_disclosures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own disclosures"
  ON public.csrd_disclosures FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for compliance_data_gaps
CREATE POLICY "Users can view their own gaps"
  ON public.compliance_data_gaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gaps"
  ON public.compliance_data_gaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gaps"
  ON public.compliance_data_gaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gaps"
  ON public.compliance_data_gaps FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for issb_assessment_responses
CREATE POLICY "Users can view their own responses"
  ON public.issb_assessment_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own responses"
  ON public.issb_assessment_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
  ON public.issb_assessment_responses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own responses"
  ON public.issb_assessment_responses FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_csrd_disclosures_org ON public.csrd_disclosures(organization_id);
CREATE INDEX idx_csrd_disclosures_user ON public.csrd_disclosures(user_id);
CREATE INDEX idx_csrd_disclosures_standard ON public.csrd_disclosures(disclosure_standard);
CREATE INDEX idx_compliance_gaps_org ON public.compliance_data_gaps(organization_id);
CREATE INDEX idx_compliance_gaps_severity ON public.compliance_data_gaps(severity);
CREATE INDEX idx_issb_responses_org ON public.issb_assessment_responses(organization_id);

-- Trigger for updated_at
CREATE TRIGGER update_issb_responses_updated_at
  BEFORE UPDATE ON public.issb_assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();