# 🚨 Login Issues - "Database error granting user" Fix Guide

## Problem

You're seeing "Database error granting user" when trying to login, even though the user exists in the `users` table.

## Root Cause

This error typically occurs due to:

1. **Row Level Security (RLS) policies** blocking access
2. **Database permissions** not properly configured
3. **Auth trigger functions** not working correctly
4. **User sync issues** between `auth.users` and `public.users`

## Solution Steps

### Step 1: Fix Database Permissions (CRITICAL)

Go to your Supabase dashboard → SQL Editor and run the `fix-login-issues.sql` script I created:

```sql
-- This script is in database/fix-login-issues.sql
-- It will:
-- 1. Disable problematic RLS policies
-- 2. Grant proper permissions
-- 3. Create simple, working RLS policies
-- 4. Fix user sync triggers
-- 5. Ensure your admin user exists
```

### Step 2: Update Your Admin Email

In the `fix-login-issues.sql` script, find this line and replace with your actual email:

```sql
WHERE email = 'pradip.lamsal.1000@gmail.com' -- Replace with your admin email
```

### Step 3: Check Debug Information

1. Open your app at `http://localhost:3001/login`
2. Click the "🐛 Auth Debug" button in the bottom-right corner
3. Look for any errors in the debug panel

### Step 4: Common Issues and Fixes

#### Issue: "insufficient_privilege" error

**Fix:** Your user doesn't have proper permissions

```sql
-- Run in Supabase SQL Editor:
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.donors TO authenticated;
GRANT ALL ON public.donations TO authenticated;
GRANT ALL ON public.receipts TO authenticated;
```

#### Issue: "relation does not exist" error

**Fix:** Tables not created or accessible

```sql
-- Check table existence:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

#### Issue: RLS blocking access

**Fix:** Temporarily disable RLS for testing

```sql
-- TEMPORARY - for testing only:
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donors DISABLE ROW LEVEL SECURITY;
```

#### Issue: User not in public.users table

**Fix:** Sync auth.users with public.users

```sql
-- Insert your user manually:
INSERT INTO public.users (id, name, role, permissions, email_verified)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', email),
    'admin',
    ARRAY['dashboard:read', 'admin:access'],
    true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    permissions = ARRAY['dashboard:read', 'admin:access'];
```

### Step 5: Test the Fix

1. **Run the SQL script** in Supabase dashboard
2. **Clear browser cache** and reload
3. **Try logging in** again
4. **Check the debug panel** for any remaining issues

### Step 6: If Still Not Working

1. **Check Supabase logs:**

   - Go to Supabase dashboard → Logs
   - Filter by "Database" and look for errors

2. **Verify environment variables:**

   ```bash
   # In your .env.local file:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Test with a new user:**

   - Try creating a completely new account
   - See if the same error occurs

4. **Check network tab:**
   - Open browser dev tools → Network
   - Look for failed requests during login
   - Check the response body for specific error messages

## Quick Test Commands

```bash
# 1. Restart your dev server
npm run dev

# 2. Clear Next.js cache
rm -rf .next

# 3. Check if Supabase is accessible
curl https://djqsebrodwumznqgjhtk.supabase.co/rest/v1/users \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

## Expected Result

After running the fix script, you should be able to:

1. ✅ Login successfully without errors
2. ✅ Access the dashboard
3. ✅ See your user data in the debug panel
4. ✅ No "Database error granting user" messages

## Prevention

To prevent this in the future:

1. Always test RLS policies before deploying
2. Use the `handle_new_user` trigger for auto-user creation
3. Keep backup SQL scripts for quick fixes
4. Monitor Supabase logs regularly

---

**Need help?** The debug panel will show you exactly what's failing. Look for:

- `session.exists: false` → Auth not working
- `usersTable.accessible: false` → Permission issue
- `usersTable.error: "..."` → Specific database error
