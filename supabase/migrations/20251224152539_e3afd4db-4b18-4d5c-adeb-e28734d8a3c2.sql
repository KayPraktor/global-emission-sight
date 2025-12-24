-- Create audit_logs table for comprehensive action tracking
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_org_date ON public.audit_logs(organization_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_date ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
CREATE POLICY "Org members can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  organization_id IN (
    SELECT organization_id FROM public.organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.organization_members
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  INSERT INTO public.audit_logs (
    user_id,
    organization_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    v_org_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_values,
    p_new_values,
    p_metadata
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Create function to check analyst/auditor role
CREATE OR REPLACE FUNCTION public.is_analyst_or_auditor(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('reporting_analyst', 'auditor', 'admin')
  )
$$;