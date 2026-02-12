-- Fix infinite recursion in chat_members RLS policies
-- The current policies query chat_members within themselves, causing recursion

-- First, create a security definer function to check chat membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_chat_member(_room_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_members
    WHERE room_id = _room_id
      AND user_id = _user_id
  )
$$;

-- Drop the problematic policies
DROP POLICY IF EXISTS "Members can add other members" ON public.chat_members;
DROP POLICY IF EXISTS "Members can view room members" ON public.chat_members;

-- Recreate policies using the security definer function
CREATE POLICY "Members can view room members"
ON public.chat_members
FOR SELECT
USING (public.is_chat_member(room_id, auth.uid()));

CREATE POLICY "Members can add other members"
ON public.chat_members
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (
    user_id = auth.uid() 
    OR public.is_chat_member(room_id, auth.uid())
  )
);

-- Also fix chat_messages policy that references chat_members
DROP POLICY IF EXISTS "Members can send messages to their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Members can view messages in their rooms" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can report messages in their rooms" ON public.chat_messages;

CREATE POLICY "Members can send messages to their rooms"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  (sender_id = auth.uid() OR sender_id IS NULL)
  AND public.is_chat_member(room_id, auth.uid())
);

CREATE POLICY "Members can view messages in their rooms"
ON public.chat_messages
FOR SELECT
USING (public.is_chat_member(room_id, auth.uid()));

CREATE POLICY "Users can report messages in their rooms"
ON public.chat_messages
FOR UPDATE
USING (public.is_chat_member(room_id, auth.uid()));