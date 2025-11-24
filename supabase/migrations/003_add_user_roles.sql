-- Migration: Add role-based access control (RBAC)
-- Adds role column to users table and sets up role-based permissions

-- ============================================
-- ADD ROLE COLUMN TO USERS TABLE
-- ============================================
-- Add role column with default value 'user' for existing and new users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' 
CHECK (role IN ('admin', 'supervisor', 'user'));

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Update existing users to have 'user' role if they don't have one
UPDATE public.users 
SET role = 'user' 
WHERE role IS NULL OR role NOT IN ('admin', 'supervisor', 'user');

-- ============================================
-- ROLE-BASED PERMISSIONS
-- ============================================
-- Note: RLS policies already exist for projects and other tables
-- We'll enhance them with role checks where needed

-- Function to check if user is admin
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

-- Function to check if user is supervisor or admin
CREATE OR REPLACE FUNCTION public.is_supervisor_or_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_uuid
    AND role IN ('admin', 'supervisor')
  );
END;
$$;

-- ============================================
-- ENHANCED RLS POLICIES FOR ADMIN ACCESS
-- ============================================
-- Admins can view all users (for user management)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id  -- Users can always see themselves
    OR
    public.is_admin(auth.uid())  -- Admins can see everyone
  );

-- Admins can update any user's role
CREATE POLICY "Admins can update user roles"
  ON public.users FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Admins can view all projects (for oversight)
CREATE POLICY "Admins can view all projects"
  ON public.projects FOR SELECT
  USING (
    -- Existing policy: users can view own or member projects
    owner_id = auth.uid()
    OR
    public.is_project_member(id, auth.uid())
    OR
    -- New: admins can view all projects
    public.is_admin(auth.uid())
  );

-- ============================================
-- UPDATE TRIGGER FUNCTION FOR DEFAULT ROLE
-- ============================================
-- Update the trigger function to set default role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'user'  -- Default role for new users
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON COLUMN public.users.role IS 'User role: admin, supervisor, or user (default)';
COMMENT ON FUNCTION public.is_admin(UUID) IS 'Checks if a user has admin role';
COMMENT ON FUNCTION public.is_supervisor_or_admin(UUID) IS 'Checks if a user has supervisor or admin role';

