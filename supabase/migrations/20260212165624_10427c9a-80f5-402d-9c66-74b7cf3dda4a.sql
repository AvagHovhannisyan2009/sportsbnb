
-- Create teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT NOT NULL,
  team_size INTEGER NOT NULL DEFAULT 10,
  logo_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('captain', 'co-captain', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invites table
CREATE TABLE public.team_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  invited_user_id UUID,
  invited_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add team_id to games table
ALTER TABLE public.games ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
ALTER TABLE public.games ADD COLUMN play_mode TEXT NOT NULL DEFAULT 'individual' CHECK (play_mode IN ('individual', 'team'));

-- Add team_id to bookings table
ALTER TABLE public.bookings ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Enable realtime for team chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;

-- Teams RLS policies
CREATE POLICY "Anyone can view public teams" ON public.teams
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Members can view their private teams" ON public.teams
  FOR SELECT USING (
    visibility = 'private' AND EXISTS (
      SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can view their own teams" ON public.teams
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Captains can update their teams" ON public.teams
  FOR UPDATE USING (
    owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.team_members WHERE team_id = teams.id AND user_id = auth.uid() AND role IN ('captain', 'co-captain')
    )
  );

CREATE POLICY "Owners can delete their teams" ON public.teams
  FOR DELETE USING (owner_id = auth.uid());

-- Team members RLS policies
CREATE POLICY "Anyone can view team members of public teams" ON public.team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND (visibility = 'public' OR owner_id = auth.uid()))
    OR user_id = auth.uid()
  );

CREATE POLICY "Members can view co-members" ON public.team_members
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid())
  );

CREATE POLICY "Captains can add members" ON public.team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members WHERE team_id = team_members.team_id AND user_id = auth.uid() AND role IN ('captain', 'co-captain')
    )
    OR EXISTS (
      SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid()
    )
    OR user_id = auth.uid() -- allow self-join for accepted invites
  );

CREATE POLICY "Captains can update member roles" ON public.team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role = 'captain'
    )
    OR EXISTS (
      SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Captains can remove members" ON public.team_members
  FOR DELETE USING (
    user_id = auth.uid() -- members can leave
    OR EXISTS (
      SELECT 1 FROM public.team_members tm WHERE tm.team_id = team_members.team_id AND tm.user_id = auth.uid() AND tm.role IN ('captain', 'co-captain')
    )
    OR EXISTS (
      SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid()
    )
  );

-- Team invites RLS policies
CREATE POLICY "Users can view invites sent to them" ON public.team_invites
  FOR SELECT USING (invited_user_id = auth.uid() OR invited_by = auth.uid());

CREATE POLICY "Team captains can view team invites" ON public.team_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members WHERE team_id = team_invites.team_id AND user_id = auth.uid() AND role IN ('captain', 'co-captain')
    )
    OR EXISTS (
      SELECT 1 FROM public.teams WHERE id = team_invites.team_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Team captains can create invites" ON public.team_invites
  FOR INSERT WITH CHECK (
    auth.uid() = invited_by AND (
      EXISTS (
        SELECT 1 FROM public.team_members WHERE team_id = team_invites.team_id AND user_id = auth.uid() AND role IN ('captain', 'co-captain')
      )
      OR EXISTS (
        SELECT 1 FROM public.teams WHERE id = team_invites.team_id AND owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "Invited users can update invite status" ON public.team_invites
  FOR UPDATE USING (invited_user_id = auth.uid());

CREATE POLICY "Team captains can delete invites" ON public.team_invites
  FOR DELETE USING (
    invited_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.teams WHERE id = team_invites.team_id AND owner_id = auth.uid()
    )
  );

-- Trigger for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_invites_updated_at
  BEFORE UPDATE ON public.team_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-logos', 'team-logos', true);

CREATE POLICY "Anyone can view team logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'team-logos');

CREATE POLICY "Authenticated users can upload team logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their team logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their team logos" ON storage.objects
  FOR DELETE USING (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);
