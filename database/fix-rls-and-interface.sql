-- Fix RLS policies and interface mismatch
-- Run this SQL in your Supabase SQL editor

-- Step 1: Enable RLS on all tables (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puja_history ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Staff can read donors" ON public.donors;
DROP POLICY IF EXISTS "Staff can insert donors" ON public.donors;
DROP POLICY IF EXISTS "Staff can update donors" ON public.donors;
DROP POLICY IF EXISTS "Staff can read donations" ON public.donations;
DROP POLICY IF EXISTS "Staff can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Staff can read receipts" ON public.receipts;
DROP POLICY IF EXISTS "Staff can insert receipts" ON public.receipts;
DROP POLICY IF EXISTS "Staff can update receipts" ON public.receipts;

-- Step 3: Create simplified policies for authenticated users
-- Allow all authenticated users to read/write donors (we'll handle role checks in the app)
CREATE POLICY "authenticated_users_donors_all" ON public.donors
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read/write donations
CREATE POLICY "authenticated_users_donations_all" ON public.donations
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read/write receipts
CREATE POLICY "authenticated_users_receipts_all" ON public.receipts
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read/write users
CREATE POLICY "authenticated_users_users_all" ON public.users
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read/write sms_events
CREATE POLICY "authenticated_users_sms_events_all" ON public.sms_events
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow all authenticated users to read/write puja_history
CREATE POLICY "authenticated_users_puja_history_all" ON public.puja_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Verify policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

SELECT 'RLS policies fixed! All authenticated users can now access the data.' as status;
