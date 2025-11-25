-- ============================================
-- Migration: Allow archived project status
-- ============================================
-- Adds the 'archived' status option to projects.status
-- while preserving existing values.

-- Drop old constraint if it exists
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_status_check;

-- Add new constraint including archived
ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('active', 'completed', 'archived'));

-- Optional safety: coerce any unexpected status to active
UPDATE public.projects
SET status = 'active'
WHERE status NOT IN ('active', 'completed', 'archived');

