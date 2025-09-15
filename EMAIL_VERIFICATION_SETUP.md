# Email Verification Setup Instructions

## Supabase Configuration Required

To make the email verification flow work properly, you need to configure the redirect URLs in your Supabase project:

### 1. Go to Supabase Dashboard

- Navigate to your project dashboard at https://supabase.com/dashboard
- Go to Authentication > URL Configuration

### 2. Add Site URL

Set the Site URL to your application domain:

```
http://localhost:3001  # For development
https://your-domain.com  # For production
```

### 3. Add Redirect URLs

Add these redirect URLs to allow authentication callbacks:

```
http://localhost:3001/auth/callback  # For development
https://your-domain.com/auth/callback  # For production
```

### 4. Email Template (Optional)

You can customize the email verification template in:
Authentication > Email Templates > Confirm signup

## How the Flow Works

1. User registers with email → Gets verification email
2. User clicks magic link in email → Redirects to `/auth/callback`
3. Callback handler processes the verification → Redirects to `/auth/verify-success`
4. Verification success page shows confirmation → User can click to login
5. Email verification status is automatically synced to the database

## Testing

1. Register a new account at `/register`
2. Check email for verification link
3. Click the verification link
4. Should redirect to the success page
5. Click "Continue to Login" and sign in

## Files Created/Modified

- `/app/auth/verify-success/page.tsx` - Success page after email verification
- `/app/auth/callback/route.ts` - Handles auth callbacks and redirects
- `/app/register/page.tsx` - Updated to use correct redirect URL
- `/app/login/page.tsx` - Added magic link option and error handling
- `/components/context/AuthProvider.tsx` - Optimized for performance

The email verification status will be automatically synced between Supabase auth and your custom users table.
