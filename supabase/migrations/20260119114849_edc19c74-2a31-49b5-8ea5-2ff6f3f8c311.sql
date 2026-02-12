-- Create table for venue equipment rentals (items and packages)
CREATE TABLE public.venue_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  equipment_type TEXT NOT NULL DEFAULT 'item' CHECK (equipment_type IN ('item', 'package')),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venue_equipment ENABLE ROW LEVEL SECURITY;

-- RLS policies for venue_equipment
CREATE POLICY "Anyone can view available equipment" 
ON public.venue_equipment 
FOR SELECT 
USING (is_available = true);

CREATE POLICY "Owners can manage their venue equipment" 
ON public.venue_equipment 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id = venue_equipment.venue_id 
    AND venues.owner_id = auth.uid()
  )
);

-- Add new columns to venue_policies for additional settings
ALTER TABLE public.venue_policies
ADD COLUMN IF NOT EXISTS overtime_rate_per_minute NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS early_arrival_policy TEXT DEFAULT 'not_allowed' CHECK (early_arrival_policy IN ('not_allowed', 'free_if_available', 'charged_normal_rate')),
ADD COLUMN IF NOT EXISTS early_arrival_minutes INTEGER DEFAULT 0;

-- Create trigger for updated_at on venue_equipment
CREATE TRIGGER update_venue_equipment_updated_at
BEFORE UPDATE ON public.venue_equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create platform cancellation policy table (centralized, not per-venue)
CREATE TABLE public.platform_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_type TEXT NOT NULL UNIQUE,
  policy_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (read for everyone, write for admins only)
ALTER TABLE public.platform_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform policies" 
ON public.platform_policies 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage platform policies" 
ON public.platform_policies 
FOR ALL 
USING (
  public.has_role(auth.uid(), 'admin')
);

-- Insert default cancellation policy (max 20%, tiered)
INSERT INTO public.platform_policies (policy_type, policy_data) VALUES 
('cancellation', '{
  "tiers": [
    {"hours_before": 48, "fee_percentage": 0, "description": "Free cancellation"},
    {"hours_before": 24, "fee_percentage": 10, "description": "10% cancellation fee"},
    {"hours_before": 0, "fee_percentage": 20, "description": "20% cancellation fee (max)"}
  ],
  "max_fee_percentage": 20
}'::jsonb);

-- Create trigger for updated_at on platform_policies
CREATE TRIGGER update_platform_policies_updated_at
BEFORE UPDATE ON public.platform_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();