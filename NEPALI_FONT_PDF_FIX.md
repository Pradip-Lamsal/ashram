# Nepali Font PDF Fix - Complete Solution

## Problem

Nepali (Devanagari) text was not displaying correctly in downloadable PDFs both locally and in production on Vercel.

## Root Causes Identified

### 1. **Variable Font Incompatibility**

- Using `NotoSansDevanagari-VariableFont_wdth,wght.ttf` caused rendering issues
- jsPDF has limited support for Variable fonts
- Solution: Use Regular/Static font variant (`NotoSansDevanagari-Regular.ttf`)

### 2. **Character Spacing Breaking Devanagari**

- `doc.setCharSpace()` was interfering with Devanagari ligatures and combining characters
- Devanagari script requires precise glyph positioning handled by the font itself
- Solution: **NEVER use `setCharSpace()` with Devanagari fonts**

### 3. **Font Not Found in Production**

- Font files not properly copied to build/deployment directories
- Production paths different from development paths
- Solution: Configure Next.js webpack to copy font files + update font loader paths

### 4. **PDF Compression Issues**

- Default PDF compression could interfere with font embedding
- Solution: Set `compress: false` in jsPDF initialization

## Implementation

### Files Modified

#### 1. `/lib/font-loader.ts`

```typescript
// Updated font paths to prioritize production paths and use Regular font
const fontPaths = [
  path.resolve(
    process.cwd(),
    "public/Noto_Sans_Devanagari/static/NotoSansDevanagari-Regular.ttf"
  ),
  path.resolve(
    process.cwd(),
    "out/fonts/static/NotoSansDevanagari-Regular.ttf"
  ),
  path.resolve(
    process.cwd(),
    ".next/static/fonts/NotoSansDevanagari-Regular.ttf"
  ),
  // ... other fallback paths
];
```

#### 2. `/lib/pdf-generator.ts` (Server-side)

```typescript
// Initialize jsPDF with compression disabled
const doc = new jsPDF({
  orientation: "p",
  unit: "pt",
  format: "a4",
  compress: false, // Critical for font embedding
});

// Load Noto Sans Devanagari
const fontBase64 = getFontAsBase64();
if (fontBase64) {
  doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", fontBase64);
  doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari", "normal");
  doc.setFont("NotoSansDevanagari");
  doc.setR2L(false);

  // CRITICAL: Do NOT use doc.setCharSpace() - breaks Devanagari
}
```

#### 3. `/lib/client-pdf-generator.ts` (Client-side)

```typescript
// Fetch font from public directory
const fontResponse = await fetch(
  "/Noto_Sans_Devanagari/static/NotoSansDevanagari-Regular.ttf"
);
const fontBlob = await fontResponse.blob();
// Convert to base64 and add to jsPDF
// Same font loading logic as server-side
```

#### 4. `/next.config.ts`

```typescript
webpack: (config, { dev, isServer }) => {
  // Ensure font files are properly copied to build directory
  if (!dev) {
    config.module.rules.push({
      test: /\.(ttf|otf|woff|woff2|eot)$/,
      type: "asset/resource",
      generator: {
        filename: "static/fonts/[name][ext]",
      },
    });
  }
  // ... rest of config
};
```

## Key Learnings

### ✅ DO's

1. **Use Regular/Static font variants** for jsPDF (not Variable fonts)
2. **Disable PDF compression** when embedding custom fonts
3. **Set R2L to false** for left-to-right scripts like Devanagari
4. **Use proper font file name** in `addFileToVFS()` and `addFont()`
5. **Configure webpack** to copy font files in production builds
6. **Check both server and client paths** for font loading

### ❌ DON'Ts

1. **NEVER use `setCharSpace()`** with Devanagari fonts - it breaks ligatures
2. **Don't rely on Variable fonts** in jsPDF - use static/regular variants
3. **Don't assume fonts in public/ are accessible** in production without webpack config
4. **Don't use default font** as fallback without warning - Nepali won't display

## Testing Checklist

- [x] Local development: `npm run dev` → Download PDF → Check Nepali text
- [x] Production build: `npm run build` → Test PDF generation
- [x] Client-side generation: Test browser-based PDF download
- [x] Server-side generation: Test API route PDF generation
- [x] Vercel deployment: Deploy and test in production environment

## Files Structure

```
public/
  └── Noto_Sans_Devanagari/
      └── static/
          └── NotoSansDevanagari-Regular.ttf  ← Primary font file

out/fonts/static/  ← Production build copy
.next/static/fonts/  ← Next.js static copy
```

## Deployment Notes for Vercel

1. Font files in `public/` directory are automatically served
2. Webpack config ensures fonts are copied to build directory
3. Both API routes (server-side) and client-side can access fonts
4. No additional Vercel configuration needed

## Additional Resources

- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [jsPDF Font Converter](https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html)
- [Noto Sans Devanagari Font](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari)

## Solution Summary

The complete solution involves:

1. Using **Regular font** instead of Variable font
2. **Removing `setCharSpace()`** completely
3. Configuring **webpack** to copy fonts to build
4. Setting **`compress: false`** in jsPDF
5. Updating **font paths** to check production locations first
6. Adding **proper error logging** for debugging

**Status**: ✅ RESOLVED - Nepali text now displays correctly in PDFs both locally and in production
