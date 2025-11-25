-- ============================================
-- Migration: Remove Supervisor Role
-- ============================================
-- This migration removes the 'supervisor' role from the system
-- - Updates users table constraint to only allow 'admin' and 'user'
-- - Converts existing supervisor users to 'user' role
-- - Removes/updates supervisor-related functions
-- - Updates RLS policies to remove supervisor checks
-- - Updates upload policies to allow all authenticated users

-- ============================================
-- STEP 1: Convert existing supervisor users to 'user' role
-- ============================================
UPDATE public.users 
SET role = 'user' 
WHERE role = 'supervisor';

-- ============================================
-- STEP 2: Update users table role constraint
-- ============================================
-- Drop the old constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint without supervisor
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user'));

-- ============================================
-- STEP 3: Update or remove supervisor-related functions
-- ============================================
-- Remove the is_supervisor_or_admin function (no longer needed)
DROP FUNCTION IF EXISTS public.is_supervisor_or_admin(UUID);

-- Keep is_admin function (still needed)
-- It should already exist from migration 003, but ensure it's correct
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_uuid
    AND role = 'admin'
  );
END;
$$;

-- ============================================
-- STEP 4: Update RLS policies that reference supervisor
-- ============================================

-- Update projects SELECT policy (from migration 006)
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;
CREATE POLICY "Users can view accessible projects"
  ON public.projects FOR SELECT
  USING (
    -- Owner can view
    owner_id = auth.uid()
    OR
    -- Admin can view all
    public.is_admin(auth.uid())
    OR
    -- Team member can view
    public.is_project_member(id, auth.uid())
  );

-- ============================================
-- STEP 5: Update upload policies for documents, scans, progress_photos
-- Allow ANY authenticated user who can view the project to upload
-- ============================================

-- Update documents INSERT policy to allow any authenticated user
DROP POLICY IF EXISTS "Users can create documents for accessible projects" ON public.documents;
CREATE POLICY "Authenticated users can upload documents for accessible projects"
  ON public.documents FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = documents.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
        OR
        public.is_admin(auth.uid())
      )
    )
  );

-- Update scans INSERT policy to allow any authenticated user
DROP POLICY IF EXISTS "Users can create scans for accessible projects" ON public.scans;
CREATE POLICY "Authenticated users can upload scans for accessible projects"
  ON public.scans FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scans.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
        OR
        public.is_admin(auth.uid())
      )
    )
  );

-- Update progress_photos INSERT policy to allow any authenticated user
DROP POLICY IF EXISTS "Users can create progress photos for accessible projects" ON public.progress_photos;
CREATE POLICY "Authenticated users can upload progress photos for accessible projects"
  ON public.progress_photos FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = progress_photos.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
        OR
        public.is_admin(auth.uid())
      )
    )
  );

-- ============================================
-- STEP 6: Update project_files INSERT policy (if it exists)
-- ============================================
-- Check if project_files table exists and update its policy
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'project_files'
  ) THEN
    -- Drop existing policy
    DROP POLICY IF EXISTS "Editors and owners can upload files" ON public.project_files;
    DROP POLICY IF EXISTS "Users can create files for accessible projects" ON public.project_files;
    
    -- Create new policy allowing any authenticated user
    CREATE POLICY "Authenticated users can upload files for accessible projects"
      ON public.project_files FOR INSERT
      WITH CHECK (
        auth.role() = 'authenticated'
        AND uploaded_by = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.projects
          WHERE projects.id = project_files.project_id
          AND (
            projects.owner_id = auth.uid()
            OR
            EXISTS (
              SELECT 1 FROM public.team_members
              WHERE team_members.project_id = projects.id
              AND team_members.user_id = auth.uid()
            )
            OR
            public.is_admin(auth.uid())
          )
        )
      );
  END IF;
END $$;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN public.users.role IS 'User role: admin or user (default)';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Checks if a user has admin role';

