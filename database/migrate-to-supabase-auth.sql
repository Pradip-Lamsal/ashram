-- Migrate from Clerk to Supabase Auth
-- This script updates the database to use Supabase auth.users instead of custom TEXT IDs

-- Step 1: Drop all existing tables to rebuild with proper auth.users integration
DROP TABLE IF EXISTS public.puja_history CASCADE;
DROP TABLE IF EXISTS public.sms_events CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.donors CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Create users table that extends auth.users
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    permissions TEXT[] DEFAULT ARRAY['dashboard:read'],
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Recreate all other tables with UUID references
CREATE TABLE public.donors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    date_of_birth DATE,
    phone TEXT,
    address TEXT,
    email TEXT,
    donation_type TEXT NOT NULL,
    membership TEXT DEFAULT 'Regular',
    notes TEXT,
    total_donations NUMERIC(10,2) DEFAULT 0,
    last_donation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE,
    donation_type TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_mode TEXT NOT NULL,
    date_of_donation DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.receipts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donation_id UUID REFERENCES public.donations(id) ON DELETE CASCADE,
    receipt_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_printed BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    location TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
-- Users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- Users can update their own profile, admins can update all
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
    ));

-- All authenticated users can read donors, donations, receipts, events
CREATE POLICY "Authenticated users can view donors" ON public.donors
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view donations" ON public.donations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view receipts" ON public.receipts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view events" ON public.events
    FOR SELECT USING (auth.role() = 'authenticated');

-- Authenticated users can insert/update donors, donations, receipts, events
CREATE POLICY "Authenticated users can manage donors" ON public.donors
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage donations" ON public.donations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage receipts" ON public.receipts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage events" ON public.events
    FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, email_verified)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 
                NEW.raw_user_meta_data->>'full_name', 
                split_part(NEW.email, '@', 1)),
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Recreate all functions and triggers
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    receipt_num TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 'ASH([0-9]+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.receipts
    WHERE receipt_number ~ '^ASH[0-9]+$' AND receipt_number IS NOT NULL;
    
    IF next_number IS NULL THEN
        next_number := 1;
    END IF;
    
    receipt_num := 'ASH' || LPAD(next_number::TEXT, 9, '0');
    
    RETURN receipt_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.receipt_number := generate_receipt_number();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_donor_totals()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create all triggers
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

-- Step 9: Create indexes
CREATE INDEX IF NOT EXISTS idx_donors_email ON public.donors(email);
CREATE INDEX IF NOT EXISTS idx_donors_phone ON public.donors(phone);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_date ON public.donations(date_of_donation);
CREATE INDEX IF NOT EXISTS idx_receipts_donation_id ON public.receipts(donation_id);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON public.receipts(receipt_number);

-- Success message
SELECT 'Database migrated to Supabase Auth successfully!' as result;
