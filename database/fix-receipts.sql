-- Fix Receipt Number Generation
-- Run this in Supabase SQL Editor to add the missing receipt number generation

-- Step 1: Create or replace function to generate receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    receipt_num TEXT;
BEGIN
    -- Get the next number in sequence, starting from 1 if no receipts exist
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 'ASH([0-9]+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.receipts
    WHERE receipt_number ~ '^ASH[0-9]+$' AND receipt_number IS NOT NULL;
    
    -- Ensure we have a valid number
    IF next_number IS NULL THEN
        next_number := 1;
    END IF;
    
    -- Format as ASH + 9 digits with leading zeros
    receipt_num := 'ASH' || LPAD(next_number::TEXT, 9, '0');
    
    RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create or replace trigger function to set receipt number
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Always generate a receipt number, even if one is provided
    NEW.receipt_number := generate_receipt_number();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop and recreate trigger to ensure it's current
DROP TRIGGER IF EXISTS trigger_set_receipt_number ON public.receipts;
CREATE TRIGGER trigger_set_receipt_number
    BEFORE INSERT ON public.receipts
    FOR EACH ROW
    EXECUTE FUNCTION set_receipt_number();

-- Step 4: Make receipt_number nullable temporarily and add default
ALTER TABLE public.receipts ALTER COLUMN receipt_number DROP NOT NULL;
ALTER TABLE public.receipts ALTER COLUMN receipt_number SET DEFAULT generate_receipt_number();

-- Step 5: Update any existing NULL receipt numbers
UPDATE public.receipts 
SET receipt_number = generate_receipt_number() 
WHERE receipt_number IS NULL;

-- Step 6: Make it NOT NULL again
ALTER TABLE public.receipts ALTER COLUMN receipt_number SET NOT NULL;

-- Step 7: Test the function
SELECT 'Receipt number generation fixed!' as result;
SELECT generate_receipt_number() as sample_receipt_number;
