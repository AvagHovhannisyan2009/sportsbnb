-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('game', 'booking')),
  reference_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (type, reference_id)
);

-- Create chat_members table
CREATE TABLE public.chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'player', 'owner', 'customer')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (room_id, user_id)
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID,
  message_text TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_reported BOOLEAN DEFAULT false,
  reported_by UUID,
  reported_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_chat_rooms_reference ON public.chat_rooms(type, reference_id);
CREATE INDEX idx_chat_members_room ON public.chat_members(room_id);
CREATE INDEX idx_chat_members_user ON public.chat_members(user_id);
CREATE INDEX idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(room_id, created_at);

-- Enable RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Members can view their chat rooms"
ON public.chat_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_members.room_id = chat_rooms.id
    AND chat_members.user_id = auth.uid()
  )
);

CREATE POLICY "System can create chat rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (true);

-- RLS Policies for chat_members
CREATE POLICY "Members can view room members"
ON public.chat_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.room_id = chat_members.room_id
    AND cm.user_id = auth.uid()
  )
);

CREATE POLICY "System can add members"
ON public.chat_members FOR INSERT
WITH CHECK (true);

CREATE POLICY "Members can update their own membership"
ON public.chat_members FOR UPDATE
USING (user_id = auth.uid());

-- RLS Policies for chat_messages
CREATE POLICY "Members can view messages in their rooms"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_members.room_id = chat_messages.room_id
    AND chat_members.user_id = auth.uid()
  )
);

CREATE POLICY "Members can send messages to their rooms"
ON public.chat_messages FOR INSERT
WITH CHECK (
  (sender_id = auth.uid() OR sender_id IS NULL) AND
  EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_members.room_id = chat_messages.room_id
    AND chat_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can report messages in their rooms"
ON public.chat_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.chat_members
    WHERE chat_members.room_id = chat_messages.room_id
    AND chat_members.user_id = auth.uid()
  )
);

-- Admins can view all chat data
CREATE POLICY "Admins can view all chat rooms"
ON public.chat_rooms FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all chat members"
ON public.chat_members FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all messages"
ON public.chat_messages FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete messages"
ON public.chat_messages FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Function to get or create a chat room
CREATE OR REPLACE FUNCTION public.get_or_create_chat_room(
  p_type TEXT,
  p_reference_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id UUID;
BEGIN
  -- Try to find existing room
  SELECT id INTO v_room_id
  FROM public.chat_rooms
  WHERE type = p_type AND reference_id = p_reference_id;
  
  -- If not found, create it
  IF v_room_id IS NULL THEN
    INSERT INTO public.chat_rooms (type, reference_id)
    VALUES (p_type, p_reference_id)
    RETURNING id INTO v_room_id;
  END IF;
  
  RETURN v_room_id;
END;
$$;

-- Function to add a member to a chat room
CREATE OR REPLACE FUNCTION public.add_chat_member(
  p_room_id UUID,
  p_user_id UUID,
  p_role TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.chat_members (room_id, user_id, role)
  VALUES (p_room_id, p_user_id, p_role)
  ON CONFLICT (room_id, user_id) DO NOTHING;
END;
$$;

-- Function to send a system message
CREATE OR REPLACE FUNCTION public.send_system_message(
  p_room_id UUID,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_id UUID;
BEGIN
  INSERT INTO public.chat_messages (room_id, sender_id, message_text, message_type)
  VALUES (p_room_id, NULL, p_message, 'system')
  RETURNING id INTO v_message_id;
  
  RETURN v_message_id;
END;
$$;

-- Trigger to update chat_rooms.updated_at when new message arrives
CREATE OR REPLACE FUNCTION public.update_chat_room_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.chat_rooms
  SET updated_at = now()
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_chat_room_on_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_room_timestamp();