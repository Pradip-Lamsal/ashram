-- Quick Fix for Nepali Date Constraint Issue
-- Run this in Supabase SQL Editor to fix the validation constraint

-- Drop the existing constraints that are causing issues
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS check_nepali_start_date;
ALTER TABLE public.donations DROP CONSTRAINT IF EXISTS check_nepali_end_date;

-- Create updated validation function that supports both ASCII and Devanagari numerals
CREATE OR REPLACE FUNCTION is_valid_nepali_date(date_str TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if format matches YYYY/MM/DD or YYYY-MM-DD
    -- Support both ASCII numerals (2082/01/01) and Devanagari numerals (२०८२-०१-०१)
    -- Also allow NULL values
    RETURN date_str IS NULL 
        OR date_str ~ '^[0-9]{4}[/-][0-9]{1,2}[/-][0-9]{1,2}$'
        OR date_str ~ '^[०-९]{4}[-/][०-९]{1,2}[-/][०-९]{1,2}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add the corrected constraints
ALTER TABLE public.donations 
ADD CONSTRAINT check_nepali_start_date 
CHECK (start_date_nepali IS NULL 
    OR start_date_nepali ~ '^[0-9]{4}[/-][0-9]{1,2}[/-][0-9]{1,2}$'
    OR start_date_nepali ~ '^[०-९]{4}[-/][०-९]{1,2}[-/][०-९]{1,2}$');

ALTER TABLE public.donations 
ADD CONSTRAINT check_nepali_end_date 
CHECK (end_date_nepali IS NULL 
    OR end_date_nepali ~ '^[0-9]{4}[/-][0-9]{1,2}[/-][0-9]{1,2}$'
    OR end_date_nepali ~ '^[०-९]{4}[-/][०-९]{1,2}[-/][०-९]{1,2}$');

-- Test the constraint with sample data
SELECT 
    'ASCII format test' as test_type,
    is_valid_nepali_date('2082/01/01') as result
UNION ALL
SELECT 
    'Devanagari format test' as test_type,
    is_valid_nepali_date('२०८२-०१-०१') as result
UNION ALL
SELECT 
    'NULL test' as test_type,
    is_valid_nepali_date(NULL) as result;

SELECT 'Nepali date constraints fixed successfully!' as status;