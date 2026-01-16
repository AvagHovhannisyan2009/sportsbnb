-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Participants can view joined games" ON public.games;
DROP POLICY IF EXISTS "View participants for own games" ON public.game_participants;

-- Recreate games policy without referencing game_participants
-- Public games are already viewable via "Anyone can view public games" policy
-- Hosts can view via "Users can view their own games" policy
-- For participants, we'll make all open games viewable (simpler approach)

-- Recreate game_participants policy without circular reference
CREATE POLICY "View participants for public games and own participation" 
ON public.game_participants 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM games 
    WHERE games.id = game_participants.game_id 
    AND (games.is_public = true OR games.host_id = auth.uid())
  )
);