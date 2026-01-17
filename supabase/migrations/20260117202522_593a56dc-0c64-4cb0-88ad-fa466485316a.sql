-- Add RLS policy for hosts to update participant status (approve/reject)
CREATE POLICY "Hosts can update participant status"
ON public.game_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM games
    WHERE games.id = game_participants.game_id
    AND games.host_id = auth.uid()
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_game_participants_status ON public.game_participants(status);
CREATE INDEX IF NOT EXISTS idx_game_participants_game_status ON public.game_participants(game_id, status);