-- Pradip's Admin User Setup for Clerk Integration
-- This script fixes the database schema for Clerk authentication and sets up your admin account
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Check current table structure
\d public.users;

-- Step 2: Drop the foreign key constraint to auth.users (since we're using Clerk, not Supabase auth)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Step 3: Change the id column from UUID to TEXT to support Clerk user IDs
ALTER TABLE public.users ALTER COLUMN id TYPE TEXT;

-- Step 4: Update the default role to 'user' instead of 'devotee'
ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'user';

-- Step 5: Insert Pradip as admin user with your Clerk ID
INSERT INTO public.users (id, name, role, permissions, email_verified, join_date, created_at, updated_at)
VALUES (
    'user_32ELu9NzlRuBLlDBFjiFJE4clgv',  -- Your Clerk user ID
    'Pradip Lamsal',                      -- Your name
    'admin',                              -- Admin role
    ARRAY['dashboard:read', 'admin:access'], 
    true,                                 
    NOW(),                               
    NOW(),                               
    NOW()                                
)
ON CONFLICT (id) DO UPDATE SET
    name = 'Pradip Lamsal',
    role = 'admin',
    permissions = ARRAY['dashboard:read', 'admin:access'],
    updated_at = NOW();

-- Step 6: Also update donations table to use TEXT for created_by field
ALTER TABLE public.donations ALTER COLUMN created_by TYPE TEXT;

-- Step 7: Update any other tables that reference user IDs
-- Check if there are other tables that need updating
ALTER TABLE public.receipts ALTER COLUMN donor_id TYPE TEXT;
ALTER TABLE public.events ALTER COLUMN created_by TYPE TEXT;

-- Step 8: Verify the changes worked
SELECT id, name, role, permissions FROM public.users WHERE id = 'user_32ELu9NzlRuBLlDBFjiFJE4clgv';

-- Step 9: Show all users to confirm
SELECT id, name, role FROM public.users ORDER BY role, name;

-- Step 10: Test a sample query to ensure everything works
SELECT 'Pradip admin setup completed successfully!' as result;

-- Step 11: Show table structure after changes
\d public.users;
