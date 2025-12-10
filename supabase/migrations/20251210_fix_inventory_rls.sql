-- Migration: Fix RLS policies for inventory table
-- Date: 2025-12-10
-- Description: Secure inventory tracking with comprehensive RLS policies

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view project inventory" ON inventory;
DROP POLICY IF EXISTS "Users can add inventory items" ON inventory;
DROP POLICY IF EXISTS "Users can update inventory items" ON inventory;
DROP POLICY IF EXISTS "Users can delete inventory items" ON inventory;

-- SELECT: Users can view inventory from their projects
CREATE POLICY "Users can view project inventory"
  ON inventory
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = inventory.project_id
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
    )
  );

-- INSERT: Owners and editors can add inventory items
CREATE POLICY "Users can add inventory items"
  ON inventory
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = inventory.project_id
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
    )
  );

-- UPDATE: Owners and editors can update inventory
CREATE POLICY "Users can update inventory items"
  ON inventory
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE projects.id = inventory.project_id
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
      WHERE projects.id = inventory.project_id
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
    )
  );

-- DELETE: Only project owners can delete inventory items
CREATE POLICY "Users can delete inventory items"
  ON inventory
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = inventory.project_id
        AND projects.owner_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_project_id ON inventory(project_id);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory(quantity);

-- Comments
COMMENT ON POLICY "Users can view project inventory" ON inventory IS 
  'Users can view inventory for projects they have access to';
COMMENT ON POLICY "Users can add inventory items" ON inventory IS 
  'Project owners and editors can add new inventory items';
COMMENT ON POLICY "Users can update inventory items" ON inventory IS 
  'Project owners and editors can update inventory quantities and details';
COMMENT ON POLICY "Users can delete inventory items" ON inventory IS 
  'Only project owners can delete inventory items to prevent accidental data loss';
