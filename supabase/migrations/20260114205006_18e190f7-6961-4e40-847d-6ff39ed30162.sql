-- =============================================
-- 1. ADMIN ROLE SYSTEM (Security Best Practice)
-- =============================================

-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table (roles stored separately from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 2. SECURE PUBLIC PROFILE VIEW (Hide PII)
-- =============================================

-- Create a public-safe view of profiles (excludes sensitive data)
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  username,
  full_name,
  avatar_url,
  city,
  preferred_sports,
  skill_level,
  user_type,
  onboarding_completed,
  created_at
FROM public.profiles
WHERE onboarding_completed = true;

-- Update profiles RLS - restrict public SELECT to own profile only
DROP POLICY IF EXISTS "Public profiles are viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Users can only see their own complete profile
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. FIX BOOKINGS - VENUE OWNERS CAN VIEW
-- =============================================

-- Allow venue owners to view bookings for their venues
CREATE POLICY "Venue owners can view their venue bookings"
ON public.bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.venues 
    WHERE venues.id::text = bookings.venue_id 
    AND venues.owner_id = auth.uid()
  )
);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update bookings (for dispute handling)
CREATE POLICY "Admins can update any booking"
ON public.bookings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 4. FIX GAMES - PARTICIPANTS CAN VIEW
-- =============================================

-- Allow participants to view games they've joined (including private)
CREATE POLICY "Participants can view joined games"
ON public.games FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.game_participants 
    WHERE game_participants.game_id = games.id 
    AND game_participants.user_id = auth.uid()
  )
);

-- Admins can view all games
CREATE POLICY "Admins can view all games"
ON public.games FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all games
CREATE POLICY "Admins can update any game"
ON public.games FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any game"
ON public.games FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 5. FIX GAME PARTICIPANTS - RESTRICT VIEW
-- =============================================

DROP POLICY IF EXISTS "Anyone can view game participants" ON public.game_participants;

-- Only show participants for games user is involved in
CREATE POLICY "View participants for own games"
ON public.game_participants FOR SELECT
USING (
  -- User is the participant
  auth.uid() = user_id
  OR
  -- User is the game host
  EXISTS (
    SELECT 1 FROM public.games 
    WHERE games.id = game_participants.game_id 
    AND games.host_id = auth.uid()
  )
  OR
  -- User is already a participant in this game
  EXISTS (
    SELECT 1 FROM public.game_participants gp 
    WHERE gp.game_id = game_participants.game_id 
    AND gp.user_id = auth.uid()
  )
  OR
  -- Game is public
  EXISTS (
    SELECT 1 FROM public.games 
    WHERE games.id = game_participants.game_id 
    AND games.is_public = true
  )
);

-- Admins can view all participants
CREATE POLICY "Admins can view all game participants"
ON public.game_participants FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 6. ADMIN ACCESS TO VENUES
-- =============================================

CREATE POLICY "Admins can view all venues"
ON public.venues FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any venue"
ON public.venues FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete any venue"
ON public.venues FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 7. ADMIN ACCESS TO REVIEWS
-- =============================================

CREATE POLICY "Admins can delete any review"
ON public.reviews FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any review"
ON public.reviews FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 8. TRIGGER FOR UPDATED_AT ON USER_ROLES
-- =============================================

CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();