-- Add SQL function for incrementing game players
CREATE OR REPLACE FUNCTION increment_game_players(game_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE games
  SET current_players = current_players + 1
  WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
