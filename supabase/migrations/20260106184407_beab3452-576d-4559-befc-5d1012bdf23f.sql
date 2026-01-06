-- Emission factor external sources registry
CREATE TABLE public.emission_factor_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  url TEXT,
  api_endpoint TEXT,
  requires_api_key BOOLEAN DEFAULT false,
  is_enabled BOOLEAN DEFAULT true,
  sync_frequency TEXT DEFAULT 'weekly',
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staging table for fetched updates
CREATE TABLE public.emission_factor_updates_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.emission_factor_sources(id) ON DELETE CASCADE,
  external_id TEXT,
  factor_name TEXT NOT NULL,
  factor_category TEXT,
  factor_scope TEXT,
  factor_value NUMERIC NOT NULL,
  factor_unit TEXT,
  region TEXT,
  year INTEGER,
  methodology TEXT,
  raw_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'rejected', 'duplicate')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI-analyzed changes pending review
CREATE TABLE public.emission_factor_change_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staging_id UUID REFERENCES public.emission_factor_updates_staging(id) ON DELETE CASCADE,
  existing_factor_id UUID REFERENCES public.emission_factors(id) ON DELETE SET NULL,
  factor_name TEXT NOT NULL,
  old_value NUMERIC,
  new_value NUMERIC NOT NULL,
  change_percentage NUMERIC,
  ai_significance TEXT CHECK (ai_significance IN ('low', 'medium', 'high', 'critical')),
  ai_impact_assessment TEXT,
  ai_recommendation TEXT CHECK (ai_recommendation IN ('auto_apply', 'require_review', 'investigate', 'reject')),
  ai_confidence NUMERIC,
  ai_analysis JSONB,
  affected_entries_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_applied')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync operation audit logs
CREATE TABLE public.emission_factor_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.emission_factor_sources(id) ON DELETE CASCADE,
  sync_type TEXT DEFAULT 'scheduled' CHECK (sync_type IN ('scheduled', 'manual', 'webhook')),
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  factors_fetched INTEGER DEFAULT 0,
  factors_new INTEGER DEFAULT 0,
  factors_updated INTEGER DEFAULT 0,
  factors_unchanged INTEGER DEFAULT 0,
  errors JSONB,
  duration_ms INTEGER,
  triggered_by UUID,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.emission_factor_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factor_updates_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factor_change_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factor_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - sources are globally readable, admin writable
CREATE POLICY "Anyone can read emission factor sources"
ON public.emission_factor_sources FOR SELECT
USING (true);

CREATE POLICY "Admins can manage emission factor sources"
ON public.emission_factor_sources FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Staging table - service role only (edge functions)
CREATE POLICY "Service role can manage staging"
ON public.emission_factor_updates_staging FOR ALL
USING (true);

-- Change reviews - org members can view/manage their org's reviews
CREATE POLICY "Org members can view change reviews"
ON public.emission_factor_change_reviews FOR SELECT
USING (
  organization_id IS NULL OR 
  public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "Org supervisors can manage change reviews"
ON public.emission_factor_change_reviews FOR ALL
USING (
  organization_id IS NULL OR 
  public.is_org_supervisor(auth.uid(), organization_id)
);

-- Sync logs - globally readable
CREATE POLICY "Anyone can read sync logs"
ON public.emission_factor_sync_logs FOR SELECT
USING (true);

-- Insert default sources
INSERT INTO public.emission_factor_sources (name, code, description, url, sync_frequency) VALUES
('EPA eGRID', 'epa_egrid', 'US Environmental Protection Agency electricity emission factors', 'https://www.epa.gov/egrid', 'monthly'),
('UK DEFRA', 'uk_defra', 'UK Department for Environment, Food & Rural Affairs GHG conversion factors', 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting', 'yearly'),
('IEA Emission Factors', 'iea', 'International Energy Agency CO2 emission factors', 'https://www.iea.org/data-and-statistics', 'yearly'),
('GHG Protocol', 'ghg_protocol', 'GHG Protocol calculation tools and emission factors', 'https://ghgprotocol.org/calculation-tools', 'yearly');

-- Trigger for updated_at
CREATE TRIGGER update_emission_factor_sources_updated_at
  BEFORE UPDATE ON public.emission_factor_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emission_factor_change_reviews_updated_at
  BEFORE UPDATE ON public.emission_factor_change_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();