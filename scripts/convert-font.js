#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Font Converter Script for jsPDF
 *
 * This script converts a TTF font file to jsPDF format
 * Usage: node scripts/convert-font.js
 */

const fs = require("fs");
const path = require("path");

// Input font path
const fontPath = path.join(
  __dirname,
  "../public/Noto_Sans_Devanagari/static/NotoSansDevanagari-Regular.ttf"
);
// Output path
const outputPath = path.join(
  __dirname,
  "../public/fonts/noto-sans-devanagari-normal.js"
);

console.log("🔄 Converting font for jsPDF...");
console.log("Input:", fontPath);
console.log("Output:", outputPath);

try {
  // Read the font file
  const fontData = fs.readFileSync(fontPath);
  const base64Font = fontData.toString("base64");

  // Create jsPDF-compatible font file
  const fontModule = `// Generated font file for jsPDF
// Font: Noto Sans Devanagari Regular
// Generated: ${new Date().toISOString()}

export const NotoSansDevanagariFont = "${base64Font}";

export function loadNotoSansDevanagari(doc) {
  doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", NotoSansDevanagariFont);
  doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari", "normal");
}
`;

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the output file
  fs.writeFileSync(outputPath, fontModule, "utf8");

  console.log("✅ Font converted successfully!");
  console.log(
    `📦 File size: ${(base64Font.length / 1024).toFixed(2)} KB (base64)`
  );
  console.log(`💾 Saved to: ${outputPath}`);
} catch (error) {
  console.error("❌ Error converting font:", error);
  process.exit(1);
}
