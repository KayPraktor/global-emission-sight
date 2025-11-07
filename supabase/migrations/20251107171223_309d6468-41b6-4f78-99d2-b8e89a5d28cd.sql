-- Create enums for emissions tracking
CREATE TYPE public.emission_scope AS ENUM ('S1', 'S2', 'S3');
CREATE TYPE public.emission_unit AS ENUM ('kWh', 'MWh', 'L', 'kg', 't', 'm3', 'km');
CREATE TYPE public.ef_unit AS ENUM ('kgCO2e/kWh', 'kgCO2e/MWh', 'kgCO2e/L', 'kgCO2e/kg', 'kgCO2e/t', 'kgCO2e/m3', 'kgCO2e/km');
CREATE TYPE public.facility_type AS ENUM ('office', 'warehouse', 'factory', 'retail', 'datacenter', 'other');
CREATE TYPE public.goal_status AS ENUM ('not_started', 'in_progress', 'at_risk', 'completed', 'overdue');
CREATE TYPE public.report_status AS ENUM ('draft', 'pending', 'approved', 'published');

-- Facilities Table
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  facility_type public.facility_type NOT NULL DEFAULT 'office',
  country_code TEXT NOT NULL, -- ISO-2 country code
  city TEXT,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  area_sqm DECIMAL(10, 2),
  employees INTEGER,
  annual_revenue DECIMAL(15, 2),
  industry TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emission Factors Table
CREATE TABLE public.emission_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- e.g., 'electricity', 'natural_gas', 'fuel'
  scope public.emission_scope NOT NULL,
  factor_value DECIMAL(15, 6) NOT NULL, -- kgCO2e per unit
  unit public.ef_unit NOT NULL,
  source TEXT NOT NULL, -- e.g., 'EPA', 'DEFRA', 'Custom'
  methodology TEXT DEFAULT 'GHG Protocol',
  region TEXT, -- e.g., 'US', 'EU', 'Global'
  country_code TEXT, -- ISO-2 country code for regional factors
  year INTEGER,
  uncertainty DECIMAL(5, 2), -- percentage
  is_custom BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Emissions Entries Table
CREATE TABLE public.emissions_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  emission_factor_id UUID REFERENCES public.emission_factors(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  scope public.emission_scope NOT NULL,
  category TEXT NOT NULL,
  activity_type TEXT, -- e.g., 'stationary_combustion', 'purchased_electricity'
  quantity DECIMAL(15, 4) NOT NULL,
  unit public.emission_unit NOT NULL,
  calculation_method TEXT DEFAULT 'GHG Protocol',
  notes TEXT,
  data_quality_score DECIMAL(3, 2), -- 0.00 to 1.00
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Calculations Table (Audit trail for calculated emissions)
CREATE TABLE public.calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emissions_entry_id UUID NOT NULL REFERENCES public.emissions_entries(id) ON DELETE CASCADE,
  emission_factor_id UUID NOT NULL REFERENCES public.emission_factors(id) ON DELETE RESTRICT,
  calculated_emissions DECIMAL(15, 6) NOT NULL, -- tCO2e
  uncertainty DECIMAL(5, 2), -- percentage
  confidence_score DECIMAL(3, 2), -- 0.00 to 1.00
  calculation_formula TEXT,
  calculation_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Goals Table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES public.facilities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_reduction_percentage DECIMAL(5, 2), -- e.g., 30.00 for 30%
  baseline_emissions DECIMAL(15, 6), -- tCO2e
  baseline_year INTEGER,
  target_emissions DECIMAL(15, 6), -- tCO2e
  target_date DATE NOT NULL,
  status public.goal_status DEFAULT 'not_started',
  scope_covered TEXT[], -- e.g., ['S1', 'S2']
  current_emissions DECIMAL(15, 6), -- tCO2e - updated periodically
  progress_percentage DECIMAL(5, 2), -- calculated field
  milestones JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports Table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  report_type TEXT NOT NULL, -- e.g., 'annual', 'quarterly', 'custom'
  status public.report_status DEFAULT 'draft',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_emissions DECIMAL(15, 6), -- tCO2e
  scope_1_emissions DECIMAL(15, 6),
  scope_2_emissions DECIMAL(15, 6),
  scope_3_emissions DECIMAL(15, 6),
  facilities_included UUID[],
  file_url TEXT, -- URL to generated PDF/Excel file
  generated_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emissions_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for facilities
CREATE POLICY "Users can view own facilities" ON public.facilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own facilities" ON public.facilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own facilities" ON public.facilities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own facilities" ON public.facilities
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for emission_factors
CREATE POLICY "Users can view own emission factors" ON public.emission_factors
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emission factors" ON public.emission_factors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emission factors" ON public.emission_factors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emission factors" ON public.emission_factors
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for emissions_entries
CREATE POLICY "Users can view own emissions entries" ON public.emissions_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emissions entries" ON public.emissions_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emissions entries" ON public.emissions_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emissions entries" ON public.emissions_entries
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for calculations
CREATE POLICY "Users can view own calculations" ON public.calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calculations" ON public.calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_facilities_user_id ON public.facilities(user_id);
CREATE INDEX idx_facilities_country ON public.facilities(country_code);
CREATE INDEX idx_emission_factors_user_id ON public.emission_factors(user_id);
CREATE INDEX idx_emission_factors_category ON public.emission_factors(category);
CREATE INDEX idx_emission_factors_scope ON public.emission_factors(scope);
CREATE INDEX idx_emissions_entries_user_id ON public.emissions_entries(user_id);
CREATE INDEX idx_emissions_entries_facility_id ON public.emissions_entries(facility_id);
CREATE INDEX idx_emissions_entries_date ON public.emissions_entries(entry_date);
CREATE INDEX idx_emissions_entries_scope ON public.emissions_entries(scope);
CREATE INDEX idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX idx_calculations_entry_id ON public.calculations(emissions_entry_id);
CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_emission_factors_updated_at
  BEFORE UPDATE ON public.emission_factors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_emissions_entries_updated_at
  BEFORE UPDATE ON public.emissions_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically calculate emissions when entry is created/updated
CREATE OR REPLACE FUNCTION public.calculate_emissions_on_entry()
RETURNS TRIGGER AS $$
DECLARE
  factor_value DECIMAL(15, 6);
  calculated_co2e DECIMAL(15, 6);
  factor_uncertainty DECIMAL(5, 2);
BEGIN
  -- Get the emission factor value
  SELECT ef.factor_value, ef.uncertainty
  INTO factor_value, factor_uncertainty
  FROM public.emission_factors ef
  WHERE ef.id = NEW.emission_factor_id;
  
  -- Calculate emissions (quantity * factor_value) and convert to tCO2e
  IF factor_value IS NOT NULL THEN
    calculated_co2e := (NEW.quantity * factor_value) / 1000.0; -- Convert kg to tonnes
    
    -- Insert into calculations table
    INSERT INTO public.calculations (
      user_id,
      emissions_entry_id,
      emission_factor_id,
      calculated_emissions,
      uncertainty,
      confidence_score,
      calculation_formula,
      calculation_timestamp
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.emission_factor_id,
      calculated_co2e,
      factor_uncertainty,
      0.85, -- Default confidence score
      'quantity * emission_factor / 1000',
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER auto_calculate_emissions
  AFTER INSERT OR UPDATE ON public.emissions_entries
  FOR EACH ROW
  WHEN (NEW.emission_factor_id IS NOT NULL)
  EXECUTE FUNCTION public.calculate_emissions_on_entry();