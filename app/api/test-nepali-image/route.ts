import { getNepaliHeaderImage } from "@/lib/nepali-text-renderer";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("🧪 Testing Nepali image generation...");

  try {
    // Generate the image
    const imageBase64 = await getNepaliHeaderImage();

    if (!imageBase64) {
      return NextResponse.json({
        success: false,
        error: "Failed to generate image",
      });
    }

    console.log("✅ Image generated successfully, length:", imageBase64.length);

    // Return both the success status and the image for testing
    return NextResponse.json({
      success: true,
      imageLength: imageBase64.length,
      imagePreview: imageBase64.substring(0, 100) + "...",
      fullImage: imageBase64,
    });
  } catch (error) {
    console.error("❌ Error generating Nepali image:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
