// Production font serving middleware
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const fontPaths = [
      path.resolve(
        process.cwd(),
        "public",
        "fonts",
        "NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
      path.resolve(
        process.cwd(),
        ".next",
        "static",
        "fonts",
        "NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
      path.resolve(
        process.cwd(),
        "out",
        "fonts",
        "NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
      path.resolve(
        process.cwd(),
        "build",
        "fonts",
        "NotoSansDevanagari-VariableFont_wdth,wght.ttf"
      ),
    ];

    let fontBuffer: Buffer | null = null;

    for (const fontPath of fontPaths) {
      if (fs.existsSync(fontPath)) {
        fontBuffer = fs.readFileSync(fontPath);
        console.log(`✅ Serving font from: ${fontPath}`);
        break;
      }
    }

    if (!fontBuffer) {
      console.error("❌ Font file not found in any location");
      return new NextResponse("Font not found", { status: 404 });
    }

    return new NextResponse(new Uint8Array(fontBuffer), {
      headers: {
        "Content-Type": "font/ttf",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Font serving error:", error);
    return new NextResponse("Font serving error", { status: 500 });
  }
}
