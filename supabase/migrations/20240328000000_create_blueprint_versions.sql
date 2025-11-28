-- Create blueprint_versions table
CREATE TABLE IF NOT EXISTS blueprint_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE blueprint_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view versions of projects they are members of"
  ON blueprint_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = blueprint_versions.project_id
      AND team_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = blueprint_versions.project_id
      AND projects.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions for projects they are members of"
  ON blueprint_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.project_id = blueprint_versions.project_id
      AND team_members.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = blueprint_versions.project_id
      AND projects.owner_id = auth.uid()
    )
  );
