# Testing the Magic Link Email Verification Flow

## Prerequisites

✅ Supabase configured with:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`
- Server running on port 3000

## Magic Link Purpose

The magic link is **only for email verification after registration**, not for passwordless login. This keeps the authentication flow simple and focused:

- ✅ **Registration**: User registers → Gets verification email with magic link
- ✅ **Login**: User uses email/password (no magic link option)
- ✅ **Verification**: Magic link verifies email and updates database

## Test Steps

### 1. Start Fresh

1. Open your browser
2. Go to: `http://localhost:3000/register`
3. Use a real email address you can access

### 2. Register New User

1. Fill in the registration form:
   - Full Name: Test User
   - Email: your-real-email@example.com
   - Password: (strong password)
   - Confirm Password: (same password)
   - Check "I agree to terms"
2. Click "Create Account"
3. You should see: "Please check your email to confirm your account"

### 3. Check Your Email

1. Open your email inbox
2. Look for email from your Supabase project
3. Subject should be something like "Confirm your signup"
4. Email content should show:
   ```
   Magic Link
   Follow this link to login:
   [Log In] <-- This is the magic link
   ```

### 4. Click the Magic Link

1. Click the "Log In" link in the email
2. **Expected flow:**
   - Browser opens to: `http://localhost:3000/auth/callback?code=...`
   - Automatically redirects to: `http://localhost:3000/auth/verify-success`
   - Shows success page with green checkmark
   - Message: "Email Verified Successfully!"
   - Button: "Continue to Login"

### 5. Test Login

1. Click "Continue to Login" button
2. Should go to: `http://localhost:3000/login`
3. Enter your email and password
4. Click "Sign In"
5. Should redirect to: `http://localhost:3000/dashboard`

## What Happens Behind the Scenes

### Magic Link URL Structure

```
http://localhost:3000/auth/callback?code=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...&type=signup
```

### Callback Processing

1. `/auth/callback` route receives the code
2. Exchanges code for Supabase session
3. Checks `user.email_confirmed_at`
4. Updates `users` table: `email_verified = true`
5. Redirects to `/auth/verify-success`

### Database Updates

The verification process automatically:

- Sets `email_verified = true` in your users table
- Syncs with Supabase auth verification status
- Creates user profile if it doesn't exist

## Troubleshooting

### ❌ Link doesn't work

- Check Supabase redirect URLs include `/auth/callback`
- Verify Site URL is `http://localhost:3000`
- Make sure server is running on port 3000

### ❌ Shows error page

- Check browser console for errors
- Verify callback route exists at `/app/auth/callback/route.ts`
- Check Supabase environment variables

### ❌ Email not received

- Check spam folder
- Verify email address is correct
- Check Supabase email settings

### ❌ Can't login after verification

- Check if `email_verified` was set to `true` in database
- Try refreshing the login page
- Check browser console for auth errors

## Success Indicators

✅ **Email received** with magic link
✅ **Redirects** to verify-success page
✅ **Shows green checkmark** and success message
✅ **No automatic redirects** from success page
✅ **Can login** with email/password after verification
✅ **Database updated** with `email_verified = true`

The flow is now working exactly as requested - magic link verification with a dedicated success page that doesn't automatically redirect!
