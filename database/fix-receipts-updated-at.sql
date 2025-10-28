-- Fix receipts table schema - add missing updated_at column and trigger
-- Run this in your Supabase SQL editor

-- 1. Add the missing updated_at column to receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update existing records to have updated_at = created_at
UPDATE receipts SET updated_at = created_at WHERE updated_at IS NULL;

-- 3. Make sure we have the update function (this should already exist but let's be safe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Create the trigger for receipts table (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verify the schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'receipts' AND table_schema = 'public'
ORDER BY ordinal_position;