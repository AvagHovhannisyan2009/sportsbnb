
-- Referral codes table
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  uses_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own referral code" ON public.referral_codes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own referral code" ON public.referral_codes FOR UPDATE USING (auth.uid() = user_id);

-- Referral credits table
CREATE TABLE public.referral_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referee_id uuid NOT NULL,
  credit_amount numeric NOT NULL DEFAULT 2000,
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own credits as referrer" ON public.referral_credits FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users can view their own credits as referee" ON public.referral_credits FOR SELECT USING (auth.uid() = referee_id);

-- Venue promotions table
CREATE TABLE public.venue_promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL,
  plan text NOT NULL DEFAULT 'basic',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  stripe_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.venue_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active promotions" ON public.venue_promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can view their promotions" ON public.venue_promotions FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert their promotions" ON public.venue_promotions FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their promotions" ON public.venue_promotions FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their promotions" ON public.venue_promotions FOR DELETE USING (auth.uid() = owner_id);

-- Player stats: security definer function to get stats for any user
CREATE OR REPLACE FUNCTION public.get_player_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'games_played', COALESCE((SELECT COUNT(*) FROM game_participants WHERE user_id = p_user_id AND status = 'confirmed'), 0),
    'games_hosted', COALESCE((SELECT COUNT(*) FROM games WHERE host_id = p_user_id), 0),
    'total_bookings', COALESCE((SELECT COUNT(*) FROM bookings WHERE user_id = p_user_id AND status = 'confirmed'), 0),
    'sports_played', COALESCE((
      SELECT json_agg(DISTINCT g.sport)
      FROM game_participants gp
      JOIN games g ON g.id = gp.game_id
      WHERE gp.user_id = p_user_id
    ), '[]'::json),
    'member_since', (SELECT created_at FROM profiles WHERE user_id = p_user_id),
    'referral_credits', COALESCE((SELECT SUM(credit_amount) FROM referral_credits WHERE (referrer_id = p_user_id OR referee_id = p_user_id) AND is_used = false), 0)
  ) INTO result;
  RETURN result;
END;
$$;
