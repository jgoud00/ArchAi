-- Storage Bucket Policies for project-files bucket

-- Enable public access for authenticated users
-- Note: You can make the bucket public or use these policies

-- Policy: Allow public read access to files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-files');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to update their own files
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);

-- Policy: Allow authenticated users to delete files
-- You may want to restrict this further to only project owners
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-files' 
  AND auth.role() = 'authenticated'
);
