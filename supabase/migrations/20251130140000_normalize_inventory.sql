-- Create inventory_categories table
CREATE TABLE IF NOT EXISTS public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view inventory categories for accessible projects"
  ON public.inventory_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = inventory_categories.project_id
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

CREATE POLICY "Users can manage inventory categories for accessible projects"
  ON public.inventory_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = inventory_categories.project_id
      AND (
        projects.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members
          WHERE team_members.project_id = projects.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = inventory_categories.project_id
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

-- Add category_id to inventory table
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL;

-- Migrate existing categories
DO $$
DECLARE
  r RECORD;
  cat_id UUID;
BEGIN
  FOR r IN SELECT DISTINCT project_id, category FROM public.inventory WHERE category IS NOT NULL LOOP
    -- Check if category exists for project
    SELECT id INTO cat_id FROM public.inventory_categories WHERE project_id = r.project_id AND name = r.category;
    
    -- If not, create it
    IF cat_id IS NULL THEN
      INSERT INTO public.inventory_categories (project_id, name) VALUES (r.project_id, r.category) RETURNING id INTO cat_id;
    END IF;
    
    -- Update inventory items
    UPDATE public.inventory SET category_id = cat_id WHERE project_id = r.project_id AND category = r.category;
  END LOOP;
END $$;

-- Drop old category column (optional, but cleaner to keep for now as backup or drop later)
-- ALTER TABLE public.inventory DROP COLUMN category;
