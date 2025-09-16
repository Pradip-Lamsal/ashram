-- Database Diagnostic Script
-- Run this to see what issues exist in the current database

-- Check if main tables exist
SELECT 
    'Table Existence Check' as check_type,
    schemaname,
    tablename,
    CASE 
        WHEN tablename IN ('users', 'donors', 'donations', 'receipts', 'sms_events') 
        THEN 'REQUIRED' 
        ELSE 'INFO' 
    END as importance
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS status
SELECT 
    'RLS Status Check' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('users', 'donors', 'donations', 'receipts', 'sms_events')
ORDER BY tablename;

-- Check for problematic functions
SELECT 
    'Function Check' as check_type,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
    'authenticate_admin',
    'is_admin',
    'delete_user_with_options', 
    'get_user_deletion_preview',
    'handle_new_user',
    'update_updated_at_column'
)
ORDER BY routine_name;

-- Check for any error-prone triggers
SELECT 
    'Trigger Check' as check_type,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check current policies
SELECT 
    'Policy Check' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check for any foreign key constraints that might be broken
SELECT 
    'Foreign Key Check' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
