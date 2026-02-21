
-- ==========================================
-- 1. ACHIEVEMENTS & LEADERBOARDS
-- ==========================================
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  requirement_type TEXT NOT NULL, -- e.g. 'games_played', 'games_hosted', 'bookings_made', 'reviews_written'
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view achievements for leaderboard" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- XP column on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;

-- ==========================================
-- 2. WAITLIST
-- ==========================================
CREATE TABLE public.booking_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  venue_id TEXT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TEXT NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting', -- waiting, notified, booked, expired
  notified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own waitlist entries" ON public.booking_waitlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create waitlist entries" ON public.booking_waitlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own waitlist entries" ON public.booking_waitlist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own waitlist entries" ON public.booking_waitlist FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Venue owners can view waitlist for their venues" ON public.booking_waitlist FOR SELECT 
  USING (EXISTS (SELECT 1 FROM venues WHERE (venues.id)::text = booking_waitlist.venue_id AND venues.owner_id = auth.uid()));

-- ==========================================
-- 3. REVIEW PROMPTS
-- ==========================================
CREATE TABLE public.review_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, shown, completed, dismissed
  prompt_after TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(booking_id)
);

ALTER TABLE public.review_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own review prompts" ON public.review_prompts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own review prompts" ON public.review_prompts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert review prompts" ON public.review_prompts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 4. VENUE IMAGES (Gallery)
-- ==========================================
CREATE TABLE public.venue_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.venue_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view venue images" ON public.venue_images FOR SELECT USING (true);
CREATE POLICY "Owners can manage venue images" ON public.venue_images FOR ALL 
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_images.venue_id AND venues.owner_id = auth.uid()));

-- ==========================================
-- 5. VENUE COURTS (Multi-Court)
-- ==========================================
CREATE TABLE public.venue_courts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sport TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  price_per_hour NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.venue_courts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active courts" ON public.venue_courts FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can manage their courts" ON public.venue_courts FOR ALL
  USING (EXISTS (SELECT 1 FROM venues WHERE venues.id = venue_courts.venue_id AND venues.owner_id = auth.uid()));

-- Add court_id to bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS court_id UUID REFERENCES public.venue_courts(id);

-- ==========================================
-- SEED ACHIEVEMENTS
-- ==========================================
INSERT INTO public.achievements (name, description, icon, category, xp_reward, requirement_type, requirement_value) VALUES
  ('First Steps', 'Complete your first booking', '🎯', 'booking', 10, 'bookings_made', 1),
  ('Regular Player', 'Make 5 bookings', '⭐', 'booking', 25, 'bookings_made', 5),
  ('Venue Explorer', 'Make 10 bookings', '🗺️', 'booking', 50, 'bookings_made', 10),
  ('Game On', 'Play your first game', '🏀', 'games', 10, 'games_played', 1),
  ('Team Player', 'Play 5 games', '🤝', 'games', 25, 'games_played', 5),
  ('MVP', 'Play 25 games', '🏆', 'games', 100, 'games_played', 25),
  ('Game Master', 'Host your first game', '🎮', 'hosting', 15, 'games_hosted', 1),
  ('Event Organizer', 'Host 5 games', '📋', 'hosting', 40, 'games_hosted', 5),
  ('Community Leader', 'Host 10 games', '👑', 'hosting', 75, 'games_hosted', 10),
  ('Critic', 'Write your first review', '✍️', 'social', 10, 'reviews_written', 1),
  ('Reviewer', 'Write 5 reviews', '📝', 'social', 25, 'reviews_written', 5),
  ('Ambassador', 'Refer a friend', '🤗', 'social', 30, 'referrals_made', 1);

-- Enable realtime for waitlist
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_waitlist;
