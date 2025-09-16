-- Fix Login Issues Script
-- This script addresses common authentication and RLS issues

-- Step 1: Disable RLS temporarily to check for issues
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.puja_history DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view donors" ON public.donors;
DROP POLICY IF EXISTS "Authenticated users can view donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can view receipts" ON public.receipts;
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can manage donors" ON public.donors;
DROP POLICY IF EXISTS "Authenticated users can manage donations" ON public.donations;
DROP POLICY IF EXISTS "Authenticated users can manage receipts" ON public.receipts;

-- Step 3: Ensure all required permissions are granted
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.donors TO authenticated;
GRANT ALL ON public.donations TO authenticated;
GRANT ALL ON public.receipts TO authenticated;
GRANT ALL ON public.sms_events TO authenticated;
GRANT ALL ON public.puja_history TO authenticated;

GRANT ALL ON public.users TO anon;
GRANT ALL ON public.donors TO anon;
GRANT ALL ON public.donations TO anon;
GRANT ALL ON public.receipts TO anon;
GRANT ALL ON public.sms_events TO anon;
GRANT ALL ON public.puja_history TO anon;

-- Grant usage on all sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant all permissions to service_role (for admin operations)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Step 4: Create simple RLS policies that allow access
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.users
    FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.donors
    FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.donations
    FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.receipts
    FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.sms_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.sms_events
    FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.puja_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated users" ON public.puja_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 5: Create or update the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new user record with default role
  INSERT INTO public.users (id, name, role, permissions, email_verified, join_date)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    'user',
    ARRAY['dashboard:read'],
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Check and ensure your admin user exists
-- Replace 'your-email@example.com' with your actual admin email
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find the admin user by email from auth.users
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'pradip.lamsal.1000@gmail.com' -- Replace with your admin email
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Update or insert the admin user in public.users
        INSERT INTO public.users (id, name, role, permissions, email_verified, join_date)
        VALUES (
            admin_user_id,
            'Pradip Admin',
            'admin',
            ARRAY['dashboard:read', 'admin:access'],
            true,
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin',
            permissions = ARRAY['dashboard:read', 'admin:access'],
            updated_at = NOW();
            
        RAISE NOTICE 'Admin user setup completed for ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No auth user found with the specified email. Please sign up first.';
    END IF;
END $$;

-- Step 8: Test basic functionality
SELECT 'Authentication fix script completed!' as status;
SELECT 'Checking users table...' as check_type;
SELECT id, name, role, email_verified FROM public.users LIMIT 5;

-- Step 9: Verify RLS is working
SELECT 'RLS Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'donors', 'donations', 'receipts')
ORDER BY tablename;
