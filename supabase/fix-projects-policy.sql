-- Fix for infinite recursion in projects RLS policy
-- The issue: When inserting a project, Supabase validates the SELECT policy to return the inserted row.
-- The projects SELECT policy checks team_members, and team_members SELECT policy checks projects,
-- creating a circular dependency during INSERT operations.
-- 
-- Solution: Use SECURITY DEFINER function to check team membership without triggering RLS recursion.
-- This allows the projects SELECT policy to check membership without causing circular dependencies.

-- First, create a SECURITY DEFINER function to check team membership
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION public.is_project_member(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_members.project_id = project_uuid
    AND team_members.user_id = user_uuid
  );
END;
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view own or member projects" ON public.projects;

-- Create a new non-recursive policy
-- Users can view projects if:
-- 1. They are the owner (direct check - no recursion)
-- 2. They are a team member (checked via SECURITY DEFINER function to avoid recursion)
CREATE POLICY "Users can view own or member projects"
  ON public.projects FOR SELECT
  USING (
    -- Direct owner check (no recursion)
    owner_id = auth.uid()
    OR
    -- Check membership via function (bypasses RLS recursion)
    public.is_project_member(id, auth.uid())
  );

-- Note: The INSERT policy "Users can create projects" with 
-- WITH CHECK (auth.uid() = owner_id) is correct and doesn't cause recursion.
