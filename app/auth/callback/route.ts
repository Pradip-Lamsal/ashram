import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user after session exchange
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check user status from database
        const { data: userProfile } = await supabase
          .from("users")
          .select("status")
          .eq("id", user.id)
          .single();

        if (userProfile) {
          // Redirect based on user status
          if (
            userProfile.status === "pending" ||
            userProfile.status === "rejected"
          ) {
            return NextResponse.redirect(`${origin}/approval-pending`);
          } else if (userProfile.status === "approved") {
            return NextResponse.redirect(`${origin}/dashboard`);
          }
        }

        // Fallback: if no status found, assume pending (new user)
        return NextResponse.redirect(`${origin}/approval-pending`);
      }

      // No user found, redirect to login
      return NextResponse.redirect(`${origin}/login`);
    } else {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/login?error=auth-error`);
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
