
-- Migration for Social, Teams, and Public Sharing

-- 1. Create Teams Table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Team Members Table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, user_id)
);

-- 3. Update Events Table for Teams and Sharing
-- NOTE: ON DELETE CASCADE means if a Team is deleted, all its shared events are also deleted.
-- This is intentional to prevent "orphan" team events.
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS share_slug TEXT UNIQUE;

-- Add relation to profiles Table for easier joins
-- We use a named constraint so we can reference it in PostgREST selects if needed.
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'events_user_id_profiles_fkey') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Enable RLS on new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 5. Helper Functions (Security Definer to avoid RLS recursion)
-- These functions run with the privileges of the creator (bypass RLS)
CREATE OR REPLACE FUNCTION public.is_team_member(t_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = t_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_team_admin(t_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if owner of the team
  IF EXISTS (SELECT 1 FROM public.teams WHERE id = t_id AND owner_id = auth.uid()) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if admin member
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = t_id AND user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Teams Policies
DROP POLICY IF EXISTS "Teams are viewable by owner or members." ON public.teams;
CREATE POLICY "Teams are viewable by owner or members."
  ON public.teams FOR SELECT
  USING (
    auth.uid() = owner_id OR 
    public.is_team_member(id)
  );

DROP POLICY IF EXISTS "Users can create teams." ON public.teams;
CREATE POLICY "Users can create teams."
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Only owners can update teams." ON public.teams;
CREATE POLICY "Only owners can update teams."
  ON public.teams FOR UPDATE
  USING (auth.uid() = owner_id);

-- 7. Team Members Policies
DROP POLICY IF EXISTS "Team members are viewable by other members." ON public.team_members;
CREATE POLICY "Team members are viewable by other members."
  ON public.team_members FOR SELECT
  USING (
    public.is_team_member(team_id) OR
    EXISTS (SELECT 1 FROM public.teams WHERE id = team_members.team_id AND owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners and Admins can add members." ON public.team_members;
CREATE POLICY "Owners and Admins can add members."
  ON public.team_members FOR INSERT
  WITH CHECK (
    public.is_team_admin(team_id)
  );

DROP POLICY IF EXISTS "Owners and Admins can remove members." ON public.team_members;
CREATE POLICY "Owners and Admins can remove members."
  ON public.team_members FOR DELETE
  USING (
    public.is_team_admin(team_id) OR auth.uid() = user_id
  );

-- 8. Update Events RLS
DROP POLICY IF EXISTS "Events are viewable by owner, team members, or if public." ON public.events;
CREATE POLICY "Events are viewable by owner, team members, or if public."
  ON public.events FOR SELECT
  USING (
    auth.uid() = user_id OR 
    is_public = true OR
    (team_id IS NOT NULL AND public.is_team_member(team_id))
  );

DROP POLICY IF EXISTS "Owners and Team Admins can update events." ON public.events;
CREATE POLICY "Owners and Team Admins can update events."
  ON public.events FOR UPDATE
  USING (
    auth.uid() = user_id OR
    (team_id IS NOT NULL AND public.is_team_admin(team_id))
  );

DROP POLICY IF EXISTS "Owners and Team Admins can delete events." ON public.events;
CREATE POLICY "Owners and Team Admins can delete events."
  ON public.events FOR DELETE
  USING (
    (team_id IS NOT NULL AND public.is_team_admin(team_id))
  );

-- 9. Automatic Team Membership Trigger
-- Automatically add the owner as an admin member when a team is created
CREATE OR REPLACE FUNCTION public.handle_new_team() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_team_created ON public.teams;
CREATE TRIGGER on_team_created
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_team();
