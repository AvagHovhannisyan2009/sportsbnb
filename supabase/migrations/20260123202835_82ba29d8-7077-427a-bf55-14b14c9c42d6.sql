-- Add Make.com webhook columns to venues table
ALTER TABLE public.venues 
ADD COLUMN IF NOT EXISTS make_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS make_webhook_events TEXT[] DEFAULT ARRAY['booking_created', 'booking_cancelled'];

-- Create platform_settings table for global admin webhooks
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on platform_settings
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read platform settings
CREATE POLICY "Admins can read platform settings"
ON public.platform_settings
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert platform settings
CREATE POLICY "Admins can insert platform settings"
ON public.platform_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update platform settings
CREATE POLICY "Admins can update platform settings"
ON public.platform_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete platform settings
CREATE POLICY "Admins can delete platform settings"
ON public.platform_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default webhook settings
INSERT INTO public.platform_settings (setting_key, setting_value) VALUES
  ('make_webhook_bookings', NULL),
  ('make_webhook_cancellations', NULL),
  ('make_webhook_signups', NULL),
  ('make_webhook_venues', NULL)
ON CONFLICT (setting_key) DO NOTHING;