-- Add start_date and end_date columns to donations table for Seva Donation periods
-- This allows tracking of donation periods for Seva Donation (मुठी दान)

-- Add start_date column if it doesn't exist
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS start_date DATE;

-- Add end_date column if it doesn't exist  
ALTER TABLE donations
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add comment to explain the purpose
COMMENT ON COLUMN donations.start_date IS 'Start date for Seva Donation periods (मुठी दान)';
COMMENT ON COLUMN donations.end_date IS 'End date for Seva Donation periods (मुठी दान)';

-- Update some existing Seva Donation records to have sample date ranges for testing
-- This is just for demonstration - you can remove this section if not needed
UPDATE donations 
SET 
  start_date = date_of_donation,
  end_date = date_of_donation + INTERVAL '30 days'
WHERE 
  donation_type = 'Seva Donation' 
  AND start_date IS NULL 
  AND end_date IS NULL
  AND date_of_donation IS NOT NULL;

-- Display confirmation
SELECT 'Donation date range columns added successfully!' as status;

-- Show sample of updated records
SELECT 
  id,
  donation_type,
  date_of_donation,
  start_date,
  end_date,
  amount
FROM donations 
WHERE donation_type = 'Seva Donation'
ORDER BY created_at DESC
LIMIT 5;