-- Migration: Phase 3 Advanced Analytics Tables

-- 1. Emissions Forecasts Table
CREATE TABLE IF NOT EXISTS public.emissions_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  period DATE NOT NULL,
  scope TEXT NOT NULL,
  predicted_emissions DECIMAL(15,6) NOT NULL,
  confidence_score DECIMAL(5,2) DEFAULT 0.70,
  upper_bound DECIMAL(15,6),
  lower_bound DECIMAL(15,6),
  model_version TEXT DEFAULT 'v1.0',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emissions_forecasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for forecasts
CREATE POLICY "Users can view own forecasts" 
ON public.emissions_forecasts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forecasts" 
ON public.emissions_forecasts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forecasts" 
ON public.emissions_forecasts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forecasts" 
ON public.emissions_forecasts FOR DELETE 
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_forecasts_user_period ON public.emissions_forecasts(user_id, period);

-- 2. Emissions Anomalies Table
CREATE TABLE IF NOT EXISTS public.emissions_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_id UUID REFERENCES public.emissions_entries(id) ON DELETE CASCADE,
  anomaly_type TEXT NOT NULL CHECK (anomaly_type IN ('spike', 'drop', 'pattern_break', 'seasonal_deviation')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  z_score DECIMAL(10,4),
  expected_value DECIMAL(15,6),
  actual_value DECIMAL(15,6),
  deviation_percentage DECIMAL(5,2),
  description TEXT,
  recommendation TEXT,
  is_acknowledged BOOLEAN DEFAULT false,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emissions_anomalies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for anomalies
CREATE POLICY "Users can view own anomalies" 
ON public.emissions_anomalies FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own anomalies" 
ON public.emissions_anomalies FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own anomalies" 
ON public.emissions_anomalies FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own anomalies" 
ON public.emissions_anomalies FOR DELETE 
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_anomalies_user_severity ON public.emissions_anomalies(user_id, severity) WHERE is_acknowledged = false;
CREATE INDEX idx_anomalies_entry ON public.emissions_anomalies(entry_id);

-- 3. Emissions Insights Table (AI-generated)
CREATE TABLE IF NOT EXISTS public.emissions_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('efficiency', 'reduction', 'risk', 'opportunity', 'compliance')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  finding TEXT,
  impact TEXT,
  recommendation TEXT,
  expected_benefit TEXT,
  timeframe TEXT,
  is_dismissed BOOLEAN DEFAULT false,
  is_actioned BOOLEAN DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  actioned_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emissions_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for insights
CREATE POLICY "Users can view own insights" 
ON public.emissions_insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights" 
ON public.emissions_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" 
ON public.emissions_insights FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" 
ON public.emissions_insights FOR DELETE 
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_insights_user_priority ON public.emissions_insights(user_id, priority) WHERE is_dismissed = false;
CREATE INDEX idx_insights_category ON public.emissions_insights(category);

-- 4. Industry Benchmarks Table (public reference data)
CREATE TABLE IF NOT EXISTS public.industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  naics_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('per_revenue', 'per_employee', 'per_sqft', 'per_unit')),
  unit TEXT NOT NULL,
  p10 DECIMAL(10,4),
  p25 DECIMAL(10,4),
  p50 DECIMAL(10,4),
  p75 DECIMAL(10,4),
  p90 DECIMAL(10,4),
  sample_size INTEGER,
  source TEXT,
  last_updated DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (public read-only)
ALTER TABLE public.industry_benchmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for benchmarks (read-only for all authenticated users)
CREATE POLICY "Benchmarks are viewable by authenticated users" 
ON public.industry_benchmarks FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Index for performance
CREATE INDEX idx_benchmarks_industry_year ON public.industry_benchmarks(industry, year);
CREATE INDEX idx_benchmarks_naics ON public.industry_benchmarks(naics_code);

-- Enable realtime for anomalies and insights
ALTER PUBLICATION supabase_realtime ADD TABLE public.emissions_anomalies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emissions_insights;

-- Insert sample industry benchmarks
INSERT INTO public.industry_benchmarks (industry, naics_code, year, metric_type, unit, p10, p25, p50, p75, p90, sample_size, source) VALUES
('Manufacturing - General', '31-33', 2024, 'per_revenue', 'tCO2e/$M', 8.5, 15.2, 28.5, 45.8, 72.3, 1250, 'CDP Global 500'),
('Manufacturing - General', '31-33', 2024, 'per_employee', 'tCO2e/FTE', 2.1, 3.8, 6.5, 10.2, 15.8, 1250, 'CDP Global 500'),
('Technology & Software', '51', 2024, 'per_revenue', 'tCO2e/$M', 1.2, 2.5, 4.8, 8.5, 14.2, 850, 'CDP Global 500'),
('Technology & Software', '51', 2024, 'per_employee', 'tCO2e/FTE', 0.8, 1.5, 2.8, 4.5, 7.2, 850, 'CDP Global 500'),
('Retail & Consumer Goods', '44-45', 2024, 'per_revenue', 'tCO2e/$M', 3.5, 6.8, 12.5, 21.3, 35.8, 980, 'CDP Global 500'),
('Healthcare & Pharmaceuticals', '62', 2024, 'per_revenue', 'tCO2e/$M', 4.2, 7.5, 13.8, 22.5, 38.5, 620, 'CDP Global 500'),
('Financial Services', '52', 2024, 'per_revenue', 'tCO2e/$M', 0.5, 1.2, 2.5, 4.8, 8.5, 1150, 'CDP Global 500'),
('Financial Services', '52', 2024, 'per_employee', 'tCO2e/FTE', 0.3, 0.7, 1.5, 2.8, 4.5, 1150, 'CDP Global 500'),
('Energy & Utilities', '22', 2024, 'per_revenue', 'tCO2e/$M', 125.5, 245.8, 485.2, 825.5, 1250.3, 420, 'CDP Global 500'),
('Transportation & Logistics', '48-49', 2024, 'per_revenue', 'tCO2e/$M', 15.8, 28.5, 52.3, 85.2, 135.8, 750, 'CDP Global 500');