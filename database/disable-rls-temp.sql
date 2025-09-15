-- Temporary fix: Disable RLS for development
-- Run this SQL in your Supabase SQL editor to temporarily disable RLS

-- Disable RLS on all tables temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.puja_history DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "authenticated_users_donors_all" ON public.donors;
DROP POLICY IF EXISTS "authenticated_users_donations_all" ON public.donations;
DROP POLICY IF EXISTS "authenticated_users_receipts_all" ON public.receipts;
DROP POLICY IF EXISTS "authenticated_users_users_all" ON public.users;
DROP POLICY IF EXISTS "authenticated_users_sms_events_all" ON public.sms_events;
DROP POLICY IF EXISTS "authenticated_users_puja_history_all" ON public.puja_history;

SELECT 'RLS disabled! Data should be accessible now.' as status;
