-- Check if Nepali date columns exist and add them if they don't
-- This script is safe to run multiple times

-- Check if columns exist
DO $$
BEGIN
    -- Check if start_date_nepali column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'donations' 
        AND column_name = 'start_date_nepali'
    ) THEN
        -- Add start_date_nepali column
        ALTER TABLE donations ADD COLUMN start_date_nepali VARCHAR(12);
        RAISE NOTICE 'Added start_date_nepali column to donations table';
    ELSE
        RAISE NOTICE 'start_date_nepali column already exists';
    END IF;

    -- Check if end_date_nepali column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'donations' 
        AND column_name = 'end_date_nepali'
    ) THEN
        -- Add end_date_nepali column
        ALTER TABLE donations ADD COLUMN end_date_nepali VARCHAR(12);
        RAISE NOTICE 'Added end_date_nepali column to donations table';
    ELSE
        RAISE NOTICE 'end_date_nepali column already exists';
    END IF;
END
$$;

-- Add comments to explain the purpose
COMMENT ON COLUMN donations.start_date_nepali IS 'Start date in Nepali format for Seva Donation periods';
COMMENT ON COLUMN donations.end_date_nepali IS 'End date in Nepali format for Seva Donation periods';

-- Display final status
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'donations' 
            AND column_name IN ('start_date_nepali', 'end_date_nepali')
        ) 
        THEN 'Nepali date columns are now available in donations table!'
        ELSE 'Migration failed - please check database permissions'
    END as status;