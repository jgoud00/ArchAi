-- ============================================
-- Migration: Align team member roles with UI
-- ============================================
-- Updates team_members.role constraint to support
-- owner/editor/viewer and converts legacy 'member'
-- values to 'viewer'.

-- Convert existing legacy roles
UPDATE public.team_members
SET role = 'viewer'
WHERE role = 'member';

-- Drop old constraint if present
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_role_check;

-- Add new constraint
ALTER TABLE public.team_members
  ADD CONSTRAINT team_members_role_check
  CHECK (role IN ('owner', 'editor', 'viewer'));

