-- ============================================
-- Migration: Secure storage policies
-- ============================================
-- Replaces the permissive storage policies with
-- project-aware rules that restrict object access
-- to authenticated users that can access the
-- owning project.

-- Helper: safely cast text to uuid
CREATE OR REPLACE FUNCTION public.safe_text_to_uuid(value text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
BEGIN
  IF value IS NULL OR trim(value) = '' THEN
    RETURN NULL;
  END IF;
  RETURN value::uuid;
EXCEPTION WHEN invalid_text_representation THEN
  RETURN NULL;
END;
$$ IMMUTABLE;

-- Helper: infer project_id from storage object path
CREATE OR REPLACE FUNCTION public.project_id_from_storage_path(object_name text)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  first_segment text;
  second_segment text;
  third_segment text;
BEGIN
  first_segment := split_part(object_name, '/', 1);
  second_segment := split_part(object_name, '/', 2);
  third_segment := split_part(object_name, '/', 3);

  IF first_segment IN ('project-documents', 'progress', 'blueprints', 'issues') THEN
    RETURN public.safe_text_to_uuid(second_segment);
  ELSIF first_segment = 'projects' AND third_segment = 'scans' THEN
    RETURN public.safe_text_to_uuid(second_segment);
  ELSIF public.safe_text_to_uuid(first_segment) IS NOT NULL THEN
    RETURN public.safe_text_to_uuid(first_segment);
  ELSE
    RETURN NULL;
  END IF;
END;
$$ IMMUTABLE;

-- Helper: check if user can access storage object
CREATE OR REPLACE FUNCTION public.user_can_access_storage_object(object_name text, user_uuid uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_uuid uuid;
BEGIN
  IF user_uuid IS NULL THEN
    RETURN FALSE;
  END IF;

  project_uuid := public.project_id_from_storage_path(object_name);

  IF project_uuid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_uuid
      AND owner_id = user_uuid
  )
  OR public.is_project_member(project_uuid, user_uuid)
  OR public.is_admin(user_uuid);
END;
$$;

-- Drop legacy permissive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Restrictive SELECT policy
CREATE POLICY "Project files read access"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND public.user_can_access_storage_object(name, auth.uid())
  );

-- Restrictive INSERT policy
CREATE POLICY "Project files insert access"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND public.user_can_access_storage_object(name, auth.uid())
  );

-- Restrictive UPDATE policy
CREATE POLICY "Project files update access"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND public.user_can_access_storage_object(name, auth.uid())
  )
  WITH CHECK (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND public.user_can_access_storage_object(name, auth.uid())
  );

-- Restrictive DELETE policy
CREATE POLICY "Project files delete access"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'project-files'
    AND auth.role() = 'authenticated'
    AND public.user_can_access_storage_object(name, auth.uid())
  );

