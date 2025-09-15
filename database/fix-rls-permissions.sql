-- Fix Row Level Security policies for existing tables
-- Based on the actual database schema shown in Supabase dashboard

-- Disable RLS on all existing tables
ALTER TABLE public.donors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to authenticated users for all tables
GRANT ALL ON public.donors TO authenticated;
GRANT ALL ON public.donations TO authenticated;
GRANT ALL ON public.receipts TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.users TO authenticated;

-- Grant full permissions to anon users (for initial setup and public access)
GRANT ALL ON public.donors TO anon;
GRANT ALL ON public.donations TO anon;
GRANT ALL ON public.receipts TO anon;
GRANT ALL ON public.events TO anon;
GRANT ALL ON public.users TO anon;

-- Grant usage on all sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Ensure the service_role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Print confirmation
DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Row Level Security disabled for all tables';
    RAISE NOTICE 'SUCCESS: Full permissions granted to authenticated, anon, and service_role';
    RAISE NOTICE 'Tables configured: donors, donations, receipts, events, users';
END $$;
