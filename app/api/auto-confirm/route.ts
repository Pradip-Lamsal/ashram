import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.id)
    return NextResponse.json({ error: "missing id" }, { status: 400 });

  try {
    // Get service role key from environment
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          error: "Service role key not configured",
        },
        { status: 500 }
      );
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Confirm user email via admin API
    const { error } = await supabaseAdmin.auth.admin.updateUserById(body.id, {
      email_confirm: true,
    });

    if (error) {
      console.error("Email confirmation error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: "confirmed",
      message: "User email confirmed successfully",
    });
  } catch (error) {
    console.error("Auto-confirm error:", error);
    return NextResponse.json(
      { error: "Failed to confirm email" },
      { status: 500 }
    );
  }
}
