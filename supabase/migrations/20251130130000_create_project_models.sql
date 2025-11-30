-- Migration: Create project_models table
-- Timestamp: 20251130130000

CREATE TABLE IF NOT EXISTS public.project_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  version INT DEFAULT 1,
  uploaded_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_models_project_id ON public.project_models(project_id);
CREATE INDEX IF NOT EXISTS idx_project_models_created_at ON public.project_models(created_at DESC);

-- RLS
ALTER TABLE public.project_models ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view models for accessible projects"
  ON public.project_models FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_models.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can upload models for accessible projects"
  ON public.project_models FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_models.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Users can delete models for accessible projects"
  ON public.project_models FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_models.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );
