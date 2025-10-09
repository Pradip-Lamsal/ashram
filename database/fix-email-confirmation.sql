-- Fix Email Confirmation Issues
-- This script ensures approved users can log in by syncing email confirmation status

-- Note: You need to run this in the Supabase SQL Editor with service_role permissions

-- 1. Check current status of approved users vs auth email confirmation
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at IS NOT NULL as email_confirmed_in_auth,
    pu.name,
    pu.status,
    pu.email_verified
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.status = 'approved'
ORDER BY au.email;

-- 2. For approved users whose emails are not confirmed in auth.users,
-- we need to use the admin API to confirm them (cannot be done via SQL)
-- 
-- However, we can create a function to help identify and track these issues

-- Create a view to easily see approval/confirmation mismatches
CREATE OR REPLACE VIEW public.user_auth_status AS
SELECT 
    au.id,
    au.email,
    au.email_confirmed_at,
    au.email_confirmed_at IS NOT NULL as auth_email_confirmed,
    au.created_at as auth_created_at,
    pu.name,
    pu.status as db_status,
    pu.email_verified as db_email_verified,
    pu.role,
    pu.created_at as db_created_at,
    CASE 
        WHEN pu.status = 'approved' AND au.email_confirmed_at IS NULL THEN 'NEEDS_EMAIL_CONFIRMATION'
        WHEN pu.status = 'approved' AND au.email_confirmed_at IS NOT NULL THEN 'READY_TO_LOGIN'
        WHEN pu.status = 'pending' THEN 'AWAITING_APPROVAL'
        WHEN pu.status = 'rejected' THEN 'ACCESS_DENIED'
        ELSE 'UNKNOWN_STATUS'
    END as login_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
ORDER BY pu.status, au.email;

-- 3. View the current status
SELECT * FROM public.user_auth_status;

-- 4. Count users by login status
SELECT 
    login_status,
    COUNT(*) as user_count
FROM public.user_auth_status
GROUP BY login_status
ORDER BY user_count DESC;

-- 5. Show users who need email confirmation (approved but email not confirmed in auth)
SELECT 
    email,
    name,
    db_status,
    auth_email_confirmed,
    'Run: supabase.auth.admin.updateUserById(''' || id || ''', { email_confirm: true })' as fix_command
FROM public.user_auth_status
WHERE login_status = 'NEEDS_EMAIL_CONFIRMATION';

-- 6. Create a trigger to automatically sync email verification status
-- when a user's status is changed to approved
CREATE OR REPLACE FUNCTION public.sync_email_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user is approved, ensure their email verification status is synced
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        -- Update the email_verified flag in our database
        NEW.email_verified = true;
        
        -- Note: We cannot directly update auth.users from a trigger
        -- The email confirmation in auth.users must be done via the admin API
        -- Log this so we can track it
        RAISE NOTICE 'User % approved - email confirmation needed in auth.users', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_email_verification_trigger ON public.users;
CREATE TRIGGER sync_email_verification_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_email_verification();

-- 7. Grant necessary permissions
GRANT SELECT ON public.user_auth_status TO authenticated;
GRANT SELECT ON public.user_auth_status TO anon;

-- Display final summary
SELECT 'Email confirmation fix SQL completed!' as status;
SELECT 'Check the user_auth_status view to see current status' as next_step;
SELECT 'Users with NEEDS_EMAIL_CONFIRMATION status need admin API email confirmation' as important_note;