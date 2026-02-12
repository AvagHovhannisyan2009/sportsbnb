
-- Create a security definer function to check team membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_team_captain(p_team_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id AND user_id = p_user_id AND role IN ('captain', 'co-captain')
  ) OR EXISTS (
    SELECT 1 FROM teams WHERE id = p_team_id AND owner_id = p_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = p_team_id AND user_id = p_user_id
  );
$$;

-- Drop all existing team_members policies
DROP POLICY IF EXISTS "Anyone can view team members of public teams" ON public.team_members;
DROP POLICY IF EXISTS "Members can view co-members" ON public.team_members;
DROP POLICY IF EXISTS "Captains can add members" ON public.team_members;
DROP POLICY IF EXISTS "Captains can remove members" ON public.team_members;
DROP POLICY IF EXISTS "Captains can update member roles" ON public.team_members;

-- Recreate without self-referencing
CREATE POLICY "View team members of public teams or own teams"
ON public.team_members FOR SELECT
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.visibility = 'public')
  OR EXISTS (SELECT 1 FROM teams WHERE teams.id = team_members.team_id AND teams.owner_id = auth.uid())
  OR public.is_team_member(team_id, auth.uid())
);

CREATE POLICY "Captains can add members"
ON public.team_members FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.is_team_captain(team_id, auth.uid())
);

CREATE POLICY "Captains can remove members"
ON public.team_members FOR DELETE
USING (
  user_id = auth.uid()
  OR public.is_team_captain(team_id, auth.uid())
);

CREATE POLICY "Captains can update member roles"
ON public.team_members FOR UPDATE
USING (
  public.is_team_captain(team_id, auth.uid())
);

-- Also fix team_invites policies that reference team_members
DROP POLICY IF EXISTS "Team captains can create invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team captains can view team invites" ON public.team_invites;
DROP POLICY IF EXISTS "Team captains can delete invites" ON public.team_invites;

CREATE POLICY "Team captains can create invites"
ON public.team_invites FOR INSERT
WITH CHECK (
  auth.uid() = invited_by
  AND public.is_team_captain(team_id, auth.uid())
);

CREATE POLICY "Team captains can view team invites"
ON public.team_invites FOR SELECT
USING (
  public.is_team_captain(team_id, auth.uid())
);

CREATE POLICY "Team captains can delete invites"
ON public.team_invites FOR DELETE
USING (
  invited_by = auth.uid()
  OR public.is_team_captain(team_id, auth.uid())
);

-- Fix teams UPDATE policy that references team_members
DROP POLICY IF EXISTS "Captains can update their teams" ON public.teams;
CREATE POLICY "Captains can update their teams"
ON public.teams FOR UPDATE
USING (
  owner_id = auth.uid()
  OR public.is_team_captain(id, auth.uid())
);

-- Fix teams SELECT for private teams
DROP POLICY IF EXISTS "Members can view their private teams" ON public.teams;
CREATE POLICY "Members can view their private teams"
ON public.teams FOR SELECT
USING (
  visibility = 'private' AND (
    owner_id = auth.uid()
    OR public.is_team_member(id, auth.uid())
  )
);
