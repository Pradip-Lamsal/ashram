-- Add 'Gau Seva' to donation_type constraints

-- 1. If donation_type is an ENUM, add the new value
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'donation_type') THEN
        ALTER TYPE donation_type ADD VALUE IF NOT EXISTS 'Gau Seva';
    END IF;
END $$;

-- 2. If there are CHECK constraints on the donors table, update them
DO $$
BEGIN
    -- Check if there's a constraint on donation_type in donors table
    IF EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'donors' AND column_name = 'donation_type'
    ) THEN
        -- We can't easily modify a check constraint, so we drop and recreate it
        -- Note: You might need to adjust the constraint name if it's different
        ALTER TABLE donors DROP CONSTRAINT IF EXISTS donors_donation_type_check;
        ALTER TABLE donors ADD CONSTRAINT donors_donation_type_check 
            CHECK (donation_type IN (
                'General Donation', 
                'Seva Donation', 
                'Annadanam', 
                'Vastra Danam', 
                'Building Fund', 
                'Festival Sponsorship', 
                'Puja Sponsorship',
                'Gau Seva'
            ));
    END IF;
END $$;

-- 3. If there are CHECK constraints on the donations table, update them
DO $$
BEGIN
    -- Check if there's a constraint on donation_type in donations table
    IF EXISTS (
        SELECT 1 
        FROM information_schema.constraint_column_usage 
        WHERE table_name = 'donations' AND column_name = 'donation_type'
    ) THEN
        ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_donation_type_check;
        ALTER TABLE donations ADD CONSTRAINT donations_donation_type_check 
            CHECK (donation_type IN (
                'General Donation', 
                'Seva Donation', 
                'Annadanam', 
                'Vastra Danam', 
                'Building Fund', 
                'Festival Sponsorship', 
                'Puja Sponsorship',
                'Gau Seva'
            ));
    END IF;
END $$;
