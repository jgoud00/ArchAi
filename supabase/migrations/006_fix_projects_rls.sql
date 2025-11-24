-- ============================================
-- Fix Projects Table RLS Policies
-- ============================================
-- This migration fixes Row Level Security policies for the projects table
-- to allow proper project creation and access control

-- Step 1: Add created_by field if it doesn't exist
-- (Keep owner_id for backward compatibility)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'projects' 
    AND column_name = 'created_by'
  ) THEN
    -- Add column first
    ALTER TABLE public.projects 
    ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE CASCADE;
    
    -- Populate created_by from owner_id for existing rows
    UPDATE public.projects 
    SET created_by = owner_id 
    WHERE created_by IS NULL;
    
    -- Set default for future inserts
    ALTER TABLE public.projects 
    ALTER COLUMN created_by SET DEFAULT auth.uid();
    
    -- Make it NOT NULL after populating
    ALTER TABLE public.projects 
    ALTER COLUMN created_by SET NOT NULL;
  END IF;
END $$;

-- Step 2: Ensure helper functions exist (they should from migration 003)
-- is_admin() and is_supervisor_or_admin() should already exist
-- If not, they will be created by migration 003

-- Step 4: Drop existing policies
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view own or member projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Owners can update projects" ON public.projects;

-- Step 5: Create new INSERT policy
-- Allow any authenticated user to insert when created_by = auth.uid()
-- Note: created_by has DEFAULT auth.uid(), so it will be set automatically
-- The policy verifies that created_by matches the authenticated user
-- We allow NULL because DEFAULT will be applied, then we check it matches
CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      created_by = auth.uid() 
      OR 
      (created_by IS NULL AND auth.uid() IS NOT NULL)
    )
  );

-- Step 6: Create new SELECT policy
-- Allow rows where:
-- - auth.uid() = owner_id (owner)
-- - OR user is admin
-- - OR user is supervisor
-- - OR user is a team member
CREATE POLICY "Users can view accessible projects"
  ON public.projects FOR SELECT
  USING (
    -- Owner can view
    owner_id = auth.uid()
    OR
    -- Admin can view all
    public.is_admin(auth.uid())
    OR
    -- Supervisor can view all
    public.is_supervisor_or_admin(auth.uid())
    OR
    -- Team member can view
    public.is_project_member(id, auth.uid())
  );

-- Step 7: Create new UPDATE policy
-- Allow updates only if:
-- - auth.uid() = owner_id (owner)
-- - OR user is admin
CREATE POLICY "Owners and admins can update projects"
  ON public.projects FOR UPDATE
  USING (
    owner_id = auth.uid()
    OR
    public.is_admin(auth.uid())
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR
    public.is_admin(auth.uid())
  );

-- Step 8: Keep DELETE policy (only owners can delete)
-- This should already exist, but ensure it's correct
DROP POLICY IF EXISTS "Owners can delete projects" ON public.projects;
CREATE POLICY "Owners can delete projects"
  ON public.projects FOR DELETE
  USING (owner_id = auth.uid());

