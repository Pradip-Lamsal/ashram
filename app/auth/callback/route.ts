import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Email verification disabled - redirect directly to dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    } else {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/login?error=auth-error`);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
