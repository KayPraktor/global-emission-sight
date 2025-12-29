-- Drop and recreate the function with proper search_path
DROP FUNCTION IF EXISTS public.check_emission_factor_updates();

CREATE OR REPLACE FUNCTION public.check_emission_factor_updates()
RETURNS TABLE(user_id uuid, old_factor_id uuid, new_factor_id uuid, old_version character varying, new_version character varying, factor_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;