-- Migration: Add issue_comments table with RLS
-- Date: 2025-12-10
-- Description: Support for issue-specific comments with proper security

-- Create issue_comments table
CREATE TABLE IF NOT EXISTS issue_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE issue_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view comments on issues they have access to
CREATE POLICY "Users can view comments on accessible issues"
  ON issue_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM issues
      JOIN projects ON issues.project_id = projects.id
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE issues.id = issue_comments.issue_id
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
    )
  );

-- RLS Policy: Users can create comments on issues they have access to
CREATE POLICY "Users can create comments on accessible issues"
  ON issue_comments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM issues
      JOIN projects ON issues.project_id = projects.id
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE issues.id = issue_comments.issue_id
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
    )
  );

-- RLS Policy: Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON issue_comments
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON issue_comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_issue_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_issue_comments_updated_at
  BEFORE UPDATE ON issue_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_issue_comments_updated_at();

-- Comments for documentation
COMMENT ON TABLE issue_comments IS 'Comments on project issues with RLS security';
COMMENT ON COLUMN issue_comments.issue_id IS 'Foreign key to issues table';
COMMENT ON COLUMN issue_comments.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN issue_comments.content IS 'Comment text content';
