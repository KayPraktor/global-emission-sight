-- Create SECURITY DEFINER function to create organizations
CREATE OR REPLACE FUNCTION public.create_user_organization(org_name text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  v_user_id uuid;
  v_email text;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user already has an organization
  IF EXISTS (SELECT 1 FROM organization_members WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'User already belongs to an organization';
  END IF;
  
  -- Get user email for default org name
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  
  -- Create organization
  INSERT INTO organizations (name)
  VALUES (COALESCE(org_name, v_email || '''s Organization'))
  RETURNING id INTO new_org_id;
  
  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (new_org_id, v_user_id, 'owner');
  
  RETURN new_org_id;
END;
$$;

-- Ensure trigger exists for new user signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();