import { createClient } from "@/app/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.id)
    return NextResponse.json({ error: "missing id" }, { status: 400 });

  const supabase = await createClient(); // <-- await here

  const { error } = await supabase
    .from("auth.users")
    .update({ email_confirmed_at: new Date().toISOString() })
    .eq("id", body.id);

  if (error)
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  return NextResponse.json({ status: "confirmed" }, { status: 200 });
}
