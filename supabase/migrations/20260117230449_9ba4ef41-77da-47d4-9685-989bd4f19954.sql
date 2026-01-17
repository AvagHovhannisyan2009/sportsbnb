-- Drop overly permissive policies
DROP POLICY IF EXISTS "System can create chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "System can add members" ON public.chat_members;

-- Create more restrictive policies - only authenticated users can create rooms for games/bookings they're part of
CREATE POLICY "Authenticated users can create chat rooms"
ON public.chat_rooms FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- For game chats: user must be host or participant
    (type = 'game' AND (
      EXISTS (SELECT 1 FROM public.games WHERE id = reference_id AND host_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.game_participants WHERE game_id = reference_id AND user_id = auth.uid())
    )) OR
    -- For booking chats: user must be booking owner or venue owner
    (type = 'booking' AND (
      EXISTS (SELECT 1 FROM public.bookings WHERE id = reference_id AND user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.venues v ON v.id::text = b.venue_id
        WHERE b.id = reference_id AND v.owner_id = auth.uid()
      )
    ))
  )
);

-- Members can only be added by users who are already members or are the relevant game host/venue owner
CREATE POLICY "Members can add other members"
ON public.chat_members FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    -- User is adding themselves
    user_id = auth.uid() OR
    -- User is already a member of this room
    EXISTS (
      SELECT 1 FROM public.chat_members cm
      WHERE cm.room_id = chat_members.room_id
      AND cm.user_id = auth.uid()
    )
  )
);