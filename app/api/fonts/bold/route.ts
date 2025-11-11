import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const fontPath = path.resolve(
      process.cwd(),
      "public",
      "fonts",
      "static",
      "NotoSansDevanagari-Bold.ttf"
    );

    if (!fs.existsSync(fontPath)) {
      console.error("❌ Bold font file not found at:", fontPath);
      return new NextResponse("Font not found", { status: 404 });
    }

    const fontBuffer = fs.readFileSync(fontPath);
    console.log(`✅ Serving bold font from: ${fontPath}`);

    return new NextResponse(new Uint8Array(fontBuffer), {
      headers: {
        "Content-Type": "font/ttf",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Error serving bold font:", error);
    return new NextResponse("Font serving error", { status: 500 });
  }
}
