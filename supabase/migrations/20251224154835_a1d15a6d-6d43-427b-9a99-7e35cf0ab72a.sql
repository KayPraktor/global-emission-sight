-- Create carbon credit types enum
DO $$ 
BEGIN
  CREATE TYPE public.carbon_credit_type AS ENUM ('VCU', 'GCC', 'CER', 'EUA', 'ACR', 'CAR', 'GS_VER', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create carbon credit status enum
DO $$ 
BEGIN
  CREATE TYPE public.carbon_credit_status AS ENUM ('active', 'retired', 'sold', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create roi period type enum
DO $$ 
BEGIN
  CREATE TYPE public.roi_period_type AS ENUM ('monthly', 'quarterly', 'yearly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create carbon_credits table
CREATE TABLE IF NOT EXISTS public.carbon_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  credit_type public.carbon_credit_type NOT NULL DEFAULT 'VCU',
  vintage_year INTEGER NOT NULL,
  quantity NUMERIC NOT NULL,
  purchase_price NUMERIC,
  current_price NUMERIC,
  currency TEXT DEFAULT 'USD',
  registry TEXT,
  project_name TEXT,
  project_type TEXT,
  project_location TEXT,
  status public.carbon_credit_status NOT NULL DEFAULT 'active',
  purchase_date DATE,
  retirement_date DATE,
  retirement_purpose TEXT,
  serial_numbers TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roi_tracking table
CREATE TABLE IF NOT EXISTS public.roi_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  period public.roi_period_type NOT NULL DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  platform_cost NUMERIC DEFAULT 0,
  time_saved_hours NUMERIC DEFAULT 0,
  estimated_hourly_rate NUMERIC DEFAULT 75,
  time_savings_value NUMERIC GENERATED ALWAYS AS (time_saved_hours * estimated_hourly_rate) STORED,
  carbon_credits_value NUMERIC DEFAULT 0,
  carbon_credits_change NUMERIC DEFAULT 0,
  compliance_savings NUMERIC DEFAULT 0,
  penalty_avoidance NUMERIC DEFAULT 0,
  data_quality_savings NUMERIC DEFAULT 0,
  report_automation_savings NUMERIC DEFAULT 0,
  total_roi_value NUMERIC DEFAULT 0,
  roi_percentage NUMERIC DEFAULT 0,
  emissions_tracked NUMERIC DEFAULT 0,
  entries_processed INTEGER DEFAULT 0,
  reports_generated INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_prices table for market tracking
CREATE TABLE IF NOT EXISTS public.carbon_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_type TEXT NOT NULL,
  price_per_tonne NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  effective_date DATE NOT NULL,
  source TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carbon_credits_org ON public.carbon_credits(organization_id);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_user ON public.carbon_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_status ON public.carbon_credits(status);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_type ON public.carbon_credits(credit_type);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_org ON public.roi_tracking(organization_id);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_user ON public.roi_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_period ON public.roi_tracking(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_carbon_prices_type ON public.carbon_prices(price_type);
CREATE INDEX IF NOT EXISTS idx_carbon_prices_date ON public.carbon_prices(effective_date);

-- Enable RLS
ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roi_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_prices ENABLE ROW LEVEL SECURITY;

-- RLS policies for carbon_credits
CREATE POLICY "Users can view their organization's carbon credits"
  ON public.carbon_credits FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert carbon credits for their organization"
  ON public.carbon_credits FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can update their organization's carbon credits"
  ON public.carbon_credits FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete their organization's carbon credits"
  ON public.carbon_credits FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- RLS policies for roi_tracking
CREATE POLICY "Users can view their organization's ROI tracking"
  ON public.roi_tracking FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert ROI tracking for their organization"
  ON public.roi_tracking FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can update their organization's ROI tracking"
  ON public.roi_tracking FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- RLS policies for carbon_prices (public read, admin write)
CREATE POLICY "Anyone can view carbon prices"
  ON public.carbon_prices FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert carbon prices"
  ON public.carbon_prices FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default carbon prices
INSERT INTO public.carbon_prices (price_type, price_per_tonne, currency, effective_date, source) VALUES
  ('EUA', 65.50, 'USD', CURRENT_DATE, 'EU ETS'),
  ('VCU', 12.00, 'USD', CURRENT_DATE, 'Verra Registry'),
  ('CER', 8.50, 'USD', CURRENT_DATE, 'UNFCCC'),
  ('GCC', 45.00, 'USD', CURRENT_DATE, 'Gold Standard'),
  ('ACR', 15.00, 'USD', CURRENT_DATE, 'American Carbon Registry')
ON CONFLICT DO NOTHING;

-- Create trigger for updated_at on carbon_credits
CREATE OR REPLACE FUNCTION public.update_carbon_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_carbon_credits_updated_at ON public.carbon_credits;
CREATE TRIGGER update_carbon_credits_updated_at
  BEFORE UPDATE ON public.carbon_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_carbon_credits_updated_at();