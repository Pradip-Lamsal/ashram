-- Check Test Frequency donor data
SELECT 
  id,
  name,
  frequency,
  frequency_amount,
  total_donations,
  created_at
FROM donors
WHERE name = 'Test Frequency'
AND deleted_at IS NULL;
