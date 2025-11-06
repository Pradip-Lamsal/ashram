# 📋 Production Font Deployment Guide

## Fixing Garbled Nepali Text in PDF Production

### 🎯 Problem

Your receipts display properly in local development but show garbled Nepali text in production deployment because fonts aren't properly embedded in the production environment.

### ✅ Solution Overview

We've implemented a comprehensive font deployment system with multiple fallbacks:

1. **Font Verification System** - Checks font availability across deployment locations
2. **Automated Font Copying** - Ensures fonts are copied to all necessary deployment paths
3. **Enhanced Font Embedding** - Multiple font embedding strategies with fallbacks
4. **Production-Specific Configuration** - Special handling for serverless deployments

### 🚀 Step-by-Step Deployment Instructions

#### Step 1: Verify Font Files

```bash
# Check if fonts exist in your public folder
ls -la public/fonts/
# Should show: NotoSansDevanagari-VariableFont_wdth,wght.ttf
```

#### Step 2: Test Font Copying System

```bash
npm run test-fonts
```

This should output:

- ✅ Font files found
- ✅ Copied to .next/static/fonts
- ✅ Copied to out/fonts
- ✅ Copied to build/fonts

#### Step 3: Build Your Application

```bash
npm run build
```

This now automatically copies fonts after build completes.

#### Step 4: Platform-Specific Deployment

##### For Vercel:

1. Add to your `vercel.json`:

```json
{
  "functions": {
    "app/api/download-receipt-pdf/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/fonts/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

2. Ensure your build command includes font copying:

```json
{
  "scripts": {
    "vercel-build": "npm install --legacy-peer-deps && next build && node scripts/copy-fonts.mjs"
  }
}
```

##### For Netlify:

Add to `netlify.toml`:

```toml
[build]
  command = "npm run build && npm run test-fonts"
  publish = ".next"

[[headers]]
  for = "/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

##### For Other Platforms:

Ensure your build process runs: `npm run build` (which now includes font copying)

#### Step 5: Environment Variables (Optional)

You can set custom font paths if needed:

```bash
FONT_PATH=/custom/font/path
CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### 🔧 How the Solution Works

#### 1. Font Verification (`lib/font-verification.ts`)

- Checks multiple possible font locations
- Reports font availability status
- Provides best available font path

#### 2. Automated Font Copying (`scripts/copy-fonts.mjs`)

- Copies fonts to all deployment targets
- Runs automatically after build
- Provides detailed status reporting

#### 3. Enhanced PDF Generator (`lib/pdf-generator.ts`)

- Integrates font verification
- Enhanced font embedding with multiple fallbacks
- Production-specific Puppeteer configuration
- Comprehensive error handling and logging

#### 4. Client-Side Fallback (`lib/client-pdf-generator.ts`)

- Backup PDF generation if server-side fails
- Uses jsPDF with Nepali font support

### 📊 Testing Your Deployment

#### 1. Check Font Availability

After deployment, check your browser's Network tab when downloading a PDF to see if font files are being loaded.

#### 2. Verify PDF Generation

Download a receipt and check:

- Nepali text displays correctly
- No garbled characters
- Font rendering is consistent

#### 3. Debug Information

The PDF generator now provides detailed logging:

- Font verification results
- Font embedding status
- Error messages if fonts fail to load

### 🚨 Troubleshooting

#### If Fonts Still Don't Load:

1. **Check Build Logs**: Look for font copying messages
2. **Verify File Permissions**: Ensure font files are readable
3. **Check Network Tab**: See if font files are being served
4. **Review Console Logs**: Look for font embedding errors

#### Common Issues:

- **File permissions**: Font files must be readable
- **Path issues**: Fonts must be in accessible locations
- **Memory limits**: Serverless functions may have memory constraints
- **Timeout issues**: PDF generation might need more time

#### Platform-Specific Notes:

- **Vercel**: Uses serverless functions, may need memory adjustments
- **Netlify**: May require explicit font file inclusion
- **Heroku**: Fonts should be in slug, may need buildpack adjustments
- **Railway/Render**: Usually works with standard deployment

### 🎉 Expected Results

After following this guide:

1. ✅ Fonts properly embedded in production
2. ✅ Nepali text renders correctly in PDFs
3. ✅ Consistent experience across local and production
4. ✅ Comprehensive error handling and fallbacks
5. ✅ Automated font deployment process

### 📞 Support

If you continue to experience issues:

1. Check the browser console for error messages
2. Review the server logs for font-related errors
3. Test the font verification by calling the API endpoint
4. Ensure your deployment platform supports font file serving

The solution provides multiple layers of fallbacks, so even if one method fails, others should ensure Nepali text renders correctly.
