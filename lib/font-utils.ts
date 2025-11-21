import fs from "fs";
import path from "path";

/**
 * Convert Noto Sans Devanagari font to base64 for embedding in HTML
 * This ensures the font is always available during PDF generation
 */
export function getNotoSansDevanagariBase64(): string {
  try {
    const fontPath = path.resolve(
      process.cwd(),
      "public/Noto_Sans_Devanagari/static/NotoSansDevanagari-Regular.ttf"
    );

    if (!fs.existsSync(fontPath)) {
      console.error(`❌ Font file not found at: ${fontPath}`);
      return "";
    }

    const fontBuffer = fs.readFileSync(fontPath);
    const base64Font = fontBuffer.toString("base64");

    console.log(
      `✅ Font loaded successfully (${fontBuffer.length} bytes, ${base64Font.length} base64 chars)`
    );

    return base64Font;
  } catch (error) {
    console.error("❌ Error loading font:", error);
    return "";
  }
}

/**
 * Get Noto Sans Devanagari Bold font as base64
 */
export function getNotoSansDevanagariBoldBase64(): string {
  try {
    const fontPath = path.resolve(
      process.cwd(),
      "public/Noto_Sans_Devanagari/static/NotoSansDevanagari-Bold.ttf"
    );

    if (!fs.existsSync(fontPath)) {
      console.warn(`⚠️ Bold font file not found at: ${fontPath}, using regular weight`);
      return "";
    }

    const fontBuffer = fs.readFileSync(fontPath);
    const base64Font = fontBuffer.toString("base64");

    console.log(
      `✅ Bold font loaded successfully (${fontBuffer.length} bytes)`
    );

    return base64Font;
  } catch (error) {
    console.error("❌ Error loading bold font:", error);
    return "";
  }
}

/**
 * Get font face CSS with embedded base64 font
 * Returns empty string if font cannot be loaded
 */
export function getFontFaceCSS(): string {
  const base64Font = getNotoSansDevanagariBase64();
  const base64BoldFont = getNotoSansDevanagariBoldBase64();

  if (!base64Font) {
    console.warn("⚠️ Font not available, PDF may not render Nepali text correctly");
    return "";
  }

  let css = `
    @font-face {
      font-family: 'Noto Sans Devanagari';
      font-style: normal;
      font-weight: 400;
      src: url(data:font/truetype;charset=utf-8;base64,${base64Font}) format('truetype');
      font-display: block;
    }
  `;

  // Add bold variant if available
  if (base64BoldFont) {
    css += `
    @font-face {
      font-family: 'Noto Sans Devanagari';
      font-style: normal;
      font-weight: 700;
      src: url(data:font/truetype;charset=utf-8;base64,${base64BoldFont}) format('truetype');
      font-display: block;
    }
  `;
  }

  return css;
}
