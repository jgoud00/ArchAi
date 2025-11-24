-- Fix for infinite recursion in team_members RLS policy
-- This replaces the circular policy with a non-recursive one

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view team members for accessible projects" ON public.team_members;

-- Create a new non-recursive policy
-- Users can view team members if:
-- 1. They are the owner of the project, OR
-- 2. The team member record is about themselves (user_id = auth.uid())
CREATE POLICY "Users can view team members for accessible projects"
  ON public.team_members FOR SELECT
  USING (
    -- Check if user is project owner (direct check on projects table)
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = team_members.project_id
      AND projects.owner_id = auth.uid()
    )
    OR
    -- Or the record is about the current user (no recursion needed)
    team_members.user_id = auth.uid()
  );
