-- Complete Fix for Clerk User Integration
-- Run this ENTIRE script at once in Supabase SQL Editor

-- Step 1: Drop all tables to start fresh (this will clear all data)
DROP TABLE IF EXISTS public.puja_history CASCADE;
DROP TABLE IF EXISTS public.sms_events CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.donors CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Step 2: Recreate users table with TEXT id (for Clerk)
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    permissions TEXT[] DEFAULT ARRAY['dashboard:read'],
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Recreate other tables with TEXT foreign keys
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
    created_by TEXT REFERENCES public.users(id),
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
    created_by TEXT REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Insert your admin user (this will now work!)
INSERT INTO public.users (id, name, role, permissions, email_verified, join_date, created_at, updated_at)
VALUES (
    'user_32ELu9NzlRuBLlDBFjiFJE4clgv',
    'Pradip Lamsal',
    'admin',
    ARRAY['dashboard:read', 'admin:access'],
    true,
    NOW(),
    NOW(),
    NOW()
);

-- Step 5: Verify everything worked
SELECT 'Clerk integration fixed successfully!' as result;
SELECT id, name, role FROM public.users;

-- Step 6: Show table structure to confirm TEXT id
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
