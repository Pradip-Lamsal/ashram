// Font verification test script
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🔍 Testing Font Deployment System");
console.log("==================================");

const workDir = path.resolve(__dirname, "..");
console.log(`📂 Working directory: ${workDir}`);

// Check various possible font locations
const fontDirs = [
  path.resolve(workDir, "public", "fonts"),
  path.resolve(workDir, ".next", "static", "fonts"),
  path.resolve(workDir, "out", "fonts"),
  path.resolve(workDir, "build", "fonts"),
];

const fontFiles = [
  "NotoSansDevanagari-VariableFont_wdth,wght.ttf",
  "NotoSansDevanagari-Regular.ttf",
];

let foundFonts = 0;
let totalChecked = 0;

console.log("\n📁 Checking Font Locations:");
console.log("==========================");

for (const fontDir of fontDirs) {
  console.log(`\n📂 ${fontDir}`);

  if (fs.existsSync(fontDir)) {
    console.log("  ✅ Directory exists");

    try {
      const files = fs.readdirSync(fontDir);
      console.log(`  📄 Files: ${files.join(", ")}`);

      for (const fontFile of fontFiles) {
        const fullPath = path.join(fontDir, fontFile);
        totalChecked++;

        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          console.log(`  ✅ Found: ${fontFile} (${stats.size} bytes)`);
          foundFonts++;
        } else {
          console.log(`  ❌ Missing: ${fontFile}`);
        }
      }
    } catch (error) {
      console.log(`  💥 Error: ${error.message}`);
    }
  } else {
    console.log("  ❌ Directory does not exist");
    totalChecked += fontFiles.length;
  }
}

console.log("\n📊 Summary:");
console.log("===========");
console.log(`📈 Fonts found: ${foundFonts}/${totalChecked}`);

if (foundFonts > 0) {
  console.log("🎉 Font deployment is ready for production!");
  console.log("✅ Nepali text should render correctly in PDFs");
} else {
  console.log("⚠️ No fonts found! Run: npm run test-fonts");
  console.log("💡 This will copy fonts to deployment locations");
}
