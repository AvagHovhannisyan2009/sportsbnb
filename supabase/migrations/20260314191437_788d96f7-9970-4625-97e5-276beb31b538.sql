
-- Add busyness and peak hours columns to public_fields
ALTER TABLE public.public_fields
  ADD COLUMN IF NOT EXISTS busyness_score text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS peak_hours text,
  ADD COLUMN IF NOT EXISTS best_time text;

-- Add comment for clarity
COMMENT ON COLUMN public.public_fields.busyness_score IS 'Values: likely_free, moderate, busy, unknown. Updated by external scoring system.';
COMMENT ON COLUMN public.public_fields.peak_hours IS 'Human-readable peak hours e.g. 19:00-22:00';
COMMENT ON COLUMN public.public_fields.best_time IS 'Human-readable best time to go e.g. 14:00-16:00 weekdays';
