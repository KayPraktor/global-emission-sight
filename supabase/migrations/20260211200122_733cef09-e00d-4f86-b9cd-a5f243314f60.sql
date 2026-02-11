
-- =============================================
-- Phase A1: Governance metrics & fiduciary duties tables
-- =============================================

CREATE TABLE public.governance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('oversight', 'strategy', 'risk_management', 'disclosure', 'engagement')),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_met' CHECK (status IN ('met', 'partial', 'not_met', 'not_applicable')),
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 3,
  evidence TEXT,
  last_review_date DATE,
  next_review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.governance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view governance metrics"
  ON public.governance_metrics FOR SELECT
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can insert governance metrics"
  ON public.governance_metrics FOR INSERT
  WITH CHECK (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can update governance metrics"
  ON public.governance_metrics FOR UPDATE
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can delete governance metrics"
  ON public.governance_metrics FOR DELETE
  USING (is_org_member(auth.uid(), organization_id));

CREATE TABLE public.fiduciary_duties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('disclosure', 'risk_oversight', 'strategic_planning', 'stakeholder_engagement', 'compliance')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('completed', 'in_progress', 'pending', 'overdue')),
  due_date DATE NOT NULL,
  assigned_to TEXT,
  completed_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  linked_regulations TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fiduciary_duties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view fiduciary duties"
  ON public.fiduciary_duties FOR SELECT
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can insert fiduciary duties"
  ON public.fiduciary_duties FOR INSERT
  WITH CHECK (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can update fiduciary duties"
  ON public.fiduciary_duties FOR UPDATE
  USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can delete fiduciary duties"
  ON public.fiduciary_duties FOR DELETE
  USING (is_org_member(auth.uid(), organization_id));

-- =============================================
-- Phase B1: Recalculation trigger on emission factor update
-- =============================================

CREATE OR REPLACE FUNCTION public.recalculate_on_factor_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.factor_value IS DISTINCT FROM NEW.factor_value THEN
    UPDATE public.calculations c
    SET 
      calculated_emissions = (ee.quantity * NEW.factor_value) / 1000.0,
      calculation_timestamp = now()
    FROM public.emissions_entries ee
    WHERE ee.id = c.emissions_entry_id
      AND c.emission_factor_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER recalculate_on_emission_factor_update
  AFTER UPDATE ON public.emission_factors
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_on_factor_update();

-- Updated_at triggers for new tables
CREATE TRIGGER update_governance_metrics_updated_at
  BEFORE UPDATE ON public.governance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fiduciary_duties_updated_at
  BEFORE UPDATE ON public.fiduciary_duties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
