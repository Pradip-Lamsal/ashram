import { createClient } from "@/app/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // If magic-link is disabled (usual case), just redirect to login
  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();

  // Exchange code for a session (protective handling if link is still used)
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    console.error("Error exchanging code for session:", exchangeError);
    return NextResponse.redirect(`${origin}/login?error=auth-error`);
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // Check approval status in public.users
  const { data: userProfile, error: profileError } = await supabase
    .from("users")
    .select("status")
    .eq("id", user.id)
    .single();

  if (profileError || !userProfile || userProfile.status !== "approved") {
    // Revoke session for safety and send to approval pending
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error signing out non-approved user:", e);
    }
    return NextResponse.redirect(`${origin}/approval-pending`);
  }

  // Approved
  return NextResponse.redirect(`${origin}/dashboard`);
}
