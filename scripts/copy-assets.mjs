import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Assets Copy Script Starting...");

// Copy fonts
const sourceFonts = path.join(__dirname, "..", "public", "fonts", "static");
const sourceLogos = path.join(__dirname, "..", "public");
const targetDirs = [
  path.join(__dirname, "..", ".next", "static"),
  path.join(__dirname, "..", "out"),
  path.join(__dirname, "..", "build"),
];

console.log(`📂 Source fonts directory: ${sourceFonts}`);
console.log(`📂 Source logos directory: ${sourceLogos}`);

// Copy fonts
if (fs.existsSync(sourceFonts)) {
  console.log("✅ Source fonts directory found");

  const fontFiles = fs
    .readdirSync(sourceFonts)
    .filter(
      (file) =>
        file.endsWith(".ttf") ||
        file.endsWith(".woff") ||
        file.endsWith(".woff2")
    );

  console.log(
    `🎨 Found ${fontFiles.length} font files: ${fontFiles.join(", ")}`
  );

  targetDirs.forEach((targetDir) => {
    const fontTargetDir = path.join(targetDir, "fonts");
    if (!fs.existsSync(fontTargetDir)) {
      console.log(`📁 Creating font target directory: ${fontTargetDir}`);
      fs.mkdirSync(fontTargetDir, { recursive: true });
    }

    fontFiles.forEach((file) => {
      const src = path.join(sourceFonts, file);
      const dest = path.join(fontTargetDir, file);

      try {
        fs.copyFileSync(src, dest);
        const stats = fs.statSync(dest);
        console.log(
          `✅ Copied font: ${file} to ${fontTargetDir} (${stats.size} bytes)`
        );
      } catch (error) {
        console.error(`❌ Failed to copy font ${file}:`, error.message);
      }
    });
  });
}

// Copy logos
const logoFiles = ["logo11.jpeg", "logo22.jpeg"];
logoFiles.forEach((logoFile) => {
  const logoPath = path.join(sourceLogos, logoFile);

  if (fs.existsSync(logoPath)) {
    targetDirs.forEach((targetDir) => {
      const logoDest = path.join(targetDir, logoFile);

      try {
        fs.copyFileSync(logoPath, logoDest);
        const stats = fs.statSync(logoDest);
        console.log(
          `✅ Copied logo: ${logoFile} to ${targetDir} (${stats.size} bytes)`
        );
      } catch (error) {
        console.error(`❌ Failed to copy logo ${logoFile}:`, error.message);
      }
    });
  } else {
    console.warn(`⚠️ Logo file not found: ${logoPath}`);
  }
});

console.log("\n🎉 Assets copying completed!");

// Verify
console.log("\n🔍 Verification:");
targetDirs.forEach((targetDir) => {
  if (fs.existsSync(targetDir)) {
    const fontDir = path.join(targetDir, "fonts");
    if (fs.existsSync(fontDir)) {
      const fontCount = fs.readdirSync(fontDir).length;
      console.log(`📁 ${fontDir}: ${fontCount} font files`);
    }

    const logoCount = logoFiles.filter((logo) =>
      fs.existsSync(path.join(targetDir, logo))
    ).length;
    console.log(`📁 ${targetDir}: ${logoCount} logo files`);
  }
});

console.log("\n✨ Asset deployment preparation complete!");
