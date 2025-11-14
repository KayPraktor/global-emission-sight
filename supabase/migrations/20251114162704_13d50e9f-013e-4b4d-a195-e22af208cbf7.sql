-- Add organization_id to all data tables for proper multi-tenant isolation
ALTER TABLE public.facilities ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.emissions_entries ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.emission_factors ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.goals ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.emission_scenarios ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.emissions_insights ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.emissions_anomalies ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.emissions_forecasts ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.data_quality_metrics ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.report_branding_settings ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.user_notification_preferences ADD COLUMN organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Create function to get user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id 
  FROM public.organization_members 
  WHERE user_id = _user_id 
  LIMIT 1;
$$;

-- Create function to check organization membership
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  );
$$;

-- Drop old RLS policies and create new organization-scoped ones
DROP POLICY IF EXISTS "Users can view own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Users can insert own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Users can update own facilities" ON public.facilities;
DROP POLICY IF EXISTS "Users can delete own facilities" ON public.facilities;

CREATE POLICY "Users can view organization facilities" ON public.facilities
FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert organization facilities" ON public.facilities
FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update organization facilities" ON public.facilities
FOR UPDATE USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete organization facilities" ON public.facilities
FOR DELETE USING (
  public.is_org_member(auth.uid(), organization_id) AND
  public.has_role(auth.uid(), 'admin')
);

-- Update emissions_entries RLS
DROP POLICY IF EXISTS "Users can view own emissions entries" ON public.emissions_entries;
DROP POLICY IF EXISTS "Users can insert own emissions entries" ON public.emissions_entries;
DROP POLICY IF EXISTS "Users can update own emissions entries" ON public.emissions_entries;
DROP POLICY IF EXISTS "Users can delete own emissions entries" ON public.emissions_entries;

CREATE POLICY "Users can view organization emissions" ON public.emissions_entries
FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert organization emissions" ON public.emissions_entries
FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update organization emissions" ON public.emissions_entries
FOR UPDATE USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete organization emissions" ON public.emissions_entries
FOR DELETE USING (public.is_org_member(auth.uid(), organization_id));

-- Update emission_factors RLS
DROP POLICY IF EXISTS "Users can view standard and own emission factors" ON public.emission_factors;
DROP POLICY IF EXISTS "Users can insert own emission factors" ON public.emission_factors;
DROP POLICY IF EXISTS "Users can update own emission factors" ON public.emission_factors;
DROP POLICY IF EXISTS "Users can delete own emission factors" ON public.emission_factors;

CREATE POLICY "Users can view standard and org emission factors" ON public.emission_factors
FOR SELECT USING (
  user_id IS NULL OR 
  (organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id))
);

CREATE POLICY "Users can insert org emission factors" ON public.emission_factors
FOR INSERT WITH CHECK (
  organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "Users can update org emission factors" ON public.emission_factors
FOR UPDATE USING (
  organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id)
);

CREATE POLICY "Users can delete org emission factors" ON public.emission_factors
FOR DELETE USING (
  organization_id IS NOT NULL AND public.is_org_member(auth.uid(), organization_id)
);

-- Update goals RLS
DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;

CREATE POLICY "Users can view organization goals" ON public.goals
FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert organization goals" ON public.goals
FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update organization goals" ON public.goals
FOR UPDATE USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete organization goals" ON public.goals
FOR DELETE USING (public.is_org_member(auth.uid(), organization_id));

-- Update reports RLS
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;

CREATE POLICY "Users can view organization reports" ON public.reports
FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert organization reports" ON public.reports
FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update organization reports" ON public.reports
FOR UPDATE USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete organization reports" ON public.reports
FOR DELETE USING (
  public.is_org_member(auth.uid(), organization_id) AND
  public.has_role(auth.uid(), 'admin')
);

-- Update scenarios RLS
DROP POLICY IF EXISTS "Users can view own scenarios" ON public.emission_scenarios;
DROP POLICY IF EXISTS "Users can insert own scenarios" ON public.emission_scenarios;
DROP POLICY IF EXISTS "Users can update own scenarios" ON public.emission_scenarios;
DROP POLICY IF EXISTS "Users can delete own scenarios" ON public.emission_scenarios;

CREATE POLICY "Users can view organization scenarios" ON public.emission_scenarios
FOR SELECT USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert organization scenarios" ON public.emission_scenarios
FOR INSERT WITH CHECK (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can update organization scenarios" ON public.emission_scenarios
FOR UPDATE USING (public.is_org_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete organization scenarios" ON public.emission_scenarios
FOR DELETE USING (public.is_org_member(auth.uid(), organization_id));

-- Create trigger to auto-assign organization on insert
CREATE OR REPLACE FUNCTION public.set_organization_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    NEW.organization_id := public.get_user_organization(auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_facilities_org_id BEFORE INSERT ON public.facilities
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_emissions_org_id BEFORE INSERT ON public.emissions_entries
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_factors_org_id BEFORE INSERT ON public.emission_factors
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_goals_org_id BEFORE INSERT ON public.goals
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_reports_org_id BEFORE INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

CREATE TRIGGER set_scenarios_org_id BEFORE INSERT ON public.emission_scenarios
FOR EACH ROW EXECUTE FUNCTION public.set_organization_id();

-- Update handle_new_user to create organization and assign owner role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );

  -- Create organization
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email || '''s Organization'))
  RETURNING id INTO new_org_id;

  -- Add user as organization owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$;