-- ============================================
-- ARCHITECTAI - ENHANCED SCHEMA V2
-- ============================================
-- This schema adds all new features:
-- - Enhanced roles (owner, editor, viewer)
-- - Project status (active, completed, archived)
-- - File attachments (separate from scans)
-- - Comments/Notes system
-- - Activity tracking
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- EXISTING TABLES (Updated)
-- ============================================

-- Update projects table to include 'archived' status
ALTER TABLE IF EXISTS public.projects 
  DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE IF EXISTS public.projects
  ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('active', 'completed', 'archived'));

-- Update team_members table to include 'editor' and 'viewer' roles
ALTER TABLE IF EXISTS public.team_members 
  DROP CONSTRAINT IF EXISTS team_members_role_check;

ALTER TABLE IF EXISTS public.team_members
  ADD CONSTRAINT team_members_role_check 
  CHECK (role IN ('owner', 'editor', 'viewer'));

-- ============================================
-- NEW TABLES
-- ============================================

-- File attachments table (separate from scans)
CREATE TABLE IF NOT EXISTS public.project_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT, -- e.g., 'document', 'image', 'video', 'other'
  description TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments/Notes table
CREATE TABLE IF NOT EXISTS public.project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity log table
CREATE TABLE IF NOT EXISTS public.project_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'project_created',
    'project_updated',
    'project_deleted',
    'file_uploaded',
    'file_deleted',
    'member_added',
    'member_removed',
    'member_role_changed',
    'comment_added',
    'comment_updated',
    'comment_deleted',
    'scan_uploaded',
    'scan_deleted'
  )),
  description TEXT NOT NULL,
  metadata JSONB, -- Additional data (e.g., file name, member email)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON public.project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_files_category ON public.project_files(category);
CREATE INDEX IF NOT EXISTS idx_project_comments_project_id ON public.project_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_comments_user_id ON public.project_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON public.project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_user_id ON public.project_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON public.project_activities(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated_at trigger for new tables
CREATE TRIGGER set_updated_at_project_files
  BEFORE UPDATE ON public.project_files
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_project_comments
  BEFORE UPDATE ON public.project_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - project_files
-- ============================================

-- Users can view files for accessible projects
CREATE POLICY "Users can view files for accessible projects"
  ON public.project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        public.is_project_member(project_files.project_id, auth.uid())
      )
    )
  );

-- Editors and owners can upload files
CREATE POLICY "Editors and owners can upload files"
  ON public.project_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_files.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = project_files.project_id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
    AND uploaded_by = auth.uid()
  );

-- Editors and owners can update files
CREATE POLICY "Editors and owners can update files"
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
          WHERE team_members.project_id = project_files.project_id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
  );

-- Editors and owners can delete files
CREATE POLICY "Editors and owners can delete files"
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
          WHERE team_members.project_id = project_files.project_id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
  );

-- ============================================
-- RLS POLICIES - project_comments
-- ============================================

-- Users can view comments for accessible projects
CREATE POLICY "Users can view comments for accessible projects"
  ON public.project_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_comments.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        public.is_project_member(project_comments.project_id, auth.uid())
      )
    )
  );

-- Editors and owners can add comments
CREATE POLICY "Editors and owners can add comments"
  ON public.project_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_comments.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = project_comments.project_id
          AND team_members.user_id = auth.uid()
          AND team_members.role IN ('owner', 'editor')
        )
      )
    )
    AND user_id = auth.uid()
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.project_comments FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments, owners can delete any
CREATE POLICY "Users can delete own comments or owners can delete any"
  ON public.project_comments FOR DELETE
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_comments.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================
-- RLS POLICIES - project_activities
-- ============================================

-- Users can view activities for accessible projects
CREATE POLICY "Users can view activities for accessible projects"
  ON public.project_activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_activities.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        public.is_project_member(project_activities.project_id, auth.uid())
      )
    )
  );

-- System can create activities (via triggers/functions)
-- Note: Activities are typically created by triggers, not directly by users
-- But we allow users to create activities for their actions
CREATE POLICY "Users can create activities for accessible projects"
  ON public.project_activities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_activities.project_id
      AND (
        projects.owner_id = auth.uid()
        OR
        public.is_project_member(project_activities.project_id, auth.uid())
      )
    )
    AND user_id = auth.uid()
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to log project activity
CREATE OR REPLACE FUNCTION public.log_project_activity(
  p_project_id UUID,
  p_user_id UUID,
  p_activity_type TEXT,
  p_description TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.project_activities (
    project_id,
    user_id,
    activity_type,
    description,
    metadata
  )
  VALUES (
    p_project_id,
    p_user_id,
    p_activity_type,
    p_description,
    p_metadata
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- ============================================
-- TRIGGERS FOR ACTIVITY LOGGING
-- ============================================

-- Log activity when project is created
CREATE OR REPLACE FUNCTION public.log_project_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_project_activity(
    NEW.id,
    NEW.owner_id,
    'project_created',
    'Project "' || NEW.name || '" was created',
    jsonb_build_object('project_name', NEW.name)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_project_created();

-- Log activity when project is updated
CREATE OR REPLACE FUNCTION public.log_project_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_project_activity(
    NEW.id,
    NEW.owner_id,
    'project_updated',
    'Project "' || NEW.name || '" was updated',
    jsonb_build_object('project_name', NEW.name)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_project_updated
  AFTER UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.log_project_updated();

-- Log activity when file is uploaded
CREATE OR REPLACE FUNCTION public.log_file_uploaded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_project_activity(
    NEW.project_id,
    NEW.uploaded_by,
    'file_uploaded',
    'File "' || NEW.name || '" was uploaded',
    jsonb_build_object('file_name', NEW.name, 'file_type', NEW.file_type)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_file_uploaded
  AFTER INSERT ON public.project_files
  FOR EACH ROW
  EXECUTE FUNCTION public.log_file_uploaded();

-- Log activity when member is added
CREATE OR REPLACE FUNCTION public.log_member_added()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner_id UUID;
BEGIN
  -- Get project owner
  SELECT projects.owner_id INTO owner_id
  FROM public.projects
  WHERE projects.id = NEW.project_id;
  
  PERFORM public.log_project_activity(
    NEW.project_id,
    owner_id,
    'member_added',
    'Member "' || NEW.email || '" was added to the project',
    jsonb_build_object('member_email', NEW.email, 'member_role', NEW.role)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_member_added
  AFTER INSERT ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_member_added();

-- Log activity when member is removed
CREATE OR REPLACE FUNCTION public.log_member_removed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owner_id UUID;
BEGIN
  -- Get project owner
  SELECT projects.owner_id INTO owner_id
  FROM public.projects
  WHERE projects.id = OLD.project_id;
  
  PERFORM public.log_project_activity(
    OLD.project_id,
    owner_id,
    'member_removed',
    'Member "' || OLD.email || '" was removed from the project',
    jsonb_build_object('member_email', OLD.email)
  );
  RETURN OLD;
END;
$$;

CREATE TRIGGER on_member_removed
  AFTER DELETE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.log_member_removed();

