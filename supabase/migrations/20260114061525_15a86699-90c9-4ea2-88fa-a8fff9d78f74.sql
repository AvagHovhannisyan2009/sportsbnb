-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  skill_level TEXT NOT NULL DEFAULT 'all',
  location TEXT NOT NULL,
  game_date DATE NOT NULL,
  game_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL DEFAULT 1,
  max_players INTEGER NOT NULL DEFAULT 10,
  price_per_player NUMERIC DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_participants table
CREATE TABLE public.game_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, user_id)
);

-- Enable RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_participants ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Anyone can view public games"
ON public.games FOR SELECT
USING (is_public = true AND status != 'cancelled');

CREATE POLICY "Users can view their own games"
ON public.games FOR SELECT
USING (auth.uid() = host_id);

CREATE POLICY "Authenticated users can create games"
ON public.games FOR INSERT
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own games"
ON public.games FOR UPDATE
USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own games"
ON public.games FOR DELETE
USING (auth.uid() = host_id);

-- Game participants policies
CREATE POLICY "Anyone can view game participants"
ON public.game_participants FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join games"
ON public.game_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave games"
ON public.game_participants FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Hosts can manage participants"
ON public.game_participants FOR DELETE
USING (
  EXISTS (SELECT 1 FROM public.games WHERE id = game_id AND host_id = auth.uid())
);

-- Add updated_at trigger for games
CREATE TRIGGER update_games_updated_at
BEFORE UPDATE ON public.games
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();