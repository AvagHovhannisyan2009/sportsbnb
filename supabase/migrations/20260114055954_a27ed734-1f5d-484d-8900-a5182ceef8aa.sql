-- Create venues table
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL,
  image_url TEXT,
  sports TEXT[] NOT NULL DEFAULT '{}',
  price_per_hour NUMERIC NOT NULL DEFAULT 30,
  is_indoor BOOLEAN DEFAULT true,
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Anyone can view active venues (for discover page)
CREATE POLICY "Anyone can view active venues"
ON public.venues
FOR SELECT
USING (is_active = true);

-- Owners can insert their own venues
CREATE POLICY "Owners can insert their own venues"
ON public.venues
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own venues
CREATE POLICY "Owners can update their own venues"
ON public.venues
FOR UPDATE
USING (auth.uid() = owner_id);

-- Owners can delete their own venues
CREATE POLICY "Owners can delete their own venues"
ON public.venues
FOR DELETE
USING (auth.uid() = owner_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();