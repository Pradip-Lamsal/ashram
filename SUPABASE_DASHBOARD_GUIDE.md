# Finding Supabase URL Configuration - Visual Guide

## Method 1: Through Authentication Menu

```
Supabase Dashboard
├── Projects (select your ashram project)
└── Left Sidebar
    ├── Table Editor
    ├── SQL Editor
    ├── 🔐 Authentication  ← Click here
    │   ├── Users
    │   ├── Policies
    │   ├── Providers
    │   └── Settings  ← Then click here
    │       └── URL Configuration  ← Look for this section
    ├── Edge Functions
    ├── Storage
    └── Settings
```

## Method 2: Direct Settings Path

```
Supabase Dashboard
├── Projects (select your project)
└── Left Sidebar
    └── ⚙️ Settings  ← Click here directly
        ├── General
        ├── Database
        ├── API
        └── Auth  ← Click this tab
            └── URL Configuration section
```

## What You'll See in URL Configuration

Look for these fields:

### Site URL

```
┌─ Site URL ────────────────────────────────┐
│ The base URL of your site                 │
│ ┌─────────────────────────────────────┐   │
│ │ http://localhost:3001               │   │ ← Enter this
│ └─────────────────────────────────────┘   │
└───────────────────────────────────────────┘
```

### Redirect URLs

```
┌─ Redirect URLs ───────────────────────────┐
│ A list of URLs that auth can redirect to  │
│ ┌─────────────────────────────────────┐   │
│ │ http://localhost:3001/auth/callback │   │ ← Add this line
│ │ http://localhost:3001/auth/verify-  │   │ ← Add this line
│ │ success                             │   │
│ └─────────────────────────────────────┘   │
└───────────────────────────────────────────┘
```

## Exact URLs to Add

Copy and paste these exactly:

**Site URL:**

```
http://localhost:3001
```

**Redirect URLs (add both, one per line):**

```
http://localhost:3001/auth/callback
http://localhost:3001/auth/verify-success
```

## Common Issues

❌ **Wrong:** `http://localhost:3000` (wrong port)
✅ **Correct:** `http://localhost:3001` (your app runs on 3001)

❌ **Wrong:** Missing `/auth/callback` in redirect URLs
✅ **Correct:** Including the full callback path

❌ **Wrong:** Using `https://` for localhost
✅ **Correct:** Using `http://` for local development

## After Saving

1. Click the **Save** button
2. Wait for the success message
3. Test by registering a new user
4. Check your email for the verification link
5. Click the link - should work smoothly now!

## Production Setup (Later)

When you deploy your app, replace `http://localhost:3001` with your actual domain:

```
Site URL: https://yourdomain.com
Redirect URLs:
  https://yourdomain.com/auth/callback
  https://yourdomain.com/auth/verify-success
```
