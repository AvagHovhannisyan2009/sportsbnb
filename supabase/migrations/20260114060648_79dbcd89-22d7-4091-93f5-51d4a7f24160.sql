-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(venue_id, user_id, booking_id)
);

-- Create venue_hours table for operating hours
CREATE TABLE public.venue_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(venue_id, day_of_week)
);

-- Create blocked_dates table for special closures
CREATE TABLE public.blocked_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(venue_id, blocked_date)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Users can create reviews for their bookings"
ON public.reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE
USING (auth.uid() = user_id);

-- Venue hours policies
CREATE POLICY "Anyone can view venue hours"
ON public.venue_hours FOR SELECT
USING (true);

CREATE POLICY "Owners can manage venue hours"
ON public.venue_hours FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
);

CREATE POLICY "Owners can update venue hours"
ON public.venue_hours FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
);

CREATE POLICY "Owners can delete venue hours"
ON public.venue_hours FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
);

-- Blocked dates policies
CREATE POLICY "Anyone can view blocked dates"
ON public.blocked_dates FOR SELECT
USING (true);

CREATE POLICY "Owners can manage blocked dates"
ON public.blocked_dates FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
);

CREATE POLICY "Owners can update blocked dates"
ON public.blocked_dates FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
);

CREATE POLICY "Owners can delete blocked dates"
ON public.blocked_dates FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.venues WHERE id = venue_id AND owner_id = auth.uid())
);

-- Create function to update venue rating
CREATE OR REPLACE FUNCTION public.update_venue_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.venues
  SET 
    rating = COALESCE((SELECT AVG(rating)::NUMERIC(2,1) FROM public.reviews WHERE venue_id = COALESCE(NEW.venue_id, OLD.venue_id)), 0),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE venue_id = COALESCE(NEW.venue_id, OLD.venue_id))
  WHERE id = COALESCE(NEW.venue_id, OLD.venue_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for review updates
CREATE TRIGGER update_venue_rating_on_insert
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_venue_rating();

CREATE TRIGGER update_venue_rating_on_update
AFTER UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_venue_rating();

CREATE TRIGGER update_venue_rating_on_delete
AFTER DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_venue_rating();

-- Add updated_at trigger for reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();