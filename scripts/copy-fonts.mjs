import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Font Copy Script Starting...");

const sourceFonts = path.join(__dirname, "..", "public", "fonts");
const targetDirs = [
  path.join(__dirname, "..", ".next", "static", "fonts"),
  path.join(__dirname, "..", "out", "fonts"), // For static exports
  path.join(__dirname, "..", "build", "fonts"), // For other build systems
];

console.log(`📂 Source fonts directory: ${sourceFonts}`);

if (fs.existsSync(sourceFonts)) {
  console.log("✅ Source fonts directory found");

  const files = fs.readdirSync(sourceFonts);
  console.log(`📄 Found ${files.length} files: ${files.join(", ")}`);

  // Filter for font files
  const fontFiles = files.filter(
    (file) =>
      file.endsWith(".ttf") ||
      file.endsWith(".woff") ||
      file.endsWith(".woff2") ||
      file.endsWith(".otf")
  );

  console.log(
    `🎨 Found ${fontFiles.length} font files: ${fontFiles.join(", ")}`
  );

  if (fontFiles.length === 0) {
    console.warn("⚠️ No font files found in source directory!");
    process.exit(1);
  }

  // Copy to multiple target directories
  targetDirs.forEach((targetDir) => {
    if (!fs.existsSync(targetDir)) {
      console.log(`📁 Creating target directory: ${targetDir}`);
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fontFiles.forEach((file) => {
      const src = path.join(sourceFonts, file);
      const dest = path.join(targetDir, file);

      try {
        fs.copyFileSync(src, dest);
        const stats = fs.statSync(dest);
        console.log(`✅ Copied: ${file} to ${targetDir} (${stats.size} bytes)`);
      } catch (error) {
        console.error(
          `❌ Failed to copy ${file} to ${targetDir}:`,
          error.message
        );
      }
    });
  });

  console.log("🎉 Font copying completed!");
} else {
  console.error(`❌ Source fonts directory not found: ${sourceFonts}`);
  console.log("💡 Make sure your fonts are in the public/fonts directory");
  process.exit(1);
}

// Verify the copied fonts
console.log("\n🔍 Verification:");
targetDirs.forEach((targetDir) => {
  if (fs.existsSync(targetDir)) {
    const copiedFiles = fs.readdirSync(targetDir);
    console.log(`📁 ${targetDir}: ${copiedFiles.length} files`);
  }
});

console.log("\n✨ Font deployment preparation complete!");
