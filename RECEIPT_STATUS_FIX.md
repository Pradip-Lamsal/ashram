# Receipt Status Update Fix Guide

## Issues Fixed

1. **Database Schema Error**: `'record "new" has no field "updated_at"'`
2. **Toast Message Typo**: Changed `"True"` to `"default"`
3. **Email Status Not Updating**: Database trigger conflict

## Step-by-Step Fix

### 1. Database Migration (CRITICAL - Do this first)

Run the SQL script in your Supabase SQL editor:

```sql
-- File: database/fix-receipts-updated-at.sql
-- This adds the missing updated_at column and proper trigger

-- 1. Add the missing updated_at column to receipts table
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update existing records to have updated_at = created_at
UPDATE receipts SET updated_at = created_at WHERE updated_at IS NULL;

-- 3. Make sure we have the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Create the trigger for receipts table
DROP TRIGGER IF EXISTS update_receipts_updated_at ON receipts;
CREATE TRIGGER update_receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### 2. Code Changes Applied

✅ **Fixed toast message typo** in `app/(dashboard)/receipts/page.tsx`:

- Changed `showToast("Receipt marked as emailed 📧", "True")`
- To: `showToast("Receipt marked as emailed 📧", "default")`

✅ **Updated receipts service** in `lib/supabase-services.ts`:

- Removed manual `updated_at` setting from `updatePrintStatus` and `updateEmailStatus`
- Let the database trigger handle `updated_at` automatically

### 3. Testing

After applying the database migration:

1. **Test Print Status**:

   - Open a receipt → click "Mark as Printed"
   - Should see: "Receipt marked as printed ✅"
   - Status should update in UI

2. **Test Email Status**:

   - Send an email receipt
   - Should see: "Receipt marked as emailed 📧"
   - Status should update in UI

3. **Verify Database**:
   - Check that `updated_at` field exists in receipts table
   - Verify trigger is working by updating a receipt manually

## Why This Happened

1. **Missing Column**: The receipts table was missing the `updated_at` column that some database trigger or RLS policy expected
2. **Manual vs Trigger Conflict**: The service was trying to manually set `updated_at` while a trigger might also be setting it
3. **Toast Type Error**: Simple typo in the toast notification type

## Verification Commands

```sql
-- Check receipts table schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'receipts' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'receipts';
```

All changes have been applied and TypeScript compilation passes successfully.
