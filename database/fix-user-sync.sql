-- Fix user role issue - First check what users exist in the database
-- Run this SQL step by step in your Supabase SQL Editor

-- Step 1: Check what users currently exist in the database
SELECT id, name, role, created_at FROM public.users ORDER BY created_at DESC;

-- Step 2: Check if the Clerk user exists at all
-- This will show empty if the user hasn't been synced to Supabase yet
SELECT id, name, role FROM public.users WHERE id::text LIKE '%32ELu9NzlRuBLlDBFjiFJE4clgv%';

-- Step 3: If the user doesn't exist, create them manually with admin role
-- Replace the Clerk user ID and details with your actual information
INSERT INTO public.users (id, name, role, permissions, email_verified, join_date, created_at, updated_at)
VALUES (
    'user_32ELu9NzlRuBLlDBFjiFJE4clgv',  -- Your Clerk user ID
    'Your Name Here',                     -- Replace with your actual name
    'admin',                              -- Set as admin
    ARRAY['dashboard:read', 'admin:access'], -- Admin permissions
    true,                                 -- Email verified
    NOW(),                               -- Join date
    NOW(),                               -- Created at
    NOW()                                -- Updated at
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    permissions = ARRAY['dashboard:read', 'admin:access'],
    updated_at = NOW();

-- Step 4: Verify the user was created/updated
SELECT id, name, role, permissions FROM public.users WHERE id = 'user_32ELu9NzlRuBLlDBFjiFJE4clgv';

-- Step 5: Final check - show all users
SELECT id, name, role FROM public.users ORDER BY role, name;
