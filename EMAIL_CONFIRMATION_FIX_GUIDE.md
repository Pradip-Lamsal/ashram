# Email Confirmation Fix Guide

## Problem Description

When users are approved in the database (`public.users.status = 'approved'`) but their email is not confirmed in Supabase Auth (`auth.users.email_confirmed_at = null`), they cannot log in and receive a "Email not confirmed" error.

## Root Cause

This happens because:

1. User registration creates a record in `auth.users` but email is not automatically confirmed
2. Admin approves user in `public.users` table
3. There's a mismatch between database approval status and auth email confirmation status

## Quick Fix (For Individual Users)

### Option 1: JavaScript Script

Run the provided `fix-email-confirmation.js` script:

```bash
node fix-email-confirmation.js
```

### Option 2: Manual Admin API Call

```javascript
const { data, error } = await supabase.auth.admin.updateUserById(
  "user-id-here",
  { email_confirm: true }
);
```

### Option 3: Supabase Dashboard

1. Go to Authentication > Users in Supabase Dashboard
2. Find the user
3. Click "Send email confirmation" or manually update the user

## Long-term Solution

### 1. Updated Approval Workflow

When approving users, ensure both database and auth are updated:

```javascript
// Approve user in database
await supabase
  .from("users")
  .update({
    status: "approved",
    email_verified: true,
  })
  .eq("id", userId);

// Confirm email in auth system
await supabase.auth.admin.updateUserById(userId, {
  email_confirm: true,
});
```

### 2. Database View for Monitoring

The SQL script creates a `user_auth_status` view to monitor mismatches:

```sql
SELECT * FROM public.user_auth_status
WHERE login_status = 'NEEDS_EMAIL_CONFIRMATION';
```

### 3. Prevention Trigger

A database trigger automatically sets `email_verified = true` when status changes to 'approved', though email confirmation in auth still needs manual handling.

## Common Error Messages

### "Email not confirmed" (400 error)

- **Cause**: `auth.users.email_confirmed_at` is null
- **Fix**: Use admin API to confirm email

### "Access Pending"

- **Cause**: `public.users.status` is not 'approved'
- **Fix**: Update user status in database

### "User not found"

- **Cause**: User exists in auth but not in public.users table
- **Fix**: Ensure user creation trigger is working

## Diagnostic Commands

### Check Auth User Status

```javascript
const { data } = await supabase.auth.admin.listUsers();
const user = data.users.find((u) => u.email === "user@example.com");
console.log("Email confirmed:", !!user.email_confirmed_at);
```

### Check Database User Status

```javascript
const { data } = await supabase
  .from("users")
  .select("status, email_verified")
  .eq("email", "user@example.com");
```

### SQL Diagnostic Query

```sql
SELECT
    au.email,
    au.email_confirmed_at IS NOT NULL as auth_confirmed,
    pu.status as db_status,
    pu.email_verified as db_email_verified
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'user@example.com';
```

## Best Practices

1. **Always confirm emails when approving users**
2. **Use the monitoring view to catch mismatches**
3. **Test login flow after any auth system changes**
4. **Keep database and auth systems in sync**
5. **Document any manual interventions**

## Files Related to This Issue

- `fix-email-confirmation.js` - Batch fix script
- `database/fix-email-confirmation.sql` - SQL monitoring and prevention
- `components/context/AuthProvider.tsx` - Auth state management
- `app/login/page.tsx` - Login flow
- `app/auth/callback/route.ts` - Auth callback handling

## Testing the Fix

After running the fix:

1. Try logging in with the affected user
2. Check that they are redirected to dashboard (if approved)
3. Verify no "Email not confirmed" errors
4. Check the `user_auth_status` view for any remaining issues
