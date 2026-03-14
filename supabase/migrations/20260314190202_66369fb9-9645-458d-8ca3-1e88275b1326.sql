
-- Public sports fields table
CREATE TABLE public.public_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Yerevan',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  sports TEXT[] NOT NULL DEFAULT '{}',
  surface_type TEXT DEFAULT 'asphalt',
  has_lighting BOOLEAN DEFAULT false,
  has_goals BOOLEAN DEFAULT false,
  has_nets BOOLEAN DEFAULT false,
  has_markings BOOLEAN DEFAULT false,
  condition_rating NUMERIC(2,1) DEFAULT 3.0,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT false,
  submitted_by UUID,
  active_checkins INTEGER DEFAULT 0,
  last_checkin_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Check-ins table for occupancy tracking
CREATE TABLE public.field_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id UUID NOT NULL REFERENCES public.public_fields(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMP WITH TIME ZONE,
  player_count INTEGER DEFAULT 1
);

-- Community field submissions
CREATE TABLE public.field_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL DEFAULT 'Yerevan',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  sports TEXT[] NOT NULL DEFAULT '{}',
  surface_type TEXT DEFAULT 'asphalt',
  has_lighting BOOLEAN DEFAULT false,
  description TEXT,
  photo_url TEXT,
  submitted_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS policies for public_fields
ALTER TABLE public.public_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved public fields"
  ON public.public_fields FOR SELECT
  TO public
  USING (is_approved = true);

CREATE POLICY "Admins can manage all public fields"
  ON public.public_fields FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for field_checkins
ALTER TABLE public.field_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view checkins"
  ON public.field_checkins FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can check in"
  ON public.field_checkins FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
  ON public.field_checkins FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- RLS policies for field_submissions
ALTER TABLE public.field_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit fields"
  ON public.field_submissions FOR INSERT
  TO public
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can view their own submissions"
  ON public.field_submissions FOR SELECT
  TO public
  USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can manage all submissions"
  ON public.field_submissions FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'));
