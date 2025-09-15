-- Safe Ashram Management System Database Setup
-- This script checks for existing objects before creating them

-- Enable UUID extension (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types only if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'billing_staff', 'event_coordinator', 'devotee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE donation_type AS ENUM ('General Donation', 'Seva Donation', 'Annadanam', 'Vastra Danam', 'Building Fund', 'Festival Sponsorship', 'Puja Sponsorship');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_type AS ENUM ('Regular', 'Life', 'Special');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_mode AS ENUM ('Online', 'Offline', 'QR Payment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    role user_role DEFAULT 'devotee',
    permissions TEXT[] DEFAULT ARRAY['dashboard:read'],
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donors table
CREATE TABLE IF NOT EXISTS public.donors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth DATE,
    phone TEXT,
    address TEXT,
    email TEXT,
    donation_type donation_type NOT NULL,
    membership membership_type DEFAULT 'Regular',
    notes TEXT,
    total_donations NUMERIC(10,2) DEFAULT 0,
    last_donation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Donations table
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE,
    donation_type donation_type NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_mode payment_mode NOT NULL,
    date_of_donation DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
    receipt_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_printed BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- SMS Events table
CREATE TABLE IF NOT EXISTS public.sms_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_name TEXT NOT NULL,
    message_content TEXT NOT NULL,
    recipient_donor_ids UUID[] NOT NULL,
    sent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    total_recipients INTEGER GENERATED ALWAYS AS (array_length(recipient_donor_ids, 1)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Puja History table
CREATE TABLE IF NOT EXISTS public.puja_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE,
    puja_name TEXT NOT NULL,
    date DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    priest TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_donors_email ON public.donors(email);
CREATE INDEX IF NOT EXISTS idx_donors_phone ON public.donors(phone);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON public.donations(date_of_donation);
CREATE INDEX IF NOT EXISTS idx_receipts_donation_id ON public.receipts(donation_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);

-- Create or replace function to generate receipt numbers
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

-- Create or replace trigger function to set receipt number
CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Always generate a receipt number, even if one is provided
    NEW.receipt_number := generate_receipt_number();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure it's current
DROP TRIGGER IF EXISTS trigger_set_receipt_number ON public.receipts;
CREATE TRIGGER trigger_set_receipt_number
    BEFORE INSERT ON public.receipts
    FOR EACH ROW
    EXECUTE FUNCTION set_receipt_number();

-- Create or replace function to update total donations
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

-- Drop and recreate trigger for donor totals
DROP TRIGGER IF EXISTS trigger_update_donor_totals ON public.donations;
CREATE TRIGGER trigger_update_donor_totals
    AFTER INSERT OR UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION update_donor_totals();

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate all updated_at triggers
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_donors_updated_at ON public.donors;
CREATE TRIGGER trigger_donors_updated_at
    BEFORE UPDATE ON public.donors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_donations_updated_at ON public.donations;
CREATE TRIGGER trigger_donations_updated_at
    BEFORE UPDATE ON public.donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database setup completed successfully!' as status;
