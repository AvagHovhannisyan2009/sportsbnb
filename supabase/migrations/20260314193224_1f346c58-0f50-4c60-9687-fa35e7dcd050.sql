
-- Create candidate_fields table for AI-detected sports field candidates
CREATE TABLE public.candidate_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  detected_sport_type text NOT NULL DEFAULT 'unknown',
  confidence_score numeric(4,2) NOT NULL DEFAULT 0,
  detection_source text NOT NULL DEFAULT 'ai_discovery',
  detection_timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  tile_key text,
  raw_metadata jsonb DEFAULT '{}'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create verified_fields table for approved, map-visible fields
CREATE TABLE public.verified_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES public.candidate_fields(id) ON DELETE SET NULL,
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  sport_type text NOT NULL,
  address text,
  city text NOT NULL DEFAULT 'Yerevan',
  is_public boolean NOT NULL DEFAULT true,
  verification_status text NOT NULL DEFAULT 'verified',
  surface_type text,
  has_lighting boolean DEFAULT false,
  condition_rating numeric(2,1) DEFAULT 3.0,
  photo_url text,
  description text,
  active_checkins integer DEFAULT 0,
  last_checkin_at timestamptz,
  busyness_score text DEFAULT 'unknown',
  peak_hours text,
  best_time text,
  verified_by uuid,
  verified_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for candidate_fields (admin-only write, public read for transparency)
ALTER TABLE public.candidate_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage candidate fields"
  ON public.candidate_fields FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view candidate fields"
  ON public.candidate_fields FOR SELECT
  TO public
  USING (true);

-- RLS for verified_fields (public read, admin write)
ALTER TABLE public.verified_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified fields"
  ON public.verified_fields FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage verified fields"
  ON public.verified_fields FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update field_checkins to also reference verified_fields
ALTER TABLE public.field_checkins
  ADD COLUMN verified_field_id uuid REFERENCES public.verified_fields(id) ON DELETE CASCADE;

-- Index for geospatial queries
CREATE INDEX idx_verified_fields_location ON public.verified_fields(latitude, longitude);
CREATE INDEX idx_candidate_fields_status ON public.candidate_fields(status);
CREATE INDEX idx_candidate_fields_location ON public.candidate_fields(latitude, longitude);
