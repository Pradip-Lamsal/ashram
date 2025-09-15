# How to Configure Supabase Redirect URLs

## Step-by-Step Instructions

### 1. Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (the one you're using for the ashram app)

### 2. Navigate to Authentication Settings

1. In the left sidebar, click on **"Authentication"**
2. Then click on **"URL Configuration"** (or **"Settings"** if you don't see URL Configuration directly)

### 3. Configure Site URL

In the **Site URL** field, enter:

```
http://localhost:3000
```

_(Port 3000 is the default Next.js development port)_

### 4. Configure Redirect URLs

In the **Redirect URLs** section, add these URLs (one per line):

```
http://localhost:3000/auth/callback
http://localhost:3000/auth/verify-success
```

### 5. For Production (when you deploy)

When you deploy your app to production, you'll need to add:

```
https://your-actual-domain.com/auth/callback
https://your-actual-domain.com/auth/verify-success
```

## Visual Guide

The settings page should look like this:

```
┌─ Authentication Settings ─────────────────────┐
│                                               │
│ Site URL                                      │
│ ┌─────────────────────────────────────────┐   │
│ │ http://localhost:3000                   │   │
│ └─────────────────────────────────────────┘   │
│                                               │
│ Redirect URLs                                 │
│ ┌─────────────────────────────────────────┐   │
│ │ http://localhost:3000/auth/callback     │   │
│ │ http://localhost:3000/auth/verify-success│   │
│ └─────────────────────────────────────────┘   │
│                                               │
│ [Save] button                                 │
└───────────────────────────────────────────────┘
```

## Important Notes

1. **Don't forget to click Save** after adding the URLs
2. **Port 3000** is the default Next.js development port
3. You can add multiple URLs separated by new lines
4. Changes take effect immediately after saving

## Port Conflict Solution

If you see "Port 3000 is in use" when starting your dev server:

1. **Option 1: Stop the conflicting process**

   ```bash
   # Find what's using port 3000
   lsof -ti:3000
   # Kill the process (replace XXXX with the process ID)
   kill -9 XXXX
   # Then start your app
   npm run dev
   ```

2. **Option 2: Use a different port temporarily**

   ```bash
   # Start on a specific port
   npm run dev -- -p 3000
   ```

3. **Option 3: Add both ports to Supabase** (recommended)
   Add both URLs to your Supabase redirect URLs:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/auth/verify-success
   http://localhost:3001/auth/callback
   http://localhost:3001/auth/verify-success
   ```

## Alternative Path to Settings

If you can't find "URL Configuration":

1. Go to **Authentication**
2. Click on **"Settings"** tab
3. Look for **"URL Configuration"** section
4. Or look for **"Redirect URLs"** and **"Site URL"** fields

## Testing

After configuring these URLs:

1. Register a new user at `http://localhost:3000/register`
2. Check your email for the verification link
3. Click the verification link
4. You should be redirected to your verify-success page

The magic link should now work properly with your custom verification flow!

## How Magic Links Work with Your Setup

### Supabase Email Template

When Supabase sends verification emails, it uses this template:

```html
<h2>Magic Link</h2>
<p>Follow this link to login:</p>
<p><a href="{{ .ConfirmationURL }}">Log In</a></p>
```

### The Magic Link Flow

1. **User Registration**: User registers at `/register`
2. **Email Sent**: Supabase sends email with `{{ .ConfirmationURL }}`
3. **Link Format**: The link looks like:
   ```
   http://localhost:3000/auth/callback?code=abc123&type=signup
   ```
4. **Callback Processing**: Your `/auth/callback` route:
   - Exchanges the code for a session
   - Checks if email is verified
   - Updates database with verification status
   - Redirects to `/auth/verify-success`
5. **Success Page**: Shows "Email Verified Successfully!" message
6. **Manual Login**: User clicks "Continue to Login" button

### Key Points

- The `{{ .ConfirmationURL }}` automatically includes your callback URL
- Supabase uses your "Site URL" as the base for the confirmation URL
- The redirect URLs you configured allow Supabase to redirect after processing
- Your custom success page prevents automatic redirects (as requested)
