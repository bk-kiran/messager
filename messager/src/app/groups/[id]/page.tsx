// src/app/groups/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChatClient from "./ui/ChatClient";

export default async function GroupChatPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // verify membership
  const { data: membership } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("group_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) notFound();

  // initial messages
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .eq("group_id", id)
    .order("created_at", { ascending: true })
    .limit(50);

  const senderIds = Array.from(new Set((messages ?? [])
    .map(m => m.sender_id)
    .filter(Boolean))) as string[];

  const { data: profiles } = senderIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", senderIds)
    : { data: [] as any[] };

  // ✅ Pass ONLY serializable data to the client component
  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Group {id.slice(0, 8)}</h1>
      <ChatClient
        groupId={id}
        initialMessages={messages ?? []}
        profiles={profiles ?? []}
      />
    </main>
  );
}
