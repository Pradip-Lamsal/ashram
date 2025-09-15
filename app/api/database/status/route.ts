import client from "@/app/api/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check if users table exists
    const { error } = await client.from("users").select("count(*)").limit(1);

    if (error) {
      return NextResponse.json({
        status: "error",
        message: "Database setup incomplete",
        details: error.message,
        setup_required: true,
      });
    }

    return NextResponse.json({
      status: "success",
      message: "Database is set up correctly",
      setup_required: false,
    });
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Failed to check database status",
      details: error instanceof Error ? error.message : "Unknown error",
      setup_required: true,
    });
  }
}
