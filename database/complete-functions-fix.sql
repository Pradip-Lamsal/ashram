-- Complete Database Functions Fix
-- Run this in Supabase SQL Editor to add all missing functions and triggers

-- Step 1: Create receipt number generation function
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

-- Step 2: Create trigger function to set receipt number
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Always generate a receipt number, even if one is provided
    NEW.receipt_number := generate_receipt_number();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create function to update donor totals
CREATE OR REPLACE FUNCTION update_donor_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total donations and last donation date
    UPDATE public.donors
    SET 
        total_donations = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.donations
            WHERE donor_id = NEW.donor_id AND deleted_at IS NULL
        ),
        last_donation_date = (
            SELECT MAX(date_of_donation)
            FROM public.donations
            WHERE donor_id = NEW.donor_id AND deleted_at IS NULL
        ),
        updated_at = NOW()
    WHERE id = NEW.donor_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Drop all existing triggers
DROP TRIGGER IF EXISTS trigger_set_receipt_number ON public.receipts;
DROP TRIGGER IF EXISTS trigger_update_donor_totals ON public.donations;
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_donors_updated_at ON public.donors;
DROP TRIGGER IF EXISTS trigger_donations_updated_at ON public.donations;
DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;

-- Step 6: Create all triggers
CREATE TRIGGER trigger_set_receipt_number
    BEFORE INSERT ON public.receipts
    FOR EACH ROW
    EXECUTE FUNCTION set_receipt_number();

CREATE TRIGGER trigger_update_donor_totals
    AFTER INSERT OR UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION update_donor_totals();

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_donations_updated_at
    BEFORE UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Fix receipt_number column to allow auto-generation
ALTER TABLE public.receipts ALTER COLUMN receipt_number DROP NOT NULL;
ALTER TABLE public.receipts ALTER COLUMN receipt_number SET DEFAULT generate_receipt_number();

-- Update any existing NULL receipt numbers
UPDATE public.receipts 
SET receipt_number = generate_receipt_number() 
WHERE receipt_number IS NULL;

-- Make it NOT NULL again
ALTER TABLE public.receipts ALTER COLUMN receipt_number SET NOT NULL;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donors_email ON public.donors(email);
CREATE INDEX IF NOT EXISTS idx_donors_phone ON public.donors(phone);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON public.donations(date_of_donation);
CREATE INDEX IF NOT EXISTS idx_receipts_donation_id ON public.receipts(donation_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);

-- Step 9: Test everything
SELECT 'All database functions and triggers installed successfully!' as result;
SELECT generate_receipt_number() as sample_receipt_number;
