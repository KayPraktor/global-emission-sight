-- Fix 1: Add unique constraint for enterprise_scenarios upsert
ALTER TABLE public.enterprise_scenarios 
ADD CONSTRAINT enterprise_scenarios_org_name_unique 
UNIQUE (organization_id, scenario_name);

-- Fix 2: Add UPDATE policy for enterprise_metrics
CREATE POLICY "Org members can update metrics"
ON public.enterprise_metrics
FOR UPDATE
TO authenticated
USING (is_org_member(auth.uid(), organization_id))
WITH CHECK (is_org_member(auth.uid(), organization_id));