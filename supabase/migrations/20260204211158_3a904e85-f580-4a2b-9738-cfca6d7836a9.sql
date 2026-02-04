-- Fix 1: Alter confidence_score column to allow percentage values (0.00-100.00)
ALTER TABLE public.calculations 
ALTER COLUMN confidence_score TYPE NUMERIC(5,2);

-- Fix 2: Add user-based SELECT policy for quality_tracking
CREATE POLICY "Users can view own quality tracking"
ON public.quality_tracking
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add UPDATE policy for quality_tracking (needed for upserts)
CREATE POLICY "Users can update own quality tracking"
ON public.quality_tracking  
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);