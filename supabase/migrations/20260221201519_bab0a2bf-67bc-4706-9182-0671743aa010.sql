
-- Create recurring bookings table
CREATE TABLE public.recurring_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  venue_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  booking_time TEXT NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  recurrence_type TEXT NOT NULL DEFAULT 'weekly' CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  team_id UUID REFERENCES public.teams(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recurring_bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own recurring bookings"
ON public.recurring_bookings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring bookings"
ON public.recurring_bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring bookings"
ON public.recurring_bookings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring bookings"
ON public.recurring_bookings FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Venue owners can view recurring bookings for their venues"
ON public.recurring_bookings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM venues WHERE (venues.id)::text = recurring_bookings.venue_id AND venues.owner_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_recurring_bookings_updated_at
BEFORE UPDATE ON public.recurring_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add recurring_booking_id to bookings table
ALTER TABLE public.bookings ADD COLUMN recurring_booking_id UUID REFERENCES public.recurring_bookings(id);
