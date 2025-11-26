-- Fix Donor Totals Calculation
-- This script recalculates all donor totals and ensures the trigger is working

-- Step 1: Recalculate all donor totals from actual donations
UPDATE donors d
SET 
  total_donations = COALESCE((
    SELECT SUM(amount)
    FROM donations
    WHERE donor_id = d.id AND deleted_at IS NULL
  ), 0),
  last_donation_date = (
    SELECT MAX(date_of_donation)
    FROM donations
    WHERE donor_id = d.id AND deleted_at IS NULL
  ),
  updated_at = NOW()
WHERE d.deleted_at IS NULL;

-- Step 2: Verify the trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_update_donor_totals'
  ) THEN
    RAISE NOTICE 'WARNING: trigger_update_donor_totals does not exist!';
    RAISE NOTICE 'Please run complete-functions-fix.sql to create it.';
  ELSE
    RAISE NOTICE 'SUCCESS: trigger_update_donor_totals exists and is active.';
  END IF;
END $$;

-- Step 3: Show summary of results
SELECT 
  COUNT(*) as total_donors,
  COUNT(CASE WHEN total_donations > 0 THEN 1 END) as donors_with_donations,
  COUNT(CASE WHEN total_donations = 0 THEN 1 END) as donors_without_donations,
  SUM(total_donations) as total_all_donations
FROM donors
WHERE deleted_at IS NULL;

-- Step 4: Show donors with mismatched totals (if any)
SELECT 
  d.id,
  d.name,
  d.total_donations as recorded_total,
  COALESCE(SUM(dn.amount), 0) as actual_total,
  d.total_donations - COALESCE(SUM(dn.amount), 0) as difference
FROM donors d
LEFT JOIN donations dn ON dn.donor_id = d.id AND dn.deleted_at IS NULL
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.name, d.total_donations
HAVING d.total_donations != COALESCE(SUM(dn.amount), 0)
ORDER BY difference DESC;

-- Step 5: Final confirmation message
DO $$
BEGIN
  RAISE NOTICE '✅ Donor totals recalculation complete!';
END $$;
