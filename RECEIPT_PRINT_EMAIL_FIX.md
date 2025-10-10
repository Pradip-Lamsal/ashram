# Receipt Print & Email Functionality Fix Guide

## Issues Fixed

### 1. Print Function Error (react-to-print)

**Problem**: Console error with print function due to deprecated API usage
**Solution**: Updated from `getContent`/`content` to `contentRef` API

### 2. Email Sending Error

**Problem**: "Missing credentials for PLAIN" error when sending emails
**Solution**: Added missing `GMAIL_USER` environment variable

## Setup Instructions

### Gmail SMTP Configuration

1. **Set Gmail Address**: Update `.env.local` with your actual Gmail address:

   ```bash
   GMAIL_USER=your_actual_gmail@gmail.com
   ```

2. **Gmail App Password**: Already configured (`GMAIL_APP_PASSWORD`)
   - Current value: `tyjh hjdp sysr ayqg`
   - If this doesn't work, you may need to generate a new one

### Testing the Fixes

1. **Test Print Function**:

   - Go to any receipt in the system
   - Click the "Print Receipt" button
   - Should now work without console errors

2. **Test Email Function**:
   - Update the `GMAIL_USER` with your actual email
   - Try sending a receipt email
   - Check both console and email delivery

## Environment Variables Required

```bash
# .env.local
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

## Code Changes Made

### 1. ReceiptModal.tsx Print Configuration

Updated from deprecated API:

```typescript
// OLD (deprecated)
getContent: () => componentRef.current;
content: () => componentRef.current;

// NEW (current API)
contentRef: componentRef;
```

### 2. Email Service

The email service in `/lib/email.ts` requires both:

- `GMAIL_USER`: Your Gmail address
- `GMAIL_APP_PASSWORD`: 16-character app password (already set)

## Next Steps

1. Update `GMAIL_USER` in `.env.local` with your actual Gmail address
2. Restart the development server
3. Test both print and email functionality
4. If email still doesn't work, you may need to generate a new Gmail App Password

## Gmail App Password Setup (if needed)

1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate new app password for "Mail"
4. Use the 16-character password in `GMAIL_APP_PASSWORD`
