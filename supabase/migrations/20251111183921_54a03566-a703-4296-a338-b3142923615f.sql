-- Create table for emission scenarios
CREATE TABLE public.emission_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  baseline_year INTEGER NOT NULL,
  target_year INTEGER NOT NULL,
  baseline_emissions NUMERIC(15, 2) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for scenario interventions
CREATE TABLE public.scenario_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.emission_scenarios(id) ON DELETE CASCADE,
  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'renewable_energy', 
    'energy_efficiency', 
    'fleet_electrification',
    'renewable_heat',
    'carbon_capture',
    'waste_reduction',
    'supplier_engagement',
    'business_travel_reduction',
    'remote_work',
    'sustainable_materials',
    'other'
  )),
  name TEXT NOT NULL,
  description TEXT,
  implementation_year INTEGER NOT NULL,
  reduction_percentage NUMERIC(5, 2) NOT NULL,
  affected_scope TEXT[] NOT NULL,
  annual_cost NUMERIC(15, 2),
  one_time_cost NUMERIC(15, 2),
  roi_years NUMERIC(5, 2),
  confidence_level TEXT DEFAULT 'medium' CHECK (confidence_level IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create table for scenario projections (yearly breakdown)
CREATE TABLE public.scenario_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES public.emission_scenarios(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  projected_emissions NUMERIC(15, 2) NOT NULL,
  scope_1_emissions NUMERIC(15, 2),
  scope_2_emissions NUMERIC(15, 2),
  scope_3_emissions NUMERIC(15, 2),
  cumulative_reduction NUMERIC(15, 2),
  total_investment NUMERIC(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(scenario_id, year)
);

-- Enable RLS
ALTER TABLE public.emission_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_projections ENABLE ROW LEVEL SECURITY;

-- RLS policies for emission_scenarios
CREATE POLICY "Users can view own scenarios"
  ON public.emission_scenarios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scenarios"
  ON public.emission_scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scenarios"
  ON public.emission_scenarios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scenarios"
  ON public.emission_scenarios FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for scenario_interventions
CREATE POLICY "Users can view interventions of own scenarios"
  ON public.scenario_interventions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_interventions.scenario_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert interventions to own scenarios"
  ON public.scenario_interventions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_interventions.scenario_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update interventions of own scenarios"
  ON public.scenario_interventions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_interventions.scenario_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete interventions from own scenarios"
  ON public.scenario_interventions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_interventions.scenario_id
    AND user_id = auth.uid()
  ));

-- RLS policies for scenario_projections
CREATE POLICY "Users can view projections of own scenarios"
  ON public.scenario_projections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_projections.scenario_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert projections to own scenarios"
  ON public.scenario_projections FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_projections.scenario_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update projections of own scenarios"
  ON public.scenario_projections FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_projections.scenario_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete projections from own scenarios"
  ON public.scenario_projections FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.emission_scenarios
    WHERE id = scenario_projections.scenario_id
    AND user_id = auth.uid()
  ));

-- Triggers
CREATE TRIGGER update_emission_scenarios_updated_at
  BEFORE UPDATE ON public.emission_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scenario_interventions_updated_at
  BEFORE UPDATE ON public.scenario_interventions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();