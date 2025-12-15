-- Create approval status enum
CREATE TYPE approval_status AS ENUM ('draft', 'pending_review', 'changes_requested', 'approved', 'rejected');

-- Add approval columns to emissions_entries
ALTER TABLE public.emissions_entries 
  ADD COLUMN IF NOT EXISTS approval_status approval_status DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_by UUID,
  ADD COLUMN IF NOT EXISTS assigned_reviewer UUID,
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- Create approval_requests table for audit trail
CREATE TABLE public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  entry_id UUID REFERENCES public.emissions_entries(id) ON DELETE CASCADE NOT NULL,
  requester_id UUID NOT NULL,
  reviewer_id UUID,
  status approval_status NOT NULL DEFAULT 'pending_review',
  request_message TEXT,
  review_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

-- Create is_org_supervisor function (checks if user is owner or admin)
CREATE OR REPLACE FUNCTION public.is_org_supervisor(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id 
    AND organization_id = _org_id
    AND role IN ('owner', 'admin')
  );
$$;

-- RLS Policies for approval_requests
CREATE POLICY "Org members can view approval requests"
ON public.approval_requests FOR SELECT
USING (is_org_member(auth.uid(), organization_id));

CREATE POLICY "Org members can create approval requests"
ON public.approval_requests FOR INSERT
WITH CHECK (auth.uid() = requester_id AND is_org_member(auth.uid(), organization_id));

CREATE POLICY "Supervisors can update approval requests"
ON public.approval_requests FOR UPDATE
USING (is_org_supervisor(auth.uid(), organization_id));

CREATE POLICY "Supervisors can delete approval requests"
ON public.approval_requests FOR DELETE
USING (is_org_supervisor(auth.uid(), organization_id));

-- Create trigger to notify supervisors when approval is submitted
CREATE OR REPLACE FUNCTION public.notify_approval_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert notifications for all org supervisors
  INSERT INTO public.notifications (user_id, organization_id, type, title, message, severity, related_id, related_table, action_url)
  SELECT 
    om.user_id,
    NEW.organization_id,
    'approval_request',
    'New Entry Pending Review',
    'An emissions entry has been submitted for your approval.',
    'info',
    NEW.id,
    'approval_requests',
    '/approvals'
  FROM public.organization_members om
  WHERE om.organization_id = NEW.organization_id
    AND om.role IN ('owner', 'admin')
    AND om.user_id != NEW.requester_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_approval_request_created
  AFTER INSERT ON public.approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_approval_submitted();

-- Create trigger to notify requester when approval is reviewed
CREATE OR REPLACE FUNCTION public.notify_approval_reviewed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending_review' AND NEW.status IN ('approved', 'rejected', 'changes_requested') THEN
    INSERT INTO public.notifications (user_id, organization_id, type, title, message, severity, related_id, related_table, action_url)
    VALUES (
      NEW.requester_id,
      NEW.organization_id,
      'approval_reviewed',
      CASE NEW.status
        WHEN 'approved' THEN 'Entry Approved'
        WHEN 'rejected' THEN 'Entry Rejected'
        WHEN 'changes_requested' THEN 'Changes Requested'
      END,
      COALESCE(NEW.review_message, 'Your emissions entry has been reviewed.'),
      CASE NEW.status
        WHEN 'approved' THEN 'info'
        WHEN 'rejected' THEN 'error'
        WHEN 'changes_requested' THEN 'warning'
      END,
      NEW.id,
      'approval_requests',
      '/data-entry'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_approval_request_reviewed
  AFTER UPDATE ON public.approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_approval_reviewed();