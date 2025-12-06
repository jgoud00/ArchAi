-- Create project_templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  default_budget DECIMAL(12, 2) DEFAULT 0,
  icon TEXT DEFAULT 'Home',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create project_template_tasks table
CREATE TABLE IF NOT EXISTS public.project_template_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES public.project_templates(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  duration_days INTEGER DEFAULT 7,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_template_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_templates
CREATE POLICY "Everyone can view project templates"
  ON public.project_templates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage project templates"
  ON public.project_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for project_template_tasks
CREATE POLICY "Everyone can view project template tasks"
  ON public.project_template_tasks FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage project template tasks"
  ON public.project_template_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Insert default templates
INSERT INTO public.project_templates (name, description, default_budget, icon) VALUES
('Home Construction', 'Template for residential home construction projects', 500000, 'Home'),
('Commercial Building', 'Template for commercial construction projects', 2000000, 'Building2'),
('Interior Remodel', 'Template for interior renovation projects', 100000, 'Paintbrush');

-- Insert default tasks
DO $$
DECLARE
  home_id UUID;
  comm_id UUID;
  remodel_id UUID;
BEGIN
  SELECT id INTO home_id FROM public.project_templates WHERE name = 'Home Construction';
  SELECT id INTO comm_id FROM public.project_templates WHERE name = 'Commercial Building';
  SELECT id INTO remodel_id FROM public.project_templates WHERE name = 'Interior Remodel';

  IF home_id IS NOT NULL THEN
    INSERT INTO public.project_template_tasks (template_id, task_name, order_index) VALUES
    (home_id, 'Site Preparation', 0),
    (home_id, 'Foundation', 1),
    (home_id, 'Framing', 2),
    (home_id, 'Roofing', 3),
    (home_id, 'Plumbing', 4),
    (home_id, 'Electrical', 5),
    (home_id, 'Interior Finishing', 6);
  END IF;

  IF comm_id IS NOT NULL THEN
    INSERT INTO public.project_template_tasks (template_id, task_name, order_index) VALUES
    (comm_id, 'Design & Planning', 0),
    (comm_id, 'Permits & Approvals', 1),
    (comm_id, 'Site Work', 2),
    (comm_id, 'Structure', 3),
    (comm_id, 'MEP Systems', 4),
    (comm_id, 'Interior Build-out', 5),
    (comm_id, 'Final Inspection', 6);
  END IF;

  IF remodel_id IS NOT NULL THEN
    INSERT INTO public.project_template_tasks (template_id, task_name, order_index) VALUES
    (remodel_id, 'Design Planning', 0),
    (remodel_id, 'Demolition', 1),
    (remodel_id, 'Electrical & Plumbing', 2),
    (remodel_id, 'Drywall & Painting', 3),
    (remodel_id, 'Flooring', 4),
    (remodel_id, 'Fixtures & Finishes', 5);
  END IF;
END $$;
