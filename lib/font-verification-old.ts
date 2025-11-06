import fs from "fs";
import path from "path";

export function verifyFontDeployment(): {
  status: string;
  paths: Array<{ path: string; exists: boolean; size?: number }>;
  bestPath?: string;
  message: string;
} {
  console.log("🔍 Font Deployment Verification");
  console.log("================================");

  const workDir = process.cwd();
  console.log(`📂 Current working directory: ${workDir}`);

  // Check various possible font locations
  const fontPaths = [
    path.resolve(workDir, "public", "fonts"),
    path.resolve(workDir, "fonts"),
    path.resolve("/tmp", "fonts"),
    path.resolve(".", "public", "fonts"),
  ];

  const fontFiles = [
    "NotoSansDevanagari-VariableFont_wdth,wght.ttf",
    "NotoSansDevanagari-Regular.ttf",
    "NotoSansDevanagari-Regular.woff",
    "NotoSansDevanagari-Regular.woff2",
  ];

  let foundFont = false;

  for (const fontDir of fontPaths) {
    console.log(`\n📁 Checking directory: ${fontDir}`);

    if (fs.existsSync(fontDir)) {
      console.log("  ✅ Directory exists");

      try {
        const files = fs.readdirSync(fontDir);
        console.log(`  📄 Files found: ${files.join(", ")}`);

        for (const fontFile of fontFiles) {
          const fullPath = path.join(fontDir, fontFile);
          if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            console.log(`  ✅ Found: ${fontFile} (${stats.size} bytes)`);
            foundFont = true;
          } else {
            console.log(`  ❌ Missing: ${fontFile}`);
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log(`  💥 Error reading directory: ${errorMessage}`);
      }
    } else {
      console.log("  ❌ Directory does not exist");
    }
  }

  console.log("\n📊 Summary");
  console.log("===========");

  const foundFonts = fontPaths.filter((p) => p.exists);
  const bestPath = foundFonts.length > 0 ? foundFonts[0].path : undefined;

  if (foundFonts.length > 0) {
    console.log("✅ At least one Devanagari font found!");
  } else {
    console.log("🚫 No Devanagari fonts found!");
    console.log("\n💡 Deployment Checklist:");
    console.log("1. Ensure public/fonts folder is included in build");
    console.log("2. Check if fonts are copied during deployment");
    console.log("3. Verify file permissions in production");
    console.log("4. Consider using environment variables for font paths");
  }

  return {
    status: foundFonts.length > 0 ? "success" : "error",
    paths: fontPaths,
    bestPath,
    message:
      foundFonts.length > 0
        ? `Found ${foundFonts.length} font(s)`
        : "No fonts found in any deployment location",
  };
}

// Environment-specific font loading function
export const getEnvironmentFontPath = () => {
  const env = process.env.NODE_ENV || "development";
  const platform = process.platform;

  console.log(`🌍 Environment: ${env}`);
  console.log(`💻 Platform: ${platform}`);

  if (env === "production") {
    // Common production font paths
    const productionPaths = [
      "/opt/fonts",
      "/usr/share/fonts",
      process.env.FONT_PATH,
      path.resolve(process.cwd(), "public", "fonts"),
    ].filter(Boolean);

    console.log("🎯 Production font search paths:", productionPaths);
    return productionPaths;
  } else {
    // Development paths
    return [path.resolve(process.cwd(), "public", "fonts")];
  }
};
