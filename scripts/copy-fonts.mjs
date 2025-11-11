import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Font Copy Script Starting...");

const sourceFonts = path.join(__dirname, "..", "public", "fonts");
const sourceStaticFonts = path.join(
  __dirname,
  "..",
  "public",
  "fonts",
  "static"
);
const targetDirs = [
  path.join(__dirname, "..", ".next", "static", "fonts"),
  path.join(__dirname, "..", "out", "fonts"), // For static exports
  path.join(__dirname, "..", "build", "fonts"), // For other build systems
];

console.log(`📂 Source fonts directory: ${sourceFonts}`);

if (fs.existsSync(sourceFonts)) {
  console.log("✅ Source fonts directory found");

  // Get font files from main fonts directory
  const files = fs.readdirSync(sourceFonts);
  console.log(`📄 Found ${files.length} files: ${files.join(", ")}`);

  let fontFiles = files.filter(
    (file) =>
      file.endsWith(".ttf") ||
      file.endsWith(".woff") ||
      file.endsWith(".woff2") ||
      file.endsWith(".otf")
  );

  // Also get font files from static subdirectory
  if (fs.existsSync(sourceStaticFonts)) {
    const staticFiles = fs.readdirSync(sourceStaticFonts);
    const staticFontFiles = staticFiles
      .filter(
        (file) =>
          file.endsWith(".ttf") ||
          file.endsWith(".woff") ||
          file.endsWith(".woff2") ||
          file.endsWith(".otf")
      )
      .map((file) => ({ file, isStatic: true }));

    console.log(
      `📄 Found ${staticFontFiles.length} static font files: ${staticFontFiles
        .map((f) => f.file)
        .join(", ")}`
    );

    // Add static fonts to the list
    fontFiles = [
      ...fontFiles.map((file) => ({ file, isStatic: false })),
      ...staticFontFiles,
    ];
  } else {
    fontFiles = fontFiles.map((file) => ({ file, isStatic: false }));
  }

  console.log(`🎨 Total font files: ${fontFiles.length}`);

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

    fontFiles.forEach(({ file, isStatic }) => {
      const src = isStatic
        ? path.join(sourceStaticFonts, file)
        : path.join(sourceFonts, file);
      const dest = path.join(targetDir, file);

      try {
        fs.copyFileSync(src, dest);
        const stats = fs.statSync(dest);
        console.log(
          `✅ Copied: ${file} ${isStatic ? "(static)" : ""} to ${targetDir} (${
            stats.size
          } bytes)`
        );
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
