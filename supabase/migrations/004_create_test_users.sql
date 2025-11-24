-- ============================================
-- TEST USERS FOR RBAC TESTING
-- ============================================
-- This migration creates test users for testing different roles
-- NOTE: These are example users. In production, you should create real users through signup.

-- First, you need to create auth users manually in Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Create users with these emails:
--    - admin@test.com
--    - supervisor@test.com
--    - user@test.com
-- 3. Set passwords (e.g., "Test123!@#")
-- 4. Then run this migration to set their roles

-- After creating auth users, update their roles:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@test.com';
-- UPDATE public.users SET role = 'supervisor' WHERE email = 'supervisor@test.com';
-- UPDATE public.users SET role = 'user' WHERE email = 'user@test.com';

-- OR use this function to set role for a user by email:
CREATE OR REPLACE FUNCTION public.set_user_role(user_email TEXT, new_role TEXT)
RETURNS void AS $$
BEGIN
  -- Validate role
  IF new_role NOT IN ('admin', 'supervisor', 'user') THEN
    RAISE EXCEPTION 'Invalid role: %. Must be admin, supervisor, or user', new_role;
  END IF;
  
  -- Update role
  UPDATE public.users
  SET role = new_role
  WHERE email = user_email;
  
  -- Check if user was found
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (admins will use this)
GRANT EXECUTE ON FUNCTION public.set_user_role(TEXT, TEXT) TO authenticated;

COMMENT ON FUNCTION public.set_user_role IS 'Sets the role for a user by email. Only admins should use this.';

