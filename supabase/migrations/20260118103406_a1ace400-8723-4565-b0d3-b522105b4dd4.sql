-- Add 'venue' type support for chat_rooms
-- The type column already exists as text, so we just need to ensure RLS policies support it

-- Create quick reply templates table for venue owners
CREATE TABLE public.owner_reply_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  message_text text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.owner_reply_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for reply templates
CREATE POLICY "Owners can view their own templates"
ON public.owner_reply_templates FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create their own templates"
ON public.owner_reply_templates FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their own templates"
ON public.owner_reply_templates FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their own templates"
ON public.owner_reply_templates FOR DELETE
USING (auth.uid() = owner_id);

-- Create blocked users table
CREATE TABLE public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  room_id uuid REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id, room_id)
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- RLS policies for blocked users
CREATE POLICY "Users can view their blocks"
ON public.blocked_users FOR SELECT
USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
ON public.blocked_users FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock"
ON public.blocked_users FOR DELETE
USING (auth.uid() = blocker_id);

-- Update get_or_create_chat_room function to support venue type
CREATE OR REPLACE FUNCTION public.get_or_create_chat_room(p_reference_id uuid, p_type text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
BEGIN
  -- First try to find existing room
  SELECT id INTO v_room_id
  FROM chat_rooms
  WHERE reference_id = p_reference_id AND type = p_type;
  
  -- If not found, create new room
  IF v_room_id IS NULL THEN
    INSERT INTO chat_rooms (reference_id, type)
    VALUES (p_reference_id, p_type)
    RETURNING id INTO v_room_id;
  END IF;
  
  RETURN v_room_id;
END;
$$;

-- Update chat_rooms RLS to support venue type
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON public.chat_rooms;

CREATE POLICY "Authenticated users can create chat rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- Game chat
    (type = 'game' AND (
      EXISTS (SELECT 1 FROM games WHERE games.id = chat_rooms.reference_id AND games.host_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM game_participants WHERE game_participants.game_id = chat_rooms.reference_id AND game_participants.user_id = auth.uid())
    )) OR
    -- Booking chat
    (type = 'booking' AND (
      EXISTS (SELECT 1 FROM bookings WHERE bookings.id = chat_rooms.reference_id AND bookings.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM bookings b JOIN venues v ON v.id::text = b.venue_id WHERE b.id = chat_rooms.reference_id AND v.owner_id = auth.uid())
    )) OR
    -- Venue chat (any authenticated user can initiate, or owner)
    (type = 'venue' AND (
      auth.uid() IS NOT NULL
    ))
  )
);

-- Add function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(p_room_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE room_id = p_room_id AND blocked_id = p_user_id
  );
$$;