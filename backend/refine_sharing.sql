
-- 1. Create Helper Function to Check Team Membership
-- This function returns true if the current user and the target user share a team.
CREATE OR REPLACE FUNCTION public.shares_team_with(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid() 
      AND tm2.user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Create Secure Function to Fetch Shared Event by Slug
-- This bypasses RLS but only returns data if the slug matches a public event.
-- This allows anyone with the link to view the event, even without logging in or being in a team.
CREATE OR REPLACE FUNCTION public.get_shared_event(slug_param TEXT)
RETURNS TABLE (
  "id" UUID,
  "title" TEXT,
  "description" TEXT,
  "date" DATE,
  "time" TEXT,
  "color" TEXT,
  "type" TEXT,
  "status" TEXT,
  "user_id" UUID,
  recurrence TEXT,
  recurrence_days INTEGER[],
  completed_dates TEXT[],
  excluded_dates TEXT[],
  team_id UUID,
  is_public BOOLEAN,
  share_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_profile JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id, e.title, e.description, e.date, e.time, e.color, e.type, e.status, 
    e.user_id, e.recurrence, e.recurrence_days, e.completed_dates, e.excluded_dates, 
    e.team_id, e.is_public, e.share_slug, e.created_at,
    to_jsonb(p.*) as user_profile
  FROM public.events e
  LEFT JOIN public.profiles p ON e.user_id = p.id
  WHERE e.share_slug = slug_param 
    AND e.is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Update Events RLS Policy
-- Old Policy: Viewable by owner, team members (of specific team_id), or if is_public = true (globally).
-- New Policy: 
--   1. Owner always sees their own events.
--   2. Users see events explicitly shared with a Team they are a member of.
--   3. Users see "Public" events ONLY if they share at least one team with the event owner (Teammate visibility).
--   4. Global "Public" visibility is REMOVED from the main select policy (handled via get_shared_event for direct links).

DROP POLICY IF EXISTS "Events are viewable by owner, team members, or if public." ON public.events;

CREATE POLICY "Events are viewable by owner or teammates."
  ON public.events FOR SELECT
  USING (
    auth.uid() = user_id OR 
    (team_id IS NOT NULL AND public.is_team_member(team_id)) OR
    (is_public = true AND public.shares_team_with(user_id))
  );

-- Note: The `shares_team_with` check might be performance intensive on large datasets.
-- For a small-scale app, it's fine. For scaling, denormalization or indexed views would be better.
