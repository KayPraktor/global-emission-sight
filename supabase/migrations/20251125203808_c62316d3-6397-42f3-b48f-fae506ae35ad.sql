-- Create onboarding analytics table
CREATE TABLE public.onboarding_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_selected TEXT,
  custom_input TEXT,
  ai_recommended_path TEXT,
  ai_confidence NUMERIC,
  step_reached INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  time_spent_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.onboarding_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own analytics"
ON public.onboarding_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics"
ON public.onboarding_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics"
ON public.onboarding_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create onboarding feedback table
CREATE TABLE public.onboarding_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  improvements_suggested TEXT,
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.onboarding_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert own feedback"
ON public.onboarding_feedback
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
ON public.onboarding_feedback
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.onboarding_feedback
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create indexes for analytics queries
CREATE INDEX idx_onboarding_analytics_user_id ON public.onboarding_analytics(user_id);
CREATE INDEX idx_onboarding_analytics_challenge ON public.onboarding_analytics(challenge_selected);
CREATE INDEX idx_onboarding_analytics_completed ON public.onboarding_analytics(completed);
CREATE INDEX idx_onboarding_analytics_created_at ON public.onboarding_analytics(created_at);
CREATE INDEX idx_onboarding_feedback_user_id ON public.onboarding_feedback(user_id);
CREATE INDEX idx_onboarding_feedback_rating ON public.onboarding_feedback(rating);