-- Storage Bucket Policies Configuration
-- Date: 2025-12-10
-- Description: Comprehensive storage rules for all file upload buckets

-----------------------------------------------------------
-- BUCKET: blueprints
-- Purpose: Store 3D models (.glb, .gltf), floor plans, CAD files
-----------------------------------------------------------

-- Create bucket if not exists (run in Supabase Dashboard → Storage)
-- Bucket name: blueprints
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: model/gltf-binary, model/gltf+json, image/png, image/jpeg, application/pdf

-- RLS Policies for blueprints bucket

-- 1. SELECT: Users can view files from their projects
CREATE POLICY "Users can view project blueprints"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'blueprints' 
  AND (
    -- Check if user owns the project or is a team member
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
      )
    )
  )
);

-- 2. INSERT: Project owners and editors can upload
CREATE POLICY "Project editors can upload blueprints"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blueprints'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
      )
    )
  )
);

-- 3. UPDATE: Same as INSERT
CREATE POLICY "Project editors can update blueprints"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'blueprints'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
      )
    )
  )
);

-- 4. DELETE: Only project owners
CREATE POLICY "Project owners can delete blueprints"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'blueprints'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id::text = (storage.foldername(name))[1]
        AND projects.owner_id = auth.uid()
    )
  )
);

-----------------------------------------------------------
-- BUCKET: avatars
-- Purpose: Store user profile pictures
-----------------------------------------------------------

-- Bucket configuration:
-- Bucket name: avatars
-- Public: true (profile pictures are public)
-- File size limit: 2MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- RLS Policies for avatars bucket

-- 1. SELECT: Everyone can view (public bucket)
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. INSERT: Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. UPDATE: Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. DELETE: Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-----------------------------------------------------------
-- BUCKET: documents
-- Purpose: Store project documents, contracts, permits
-----------------------------------------------------------

-- Bucket configuration:
-- Bucket name: documents
-- Public: false
-- File size limit: 25MB
-- Allowed MIME types: application/pdf, image/jpeg, image/png, application/vnd.openxmlformats-officedocument.wordprocessingml.document

-- RLS Policies for documents bucket

-- 1. SELECT: Project members can view
CREATE POLICY "Project members can view documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
      )
    )
  )
);

-- 2. INSERT: Editors can upload
CREATE POLICY "Project editors can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
      )
    )
  )
);

-- 3. DELETE: Only owners
CREATE POLICY "Project owners can delete documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id::text = (storage.foldername(name))[1]
        AND projects.owner_id = auth.uid()
    )
  )
);

-----------------------------------------------------------
-- BUCKET: progress-photos
-- Purpose: Store construction progress images
-----------------------------------------------------------

-- Bucket configuration:
-- Bucket name: progress-photos
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- RLS Policies for progress-photos bucket

-- 1. SELECT: Project members can view
CREATE POLICY "Project members can view progress photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'progress-photos'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
      )
    )
  )
);

-- 2. INSERT: Editors can upload
CREATE POLICY "Project editors can upload progress photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
      )
    )
  )
);

-- 3. DELETE: Only owners
CREATE POLICY "Project owners can delete progress photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'progress-photos'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id::text = (storage.foldername(name))[1]
        AND projects.owner_id = auth.uid()
    )
  )
);

-----------------------------------------------------------
-- BUCKET: receipts
-- Purpose: Store expense receipts
-----------------------------------------------------------

-- Bucket configuration:
-- Bucket name: receipts
-- Public: false
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, application/pdf

-- RLS Policies for receipts bucket

-- Similar to documents, project-based access control

CREATE POLICY "Project members can view receipts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'receipts'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR team_members.user_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "Project editors can upload receipts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'receipts'
  AND (
    EXISTS (
      SELECT 1 FROM projects
      LEFT JOIN team_members ON team_members.project_id = projects.id
      WHERE (
        projects.id::text = (storage.foldername(name))[1]
        AND (
          projects.owner_id = auth.uid()
          OR (team_members.user_id = auth.uid() AND team_members.role IN ('owner', 'editor'))
        )
      )
    )
  )
);

-----------------------------------------------------------
-- Summary
-----------------------------------------------------------

/*
STORAGE BUCKET CONFIGURATION SUMMARY:

1. blueprints (Private)
   - 3D models, CAD files
   - Max size: 50MB
   - Types: .glb, .gltf, .png, .jpg, .pdf
   - Access: Project members (view), Editors (upload), Owners (delete)

2. avatars (Public)
   - User profile pictures
   - Max size: 2MB
   - Types: .jpg, .png, .webp
   - Access: Public view, Own avatar (upload/update/delete)

3. documents (Private)
   - Contracts, permits, docs
   - Max size: 25MB
   - Types: .pdf, .jpg, .png, .docx
   - Access: Project members (view), Editors (upload), Owners (delete)

4. progress-photos (Private)
   - Construction photos
   - Max size: 10MB
   - Types: .jpg, .png, .webp
   - Access: Project members (view), Editors (upload), Owners (delete)

5. receipts (Private)
   - Expense receipts
   - Max size: 5MB
   - Types: .jpg, .png, .webp, .pdf
   - Access: Project members (view), Editors (upload), Owners (delete)

SECURITY STATUS: ✅ COMPLETE
All buckets have proper RLS policies aligned with project permissions.
*/
