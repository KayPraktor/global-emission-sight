-- Add version tracking to emission_factors
ALTER TABLE public.emission_factors
ADD COLUMN version VARCHAR(20) DEFAULT '1.0',
ADD COLUMN is_latest BOOLEAN DEFAULT true,
ADD COLUMN superseded_by UUID REFERENCES public.emission_factors(id),
ADD COLUMN version_notes TEXT,
ADD COLUMN published_date DATE DEFAULT CURRENT_DATE;

-- Create table to track user's active factor versions
CREATE TABLE public.user_emission_factor_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emission_factor_id UUID NOT NULL REFERENCES public.emission_factors(id) ON DELETE CASCADE,
  locked_version VARCHAR(20) NOT NULL,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  auto_update BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, emission_factor_id)
);

-- Create table for factor update notifications
CREATE TABLE public.emission_factor_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_factor_id UUID NOT NULL REFERENCES public.emission_factors(id),
  new_factor_id UUID NOT NULL REFERENCES public.emission_factors(id),
  notification_type VARCHAR(50) DEFAULT 'version_update',
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_emission_factor_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emission_factor_updates ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_emission_factor_versions
CREATE POLICY "Users can view own factor versions"
  ON public.user_emission_factor_versions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own factor versions"
  ON public.user_emission_factor_versions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own factor versions"
  ON public.user_emission_factor_versions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own factor versions"
  ON public.user_emission_factor_versions
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for emission_factor_updates
CREATE POLICY "Users can view own update notifications"
  ON public.emission_factor_updates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.emission_factor_updates
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_user_emission_factor_versions_updated_at
  BEFORE UPDATE ON public.user_emission_factor_versions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emission_factor_updates_updated_at
  BEFORE UPDATE ON public.emission_factor_updates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check for factor updates
CREATE OR REPLACE FUNCTION public.check_emission_factor_updates()
RETURNS TABLE (
  user_id UUID,
  old_factor_id UUID,
  new_factor_id UUID,
  old_version VARCHAR,
  new_version VARCHAR,
  factor_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uefv.user_id,
    uefv.emission_factor_id as old_factor_id,
    ef_new.id as new_factor_id,
    ef_old.version as old_version,
    ef_new.version as new_version,
    ef_old.name as factor_name
  FROM public.user_emission_factor_versions uefv
  JOIN public.emission_factors ef_old ON uefv.emission_factor_id = ef_old.id
  JOIN public.emission_factors ef_new ON ef_old.superseded_by = ef_new.id
  WHERE ef_new.is_latest = true
    AND uefv.auto_update = false
    AND NOT EXISTS (
      SELECT 1 FROM public.emission_factor_updates efu
      WHERE efu.user_id = uefv.user_id
        AND efu.new_factor_id = ef_new.id
        AND efu.is_dismissed = false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;