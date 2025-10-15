import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("No user found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  
  if (!name) {
    console.log("No group name provided");
    return NextResponse.redirect(new URL("/groups", req.url));
  }

  console.log("Creating group:", name, "for user:", user.id);

  // create group
  const { data: g, error: groupError } = await supabase
    .from("groups")
    .insert({ name, owner: user.id })
    .select()
    .single();
  
  if (groupError) {
    console.error("Error creating group:", groupError);
    return NextResponse.redirect(new URL("/groups?error=creation_failed", req.url));
  }

  console.log("Group created:", g.id);

  // join as member
  const { error: memberError } = await supabase
    .from("group_members")
    .insert({ 
      group_id: g.id, 
      user_id: user.id, 
      role: "admin" 
    });

  if (memberError) {
    console.error("Error adding member:", memberError);
    // Don't redirect to group if member insert failed
    return NextResponse.redirect(new URL("/groups?error=member_failed", req.url));
  }

  console.log("Member added successfully, redirecting to group:", g.id);

  // Use 303 See Other to force a GET request
  return NextResponse.redirect(new URL(`/groups/${g.id}`, req.url), 303);
}