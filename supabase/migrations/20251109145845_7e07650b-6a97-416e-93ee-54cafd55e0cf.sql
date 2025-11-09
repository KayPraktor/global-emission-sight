-- Create security definer function to check organization membership
CREATE OR REPLACE FUNCTION public.is_organization_member(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _organization_id
  )
$$;

-- Create function to check if user is organization owner
CREATE OR REPLACE FUNCTION public.is_organization_owner(_user_id uuid, _organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _organization_id
      AND role = 'owner'
  )
$$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can remove members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can add themselves to organizations" ON public.organization_members;

DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- Create new policies for organization_members using security definer functions
CREATE POLICY "Users can view organization members"
ON public.organization_members
FOR SELECT
USING (public.is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can add themselves as organization members"
ON public.organization_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update members"
ON public.organization_members
FOR UPDATE
USING (public.is_organization_owner(auth.uid(), organization_id));

CREATE POLICY "Owners can delete members"
ON public.organization_members
FOR DELETE
USING (public.is_organization_owner(auth.uid(), organization_id));

-- Create new policies for organizations using security definer functions
CREATE POLICY "Users can view their organizations"
ON public.organizations
FOR SELECT
USING (public.is_organization_member(auth.uid(), id));

CREATE POLICY "Anyone can create organizations"
ON public.organizations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Owners can update their organizations"
ON public.organizations
FOR UPDATE
USING (public.is_organization_owner(auth.uid(), id));

CREATE POLICY "Owners can delete their organizations"
ON public.organizations
FOR DELETE
USING (public.is_organization_owner(auth.uid(), id));