-- ============================================
-- Migration: Fix Supervisor Role Removal
-- ============================================
-- This migration safely removes the 'supervisor' role from the system
-- by handling all SQL dependencies in the correct order.
--
-- Execution Order:
-- 1. UPDATE DATA (convert supervisor users)
-- 2. DROP DEPENDENT POLICIES
-- 3. DROP FUNCTIONS
-- 4. UPDATE CONSTRAINTS
-- 5. CREATE NEW POLICIES

-- ============================================
-- STEP 1: UPDATE DATA - Convert existing supervisor users to 'user'
-- ============================================
-- This must happen BEFORE constraint updates to prevent violations
UPDATE public.users 
SET role = 'user' 
WHERE role = 'supervisor';

-- ============================================
-- STEP 2: DROP DEPENDENT POLICIES FIRST
-- ============================================
-- We MUST drop all policies that reference is_supervisor_or_admin()
-- BEFORE we can drop the function

-- Drop projects SELECT policy (from migration 006)
DROP POLICY IF EXISTS "Users can view accessible projects" ON public.projects;

-- Drop any other policies that might reference is_supervisor_or_admin
-- (Check for policies on other tables that might use it)
-- Note: Most other tables don't use this function, but we'll be thorough

-- ============================================
-- STEP 3: DROP THE FUNCTIONS
-- ============================================
-- Now that all dependent policies are dropped, we can safely drop the function
DROP FUNCTION IF EXISTS public.is_supervisor_or_admin(UUID);

-- Ensure is_admin function exists and is correct
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
-- STEP 4: UPDATE DATABASE CONSTRAINTS
-- ============================================

-- Update users table role constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('admin', 'user'));

-- Update team_members table role constraint (if it exists and has supervisor)
-- Check if team_members has a role column with a constraint
DO $$
BEGIN
  -- Check if team_members table exists and has a role column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'team_members' 
    AND column_name = 'role'
  ) THEN
    -- Drop existing constraint if it exists
    ALTER TABLE public.team_members 
    DROP CONSTRAINT IF EXISTS team_members_role_check;
    
    -- Add new constraint (team_members uses 'owner', 'member', 'editor', 'viewer' - no supervisor)
    -- This is just to ensure consistency, but team_members shouldn't have supervisor
    ALTER TABLE public.team_members 
    ADD CONSTRAINT team_members_role_check 
    CHECK (role IN ('owner', 'member', 'editor', 'viewer'));
  END IF;
END $$;

-- ============================================
-- STEP 5: RE-CREATE POLICIES (Admin + User Only)
-- ============================================

-- ============================================
-- PROJECTS TABLE POLICIES
-- ============================================

-- Re-create projects SELECT policy (without supervisor check)
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
-- DOCUMENTS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view documents for accessible projects" ON public.documents;
DROP POLICY IF EXISTS "Users can create documents for accessible projects" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can upload documents for accessible projects" ON public.documents;
DROP POLICY IF EXISTS "Users can delete documents for accessible projects" ON public.documents;

-- SELECT: Users can view documents for accessible projects
CREATE POLICY "Users can view documents for accessible projects"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
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

-- INSERT: ALL authenticated users can upload (if they can view the project)
CREATE POLICY "Authenticated users can upload documents"
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

-- DELETE: Standard checks (Owner OR Team Member OR Admin)
CREATE POLICY "Users can delete documents for accessible projects"
  ON public.documents FOR DELETE
  USING (
    EXISTS (
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

-- ============================================
-- SCANS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view scans for accessible projects" ON public.scans;
DROP POLICY IF EXISTS "Users can create scans for accessible projects" ON public.scans;
DROP POLICY IF EXISTS "Authenticated users can upload scans for accessible projects" ON public.scans;
DROP POLICY IF EXISTS "Users can delete scans for accessible projects" ON public.scans;

-- SELECT: Users can view scans for accessible projects
CREATE POLICY "Users can view scans for accessible projects"
  ON public.scans FOR SELECT
  USING (
    EXISTS (
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

-- INSERT: ALL authenticated users can upload (if they can view the project)
CREATE POLICY "Authenticated users can upload scans"
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

-- DELETE: Standard checks (Owner OR Team Member OR Admin)
CREATE POLICY "Users can delete scans for accessible projects"
  ON public.scans FOR DELETE
  USING (
    EXISTS (
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

-- ============================================
-- PROGRESS_PHOTOS TABLE POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view progress photos for accessible projects" ON public.progress_photos;
DROP POLICY IF EXISTS "Users can create progress photos for accessible projects" ON public.progress_photos;
DROP POLICY IF EXISTS "Authenticated users can upload progress photos for accessible projects" ON public.progress_photos;
DROP POLICY IF EXISTS "Users can delete progress photos for accessible projects" ON public.progress_photos;

-- SELECT: Users can view progress photos for accessible projects
CREATE POLICY "Users can view progress photos for accessible projects"
  ON public.progress_photos FOR SELECT
  USING (
    EXISTS (
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

-- INSERT: ALL authenticated users can upload (if they can view the project)
CREATE POLICY "Authenticated users can upload progress photos"
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

-- DELETE: Standard checks (Owner OR Team Member OR Admin)
CREATE POLICY "Users can delete progress photos for accessible projects"
  ON public.progress_photos FOR DELETE
  USING (
    EXISTS (
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
-- PROJECT_FILES TABLE POLICIES (if table exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'project_files'
  ) THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view files for accessible projects" ON public.project_files;
    DROP POLICY IF EXISTS "Editors and owners can upload files" ON public.project_files;
    DROP POLICY IF EXISTS "Users can create files for accessible projects" ON public.project_files;
    DROP POLICY IF EXISTS "Authenticated users can upload files for accessible projects" ON public.project_files;
    DROP POLICY IF EXISTS "Editors and owners can update files" ON public.project_files;
    DROP POLICY IF EXISTS "Editors and owners can delete files" ON public.project_files;
    
    -- SELECT: Users can view files for accessible projects
    CREATE POLICY "Users can view files for accessible projects"
      ON public.project_files FOR SELECT
      USING (
        EXISTS (
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
    
    -- INSERT: ALL authenticated users can upload (if they can view the project)
    CREATE POLICY "Authenticated users can upload files"
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
    
    -- UPDATE: Standard checks (Owner OR Team Member OR Admin)
    CREATE POLICY "Users can update files for accessible projects"
      ON public.project_files FOR UPDATE
      USING (
        EXISTS (
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
    
    -- DELETE: Standard checks (Owner OR Team Member OR Admin)
    CREATE POLICY "Users can delete files for accessible projects"
      ON public.project_files FOR DELETE
      USING (
        EXISTS (
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

