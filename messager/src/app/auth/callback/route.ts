import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const err = searchParams.get("error_description");
  if (err) return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err)}`);
  return NextResponse.redirect(`${origin}${next}`);
}