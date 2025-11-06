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
  const fontDirs = [
    path.resolve(workDir, "public", "fonts"),
    path.resolve(workDir, ".next", "static", "fonts"),
    path.resolve(workDir, "out", "fonts"),
    path.resolve(workDir, "build", "fonts"),
    path.resolve("/tmp", "fonts"),
  ];

  const fontFiles = [
    "NotoSansDevanagari-VariableFont_wdth,wght.ttf",
    "NotoSansDevanagari-Regular.ttf",
    "NotoSansDevanagari-Regular.woff",
    "NotoSansDevanagari-Regular.woff2",
  ];

  const checkedPaths: Array<{ path: string; exists: boolean; size?: number }> = [];
  let bestPath: string | undefined;

  for (const fontDir of fontDirs) {
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
            checkedPaths.push({
              path: fullPath,
              exists: true,
              size: stats.size
            });
            if (!bestPath) {
              bestPath = fullPath;
            }
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

  const foundFonts = checkedPaths.filter(p => p.exists);
  
  console.log("\n📊 Summary");
  console.log("===========");
  
  if (foundFonts.length > 0) {
    console.log(`✅ Found ${foundFonts.length} Devanagari font(s)!`);
    console.log(`🎯 Best path: ${bestPath}`);
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
    paths: checkedPaths,
    bestPath,
    message: foundFonts.length > 0 
      ? `Found ${foundFonts.length} font(s)` 
      : "No fonts found in any deployment location"
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
      path.resolve(process.cwd(), ".next", "static", "fonts"),
      path.resolve(process.cwd(), "out", "fonts"),
      path.resolve(process.cwd(), "build", "fonts"),
    ].filter(Boolean);

    console.log("🎯 Production font search paths:", productionPaths);
    return productionPaths;
  } else {
    // Development paths
    return [path.resolve(process.cwd(), "public", "fonts")];
  }
};