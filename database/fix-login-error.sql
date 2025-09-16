-- Fix login issue - Updated handle_new_user function
-- Run this in your Supabase SQL Editor to fix the login error

-- Step 1: Add status column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'approved' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Step 2: Fix the handle_new_user function (using your actual table structure)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    name,
    role,
    permissions,
    join_date,
    status,
    email_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    'user',
    ARRAY['dashboard:read'],
    NOW(),
    'approved', -- Set to approved so users can login immediately
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', users.name),
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Make sure all existing users can login by setting them to approved
UPDATE public.users 
SET status = 'approved';

-- Step 4: Set admin permissions for your account (replace with your actual user ID)
UPDATE public.users 
SET 
  role = 'admin',
  permissions = ARRAY[
    'dashboard:read',
    'dashboard:write', 
    'users:read',
    'users:write',
    'users:approve',
    'users:reject',
    'donors:read',
    'donors:write',
    'events:read', 
    'events:write',
    'receipts:read',
    'receipts:write',
    'admin:access'
  ]
WHERE name = 'Pradip Lamsal' OR id = (
  SELECT id FROM public.users ORDER BY created_at LIMIT 1
);

-- Step 5: Make sure trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verification query - check all users and their status
SELECT id, name, role, permissions, status, created_at 
FROM public.users 
ORDER BY created_at DESC;