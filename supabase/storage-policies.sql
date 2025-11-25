-- Secure Storage Policies for project-files bucket

-- Helper functions defined in migrations:
-- - public.project_id_from_storage_path(text)
-- - public.user_can_access_storage_object(text, uuid)

-- Policy: Authenticated users with project access can read objects
CREATE POLICY "Project files read access"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-files'
  AND auth.role() = 'authenticated'
  AND public.user_can_access_storage_object(name, auth.uid())
);

-- Policy: Authenticated users with project access can upload
CREATE POLICY "Project files insert access"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files'
  AND auth.role() = 'authenticated'
  AND public.user_can_access_storage_object(name, auth.uid())
);

-- Policy: Authenticated users with project access can update
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

-- Policy: Authenticated users with project access can delete
CREATE POLICY "Project files delete access"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files'
  AND auth.role() = 'authenticated'
  AND public.user_can_access_storage_object(name, auth.uid())
);
