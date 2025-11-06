// Simple static font fetcher utility
import fs from "fs";
import path from "path";

export function getFontAsBase64(): string | null {
  try {
    const fontPaths = [
      path.resolve(
        process.cwd(),
        "public/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
      path.resolve(process.cwd(), "public/noto-devanagari.ttf"),
      path.resolve(
        process.cwd(),
        ".next/static/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
      path.resolve(
        process.cwd(),
        "out/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
      path.resolve(
        process.cwd(),
        "build/fonts/NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
    ];

    for (const fontPath of fontPaths) {
      if (fs.existsSync(fontPath)) {
        const fontData = fs.readFileSync(fontPath);
        const base64 = fontData.toString("base64");
        console.log(
          `✅ Font loaded from: ${fontPath} (${fontData.length} bytes)`
        );
        return base64;
      }
    }

    console.log("❌ No font found in any location");
    return null;
  } catch (error) {
    console.error("Error loading font:", error);
    return null;
  }
}
