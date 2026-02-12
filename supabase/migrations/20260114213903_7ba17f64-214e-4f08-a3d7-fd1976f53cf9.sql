-- Add latitude and longitude columns to venues table for map functionality
ALTER TABLE public.venues
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Add location_confirmed column to track if user confirmed the map location
ALTER TABLE public.venues
ADD COLUMN location_confirmed BOOLEAN DEFAULT false;