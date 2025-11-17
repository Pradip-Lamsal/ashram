import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const fontPath = url.searchParams.get("path");

    if (!fontPath) {
      return NextResponse.json(
        { error: "Font path not provided" },
        { status: 400 }
      );
    }

    // Construct the full path to the font file
    const fullPath = path.join(process.cwd(), "public", fontPath);

    // Read the font file
    const fontBuffer = readFileSync(fullPath);

    // Determine the correct MIME type based on file extension
    let mimeType = "font/ttf";
    if (fontPath.endsWith(".woff2")) {
      mimeType = "font/woff2";
    } else if (fontPath.endsWith(".woff")) {
      mimeType = "font/woff";
    } else if (fontPath.endsWith(".otf")) {
      mimeType = "font/otf";
    }

    // Return the font with proper headers
    return new NextResponse(fontBuffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error serving font:", error);
    return NextResponse.json({ error: "Font not found" }, { status: 404 });
  }
}
