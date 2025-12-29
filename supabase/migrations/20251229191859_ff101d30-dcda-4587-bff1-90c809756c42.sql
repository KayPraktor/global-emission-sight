-- Fix enterprise_metrics INSERT policy - restrict to org members only
DROP POLICY IF EXISTS "System can insert metrics" ON public.enterprise_metrics;

-- Create helper function for org membership check (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;

-- Create proper INSERT policy for enterprise_metrics
CREATE POLICY "Org members can insert metrics"
  ON public.enterprise_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- Fix enterprise_insights INSERT policy - restrict to org members only
DROP POLICY IF EXISTS "System can insert insights" ON public.enterprise_insights;

CREATE POLICY "Org members can insert insights"
  ON public.enterprise_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), organization_id));

-- Fix update_carbon_credits_updated_at function with immutable search_path
CREATE OR REPLACE FUNCTION public.update_carbon_credits_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_supplier_updated_at function with immutable search_path
CREATE OR REPLACE FUNCTION public.update_supplier_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;