-- Migration: Fix RLS policies for scans table
-- Date: 2025-12-10
-- Description: Comprehensive RLS implementation for project scans with proper access control

-- Enable RLS if not already enabled
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Users can view project scans" ON scans;
DROP POLICY IF EXISTS "Users can upload scans to their projects" ON scans;
DROP POLICY IF EXISTS "Users can delete their own scans" ON scans;
DROP POLICY IF EXISTS "Project owners can delete any scan" ON scans;

-- SELECT: Users can view scans from projects they have access to
CREATE POLICY "Users can view project scans"
  ON scans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = scans.project_id
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
    )
  );

-- INSERT: Users can upload scans to projects where they are owner or editor
CREATE POLICY "Users can upload scans to their projects"
  ON scans
  FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = scans.project_id
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
    )
  );

-- DELETE: Users can delete their own scans
CREATE POLICY "Users can delete their own scans"
  ON scans
  FOR DELETE
  USING (uploaded_by = auth.uid());

-- DELETE: Project owners can delete any scan in their projects
CREATE POLICY "Project owners can delete any scan"
  ON scans
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scans.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Add indexes for RLS performance
CREATE INDEX IF NOT EXISTS idx_scans_project_id ON scans(project_id);
CREATE INDEX IF NOT EXISTS idx_scans_uploaded_by ON scans(uploaded_by);

-- Comments for documentation
COMMENT ON POLICY "Users can view project scans" ON scans IS 
  'Users can view scans from any project they own or are a member of';
COMMENT ON POLICY "Users can upload scans to their projects" ON scans IS 
  'Users with owner or editor role can upload scans to their projects';
COMMENT ON POLICY "Users can delete their own scans" ON scans IS 
  'Users can delete scans they uploaded';
COMMENT ON POLICY "Project owners can delete any scan" ON scans IS 
  'Project owners can delete any scan in their projects for moderation';
