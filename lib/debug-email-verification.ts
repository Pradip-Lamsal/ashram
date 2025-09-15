// Debug utility to check email verification status
// You can run this in browser console or use it for debugging

import { createClient } from "@/app/utils/supabase/client";

const supabase = createClient();

export const checkEmailVerificationStatus = async () => {
  try {
    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return;
    }

    if (!session?.user) {
      console.log("No user session found");
      return;
    }

    // Get user details
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User error:", userError);
      return;
    }

    console.log("=== EMAIL VERIFICATION STATUS ===");
    console.log("User ID:", user?.id);
    console.log("Email:", user?.email);
    console.log("Email Confirmed At:", user?.email_confirmed_at);
    console.log("Is Email Verified:", !!user?.email_confirmed_at);
    console.log("User Metadata:", user?.user_metadata);
    console.log("App Metadata:", user?.app_metadata);

    // Check database record
    const { data: dbUser, error: dbError } = await supabase
      .from("users")
      .select("email_verified")
      .eq("id", user?.id)
      .single();

    if (dbError) {
      console.log(
        "Database error (user might not exist in users table):",
        dbError
      );
    } else {
      console.log("Database email_verified field:", dbUser?.email_verified);
    }

    console.log("=================================");

    return {
      supabaseVerified: !!user?.email_confirmed_at,
      databaseVerified: dbUser?.email_verified,
      user: user,
    };
  } catch (error) {
    console.error("Error checking email verification:", error);
  }
};

// You can also run this in browser console:
// window.checkEmailVerification = checkEmailVerificationStatus;
