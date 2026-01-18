-- Create venue_policies table
CREATE TABLE public.venue_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  -- Cancellation
  cancellation_policy text NOT NULL DEFAULT 'flexible',
  cancellation_hours integer NOT NULL DEFAULT 24,
  refund_type text NOT NULL DEFAULT 'full',
  -- Booking rules
  min_duration_hours numeric NOT NULL DEFAULT 1,
  max_duration_hours numeric NOT NULL DEFAULT 8,
  time_slot_increment integer NOT NULL DEFAULT 60,
  booking_window_days integer NOT NULL DEFAULT 30,
  buffer_minutes integer NOT NULL DEFAULT 0,
  grace_period_minutes integer NOT NULL DEFAULT 15,
  -- Text content
  venue_rules text,
  checkin_instructions text,
  -- Timestamps
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(venue_id)
);

-- Enable RLS
ALTER TABLE public.venue_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view venue policies"
ON public.venue_policies FOR SELECT
USING (true);

CREATE POLICY "Owners can manage their venue policies"
ON public.venue_policies FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM venues WHERE venues.id = venue_policies.venue_id AND venues.owner_id = auth.uid()
));

CREATE POLICY "Owners can update their venue policies"
ON public.venue_policies FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM venues WHERE venues.id = venue_policies.venue_id AND venues.owner_id = auth.uid()
));

CREATE POLICY "Owners can delete their venue policies"
ON public.venue_policies FOR DELETE
USING (EXISTS (
  SELECT 1 FROM venues WHERE venues.id = venue_policies.venue_id AND venues.owner_id = auth.uid()
));

-- Add source and created_by columns to bookings for manual bookings
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'online',
ADD COLUMN IF NOT EXISTS created_by_owner_id uuid,
ADD COLUMN IF NOT EXISTS customer_name text,
ADD COLUMN IF NOT EXISTS customer_phone text,
ADD COLUMN IF NOT EXISTS customer_email text,
ADD COLUMN IF NOT EXISTS notes text;

-- Trigger for updated_at
CREATE TRIGGER update_venue_policies_updated_at
BEFORE UPDATE ON public.venue_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();