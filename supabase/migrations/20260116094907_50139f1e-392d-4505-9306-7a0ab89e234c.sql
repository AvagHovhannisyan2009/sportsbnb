-- Add latitude and longitude columns to games table for map functionality
ALTER TABLE public.games
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;