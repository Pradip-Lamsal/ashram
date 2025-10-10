-- Update donations table to support Nepali dates directly
-- This will store Nepali dates as strings in YYYY/MM/DD format

-- Add Nepali date columns for Seva Donation periods
ALTER TABLE donations 
ADD COLUMN IF NOT EXISTS start_date_nepali VARCHAR(12);

ALTER TABLE donations
ADD COLUMN IF NOT EXISTS end_date_nepali VARCHAR(12);

-- Add comments to explain the purpose
COMMENT ON COLUMN donations.start_date_nepali IS 'Start date in Nepali format (YYYY/MM/DD) for Seva Donation periods';
COMMENT ON COLUMN donations.end_date_nepali IS 'End date in Nepali format (YYYY/MM/DD) for Seva Donation periods';

-- Display confirmation
SELECT 'Nepali date columns added successfully!' as status;