# Supabase Email Verification Debug Guide

## Issue: Magic Link Emails Not Being Sent

You mentioned that magic link emails were working earlier but now they're not being sent. Here are the most common causes and solutions:

## 1. Check Supabase Email Confirmation Setting

**Go to your Supabase Dashboard:**

1. Navigate to: https://supabase.com/dashboard/project/djqsebrodwumznqgjhtk
2. Go to **Authentication** → **Settings**
3. Look for **"Enable email confirmations"** setting
4. **It might have been accidentally disabled!**

### Expected Settings:

- ✅ **Enable email confirmations:** Should be **ON**
- ✅ **Enable email change confirmations:** Should be **ON**
- ✅ **Secure email change:** Should be **ON**

## 2. Check Site URL Configuration

**In the same Authentication Settings:**

- **Site URL:** Should be `http://localhost:3000`
- **Redirect URLs:** Should include `http://localhost:3000/auth/callback`

## 3. Check Email Templates

**Go to Authentication → Email Templates:**

- Click on **"Confirm signup"** template
- Make sure it's enabled and has proper content

## 4. Recent Changes That Could Cause This

### Possible Causes:

1. **Supabase Dashboard Settings Changed:** Someone might have accidentally turned off email confirmations
2. **Email Provider Issues:** Supabase's default email service might have temporary issues
3. **Rate Limiting:** If you tested too many times, you might have hit rate limits
4. **Browser/Cache Issues:** Try in incognito mode

## 5. Quick Test Steps

### Test the Current Setup:

1. **Register a new account:**

   ```
   http://localhost:3000/register
   ```

2. **Expected Flow:**

   - Fill registration form
   - Click "Create Account"
   - Should see: "Check Your Email! Please check your email and click the verification link..."
   - Should NOT automatically redirect to login
   - Should receive email from Supabase

3. **If no email received:**
   - Check spam folder
   - Wait 2-3 minutes (sometimes delayed)
   - Check Supabase dashboard logs

## 6. Enable Email Confirmation (Most Likely Fix)

**Steps:**

1. Go to Supabase Dashboard
2. Authentication → Settings
3. Find "Enable email confirmations"
4. **Turn it ON** if it's off
5. Click **Save**

## 7. Alternative: Custom SMTP Setup

If Supabase's default email service isn't working, you can use your Gmail:

**In Authentication → Settings → SMTP Settings:**

- **Enable custom SMTP:** ON
- **SMTP Host:** smtp.gmail.com
- **SMTP Port:** 587
- **SMTP User:** pradiplamsal80@gmail.com
- **SMTP Pass:** tyjh hjdp sysr ayqg
- **Sender email:** pradiplamsal80@gmail.com
- **Sender name:** Ashram Management

## 8. Test After Changes

1. Clear browser cache
2. Try registering with a fresh email
3. Check both inbox and spam
4. Look for emails from either:
   - Supabase (if using default)
   - pradiplamsal80@gmail.com (if using custom SMTP)

## Current Code Changes Made

I've updated your registration flow to:

- ✅ Include `emailRedirectTo` parameter
- ✅ Show proper "Check Your Email" message
- ✅ Redirect to login with email verification notice

The code is now ready for email verification - you just need to ensure Supabase email confirmations are enabled!
