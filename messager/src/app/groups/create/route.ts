import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  if (!name) return NextResponse.redirect(new URL("/groups", req.url));

  // create group + join as member
  const { data: g, error } = await supabase
    .from("groups")
    .insert({ name, owner: user.id })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("group_members").insert({ group_id: g.id, user_id: user.id, role: "admin" });

  return NextResponse.redirect(new URL(`/groups/${g.id}`, req.url));
}
