-- Migration: Add AI analysis table for drone scan analysis
-- Stores AI-powered analysis results for progress photos and scans

CREATE TABLE IF NOT EXISTS public.scan_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  scan_url TEXT NOT NULL,
  progress_percent DECIMAL(5, 2),
  detected_issues JSONB,
  material_usage JSONB,
  recommendations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_analyses_project_id ON public.scan_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_scan_analyses_created_at ON public.scan_analyses(created_at DESC);

-- Enable RLS
ALTER TABLE public.scan_analyses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view analyses for accessible projects"
  ON public.scan_analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scan_analyses.project_id
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

CREATE POLICY "Users can create analyses for accessible projects"
  ON public.scan_analyses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = scan_analyses.project_id
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

