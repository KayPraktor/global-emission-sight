-- Create report branding settings table
CREATE TABLE IF NOT EXISTS public.report_branding_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_name TEXT,
  company_logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  secondary_color TEXT DEFAULT '#1e40af',
  header_text TEXT,
  footer_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_branding UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.report_branding_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own branding settings"
ON public.report_branding_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own branding settings"
ON public.report_branding_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own branding settings"
ON public.report_branding_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_report_branding_settings_updated_at
BEFORE UPDATE ON public.report_branding_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index
CREATE INDEX idx_report_branding_user_id ON public.report_branding_settings(user_id);