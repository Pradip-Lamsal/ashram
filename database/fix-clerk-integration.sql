-- Fix users table to work with Clerk authentication
-- This modifies the table to use TEXT instead of UUID for Clerk user IDs
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Check current table structure
\d public.users;

-- Step 2: Drop the foreign key constraint to auth.users (since we're using Clerk, not Supabase auth)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 3: Change the id column from UUID to TEXT to support Clerk user IDs
ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;

-- Step 4: Update the default role to 'user' instead of 'devotee'
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'user';

-- Step 5: Now insert your user with the Clerk ID
INSERT INTO public.users (id, name, role, permissions, email_verified, join_date, created_at, updated_at)
VALUES (
    'user_32ELu9NzlRuBLlDBFjiFJE4clgv',  -- Your Clerk user ID (now works as TEXT)
    'Admin User',                         -- You can change this name
    'admin',                              -- Set as admin
    ARRAY['dashboard:read', 'admin:access'], 
    true,                                 
    NOW(),                               
    NOW(),                               
    NOW()                                
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    permissions = ARRAY['dashboard:read', 'admin:access'],
    updated_at = NOW();

-- Step 6: Also need to update donations table to use TEXT for created_by field
ALTER TABLE public.donations ALTER COLUMN created_by TYPE TEXT;

-- Step 7: Verify the changes worked
SELECT id, name, role, permissions FROM public.users WHERE id = 'user_32ELu9NzlRuBLlDBFjiFJE4clgv';

-- Step 8: Show all users
SELECT id, name, role FROM public.users ORDER BY role, name;

SELECT 'Database schema updated for Clerk integration!' as result;
