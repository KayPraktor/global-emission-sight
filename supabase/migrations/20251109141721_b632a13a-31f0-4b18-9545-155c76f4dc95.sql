-- Allow NULL user_id for standard emission factors
ALTER TABLE public.emission_factors 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow viewing standard factors
DROP POLICY IF EXISTS "Users can view own emission factors" ON public.emission_factors;

CREATE POLICY "Users can view standard and own emission factors" 
ON public.emission_factors 
FOR SELECT 
USING (
  user_id IS NULL OR auth.uid() = user_id
);

-- Add index for better performance when filtering standard factors
CREATE INDEX IF NOT EXISTS idx_emission_factors_standard 
ON public.emission_factors(user_id) 
WHERE user_id IS NULL;

-- Add index for category and scope filtering
CREATE INDEX IF NOT EXISTS idx_emission_factors_category_scope 
ON public.emission_factors(category, scope);
