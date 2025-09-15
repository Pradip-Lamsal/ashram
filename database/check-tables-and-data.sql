-- Comprehensive SQL query to check all tables and data in the ashram database
-- This provides a complete overview of the database structure and contents

-- 1. Check all tables and their row counts
SELECT 
    schemaname,
    tablename,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = t.tablename) as table_exists,
    (CASE 
        WHEN tablename = 'users' THEN (SELECT COUNT(*) FROM public.users)
        WHEN tablename = 'donors' THEN (SELECT COUNT(*) FROM public.donors WHERE deleted_at IS NULL)
        WHEN tablename = 'donations' THEN (SELECT COUNT(*) FROM public.donations WHERE deleted_at IS NULL)
        WHEN tablename = 'receipts' THEN (SELECT COUNT(*) FROM public.receipts WHERE deleted_at IS NULL)
        WHEN tablename = 'events' THEN (SELECT COUNT(*) FROM public.events)
        ELSE 0
    END) as row_count
FROM (
    VALUES 
        ('public', 'users'),
        ('public', 'donors'),
        ('public', 'donations'),
        ('public', 'receipts'),
        ('public', 'events')
) AS t(schemaname, tablename);

-- 2. Users table details
SELECT 'USERS TABLE' as section;
SELECT 
    id,
    name,
    role,
    email_verified,
    array_length(permissions, 1) as permission_count,
    created_at
FROM public.users 
ORDER BY created_at DESC;

-- 3. Donors summary
SELECT 'DONORS SUMMARY' as section;
SELECT 
    COUNT(*) as total_donors,
    COUNT(CASE WHEN membership = 'Life' THEN 1 END) as life_members,
    COUNT(CASE WHEN membership = 'Regular' THEN 1 END) as regular_members,
    COUNT(CASE WHEN membership = 'Special' THEN 1 END) as special_members,
    SUM(total_donations) as total_donor_contributions,
    AVG(total_donations) as avg_donation_per_donor
FROM public.donors 
WHERE deleted_at IS NULL;

-- 4. Recent donors
SELECT 'RECENT DONORS' as section;
SELECT 
    name,
    donation_type,
    membership,
    total_donations,
    last_donation_date,
    created_at
FROM public.donors 
WHERE deleted_at IS NULL
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Donations summary by payment mode
SELECT 'DONATIONS BY PAYMENT MODE' as section;
SELECT 
    payment_mode,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM public.donations 
WHERE deleted_at IS NULL
GROUP BY payment_mode
ORDER BY total_amount DESC;

-- 6. Donations summary by type
SELECT 'DONATIONS BY TYPE' as section;
SELECT 
    donation_type,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM public.donations 
WHERE deleted_at IS NULL
GROUP BY donation_type
ORDER BY total_amount DESC;

-- 7. Recent donations with donor info
SELECT 'RECENT DONATIONS' as section;
SELECT 
    d.amount,
    d.donation_type,
    d.payment_mode,
    d.date_of_donation,
    don.name as donor_name,
    u.name as created_by_user
FROM public.donations d
LEFT JOIN public.donors don ON d.donor_id = don.id
LEFT JOIN public.users u ON d.created_by = u.id
WHERE d.deleted_at IS NULL
ORDER BY d.created_at DESC 
LIMIT 10;

-- 8. Receipts summary
SELECT 'RECEIPTS SUMMARY' as section;
SELECT 
    COUNT(*) as total_receipts,
    COUNT(CASE WHEN is_printed = true THEN 1 END) as printed_receipts,
    COUNT(CASE WHEN is_email_sent = true THEN 1 END) as emailed_receipts,
    COUNT(CASE WHEN is_printed = true AND is_email_sent = true THEN 1 END) as both_printed_and_emailed
FROM public.receipts 
WHERE deleted_at IS NULL;

-- 9. Recent receipts with full info
SELECT 'RECENT RECEIPTS' as section;
SELECT 
    r.receipt_number,
    r.issued_at,
    r.is_printed,
    r.is_email_sent,
    d.amount,
    d.donation_type,
    don.name as donor_name
FROM public.receipts r
LEFT JOIN public.donations d ON r.donation_id = d.id
LEFT JOIN public.donors don ON d.donor_id = don.id
WHERE r.deleted_at IS NULL
ORDER BY r.issued_at DESC 
LIMIT 10;

-- 10. Events summary
SELECT 'EVENTS SUMMARY' as section;
SELECT 
    COUNT(*) as total_events,
    COUNT(CASE WHEN date >= CURRENT_DATE THEN 1 END) as upcoming_events,
    COUNT(CASE WHEN date < CURRENT_DATE THEN 1 END) as past_events
FROM public.events;

-- 11. All events
SELECT 'ALL EVENTS' as section;
SELECT 
    name,
    description,
    date,
    location,
    created_at
FROM public.events 
ORDER BY date DESC;

-- 12. Overall statistics for dashboard
SELECT 'DASHBOARD STATISTICS' as section;
SELECT 
    (SELECT COUNT(*) FROM public.users) as total_users,
    (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as admin_users,
    (SELECT COUNT(*) FROM public.users WHERE role = 'user') as regular_users,
    (SELECT COUNT(*) FROM public.donors WHERE deleted_at IS NULL) as total_donors,
    (SELECT COUNT(*) FROM public.donations WHERE deleted_at IS NULL) as total_donations,
    (SELECT COALESCE(SUM(amount), 0) FROM public.donations WHERE deleted_at IS NULL) as total_amount,
    (SELECT COUNT(*) FROM public.receipts WHERE deleted_at IS NULL) as total_receipts,
    (SELECT COUNT(*) FROM public.events) as total_events;

-- 13. Top donors by contribution
SELECT 'TOP DONORS BY CONTRIBUTION' as section;
SELECT 
    name,
    total_donations,
    donation_type,
    membership,
    last_donation_date
FROM public.donors 
WHERE deleted_at IS NULL AND total_donations > 0
ORDER BY total_donations DESC 
LIMIT 10;

-- 14. Monthly donation trends (current year)
SELECT 'MONTHLY DONATION TRENDS 2025' as section;
SELECT 
    EXTRACT(MONTH FROM date_of_donation) as month,
    TO_CHAR(DATE_TRUNC('month', date_of_donation), 'Mon YYYY') as month_name,
    COUNT(*) as donation_count,
    SUM(amount) as total_amount,
    AVG(amount) as avg_amount
FROM public.donations 
WHERE deleted_at IS NULL 
    AND EXTRACT(YEAR FROM date_of_donation) = 2025
GROUP BY EXTRACT(MONTH FROM date_of_donation), DATE_TRUNC('month', date_of_donation)
ORDER BY month;

-- 15. Database health check
SELECT 'DATABASE HEALTH CHECK' as section;
SELECT 
    'Tables Created' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') 
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donors')
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'donations')
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'receipts')
         AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events')
        THEN 'PASS - All tables exist'
        ELSE 'FAIL - Missing tables'
    END as status
UNION ALL
SELECT 
    'RLS Enabled' as check_type,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) >= 5
        THEN 'PASS - RLS enabled on tables'
        ELSE 'FAIL - RLS not properly configured'
    END as status
UNION ALL
SELECT 
    'Functions Exist' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'handle_new_user')
         AND EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name = 'generate_receipt_number')
        THEN 'PASS - Required functions exist'
        ELSE 'FAIL - Missing functions'
    END as status;

-- End of comprehensive database check
SELECT '=== DATABASE CHECK COMPLETE ===' as final_message;
