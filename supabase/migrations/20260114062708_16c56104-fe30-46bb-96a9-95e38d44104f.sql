-- Add notification_preferences JSONB column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"bookingConfirmations": true, "gameUpdates": true, "newGamesNearby": false, "marketingEmails": false}'::jsonb;