-- Migration: Fix RLS policies for blueprints table
-- Date: 2025-12-10
-- Description: Secure blueprint storage with comprehensive RLS policies

-- Enable RLS
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view project blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can create blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can update blueprints" ON blueprints;
DROP POLICY IF EXISTS "Users can delete blueprints" ON blueprints;

-- SELECT: Users can view blueprints from their projects
CREATE POLICY "Users can view project blueprints"
  ON blueprints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = blueprints.project_id
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
    )
  );

-- INSERT: Owners and editors can create blueprints
CREATE POLICY "Users can create blueprints"
  ON blueprints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = blueprints.project_id
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
    )
  );

-- UPDATE: Owners and editors can update blueprints (for versioning)
CREATE POLICY "Users can update blueprints"
  ON blueprints
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = blueprints.project_id
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = blueprints.project_id
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
    )
  );

-- DELETE: Only project owners can delete blueprints
CREATE POLICY "Users can delete blueprints"
  ON blueprints
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = blueprints.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blueprints_project_id ON blueprints(project_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_updated_at ON blueprints(updated_at DESC);

-- Comments
COMMENT ON POLICY "Users can view project blueprints" ON blueprints IS 
  'Users can view blueprints for projects they have access to';
COMMENT ON POLICY "Users can create blueprints" ON blueprints IS 
  'Project owners and editors can create new blueprints';
COMMENT ON POLICY "Users can update blueprints" ON blueprints IS 
  'Project owners and editors can update blueprints for versioning';
COMMENT ON POLICY "Users can delete blueprints" ON blueprints IS 
  'Only project owners can delete blueprints to prevent accidental loss';

-- Note: Blueprint versions are stored in a separate blueprint_versions table
-- which should also have RLS policies (future migration if table exists)
