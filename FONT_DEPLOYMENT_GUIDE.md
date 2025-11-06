# Font Deployment Fix - Step by Step Guide

## Problem Diagnosis

The issue you're experiencing is that Nepali fonts are not being properly loaded in the production environment, causing garbled text instead of proper Devanagari characters.

## Step-by-Step Solution

### Step 1: Verify Font Files Locally

First, let's make sure your font files are in the correct location:

```bash
# Check if font exists
ls -la public/fonts/
```

You should see: `NotoSansDevanagari-VariableFont_wdth,wght.ttf`

### Step 2: Test Font Loading Locally

Run your application locally and check the console logs when generating a PDF. You should see:

- "🔍 Starting font embedding process..."
- "✅ Successfully loaded font: [font-name]"

### Step 3: Configure Your Deployment Platform

#### For Vercel:

1. Ensure your `public/fonts` folder is included in your repository
2. Add these environment variables in Vercel dashboard:
   ```
   NODE_ENV=production
   FONT_PATH=/var/task/public/fonts
   ```

#### For Netlify:

1. Create a `_headers` file in your `public` folder:
   ```
   /fonts/*
     Cache-Control: public, max-age=31536000
   ```

#### For other platforms:

1. Ensure the `public` folder is copied during build
2. Set appropriate file permissions for font files

### Step 4: Update Your Build Configuration

Add this to your `package.json` scripts section:

```json
{
  "scripts": {
    "postbuild": "node scripts/copy-fonts.js"
  }
}
```

### Step 5: Create Font Copy Script

Create `scripts/copy-fonts.js`:

```javascript
const fs = require("fs");
const path = require("path");

const sourceFonts = path.join(__dirname, "..", "public", "fonts");
const targetFonts = path.join(__dirname, "..", ".next", "static", "fonts");

if (fs.existsSync(sourceFonts)) {
  console.log("📁 Copying fonts to build directory...");

  if (!fs.existsSync(targetFonts)) {
    fs.mkdirSync(targetFonts, { recursive: true });
  }

  const files = fs.readdirSync(sourceFonts);
  files.forEach((file) => {
    const src = path.join(sourceFonts, file);
    const dest = path.join(targetFonts, file);
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied: ${file}`);
  });

  console.log("🎉 Font copying completed!");
} else {
  console.error("❌ Source fonts directory not found!");
}
```

### Step 6: Environment-Specific Font Loading

The updated code now includes:

1. **Enhanced logging** to debug font loading issues
2. **Multiple fallback paths** for different deployment environments
3. **Font verification** function to check deployment status
4. **Better error handling** with detailed console output

### Step 7: Testing Your Deployment

After deploying, check your application logs for these messages:

- "🔍 Starting font embedding process..."
- "📂 Current working directory: [path]"
- "🎯 Looking for fonts: [font list]"
- "✅ Successfully loaded font: [font-name]" OR "❌ Font file not found: [path]"

### Step 8: Alternative Solutions

If font embedding still fails, the system will automatically:

1. Fall back to system Devanagari fonts
2. Use client-side PDF generation as last resort

## Quick Test Command

Add this to your API route for testing:

```typescript
// Add to your PDF API route for debugging
console.log("📊 Font debugging info:");
console.log("- Working directory:", process.cwd());
console.log("- Environment:", process.env.NODE_ENV);
console.log("- Platform:", process.platform);
```

## Expected Result

After implementing these changes, your deployed PDFs should show:

- ॐ (Om symbol)
- श्रीराधासर्वेश्वरो विजयते
- श्री जगद्‌गुरु आश्रम एवं जगत्‌नारायण मन्दिर
- All other Nepali text properly formatted

Instead of the garbled characters you're currently seeing.
