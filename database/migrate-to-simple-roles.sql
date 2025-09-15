-- Migrate to simplified role system: admin and user
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Check current users and their roles
SELECT id, name, role FROM public.users;

-- Step 2: Update the enum type to support the new roles
-- First, add the 'user' role to the enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'user';

-- Step 3: Migrate existing roles to the new system
-- Convert all non-admin roles to 'user'
UPDATE public.users 
SET role = 'user' 
WHERE role IN ('billing_staff', 'event_coordinator', 'devotee');

-- Step 4: Verify the migration
SELECT 
    role, 
    COUNT(*) as user_count 
FROM public.users 
GROUP BY role 
ORDER BY role;

-- Step 5: Show all users with their new roles
SELECT id, name, role FROM public.users ORDER BY role, name;

-- Optional: If you want to make yourself an admin
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = 'your-clerk-user-id-here';

SELECT 'Role migration completed! All users are now either admin or user.' as result;
