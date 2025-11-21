// Simple static font fetcher utility
import fs from "fs";
import path from "path";

export function getFontAsBase64(): string | null {
  try {
    // Use Regular font for best jsPDF compatibility (Variable fonts can cause issues)
    const fontPaths = [
      // Production build paths - check first
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

      // Development paths
      path.resolve(
        process.cwd(),
        "public/fonts/static/NotoSansDevanagari-Regular.ttf"
      ),
      path.resolve(process.cwd(), "public/noto-devanagari.ttf"),

      // Fallback paths
      path.resolve(
        process.cwd(),
        "build/fonts/static/NotoSansDevanagari-Regular.ttf"
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
