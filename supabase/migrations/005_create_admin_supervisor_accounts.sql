-- ============================================
-- Create Admin and Supervisor Accounts
-- ============================================
-- This migration creates the initial admin and supervisor accounts
-- Run this after creating the users in Supabase Auth Dashboard

-- IMPORTANT: First create these users in Supabase Dashboard:
-- 1. Go to Authentication > Users > Add User
-- 2. Create user with email: admin@architectai.com, password: Admin@123
-- 3. Create user with email: supervisor@architectai.com, password: Supervisor@123
-- 4. Then run this migration to set their roles

-- Set admin role
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@architectai.com';

-- Set supervisor role
UPDATE public.users 
SET role = 'supervisor' 
WHERE email = 'supervisor@architectai.com';

-- Verify roles were set
SELECT email, role, display_name 
FROM public.users 
WHERE email IN ('admin@architectai.com', 'supervisor@architectai.com');

