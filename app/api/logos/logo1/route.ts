import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const logoPath = path.resolve(process.cwd(), "public", "logo11.jpeg");

    if (!fs.existsSync(logoPath)) {
      console.error("❌ Logo 1 not found at:", logoPath);
      return new NextResponse("Logo not found", { status: 404 });
    }

    const logoBuffer = fs.readFileSync(logoPath);
    console.log(`✅ Serving logo 1 from: ${logoPath}`);

    return new NextResponse(new Uint8Array(logoBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("❌ Error serving logo 1:", error);
    return new NextResponse("Logo serving error", { status: 500 });
  }
}
