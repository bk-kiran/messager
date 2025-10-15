import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChatClient from "./ui/ChatClient";

export default async function GroupChatPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // verify membership
  const { data: membership } = await supabase
    .from("group_members").select("group_id")
    .eq("group_id", params.id).eq("user_id", user.id).maybeSingle();
  if (!membership) notFound();

  // initial messages (latest 50)
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, sender_id, created_at")
    .eq("group_id", params.id)
    .order("created_at", { ascending: true })
    .limit(50);

  // basic profile lookup for labels (could optimize later)
  const senderIds = Array.from(new Set((messages ?? []).map(m => m.sender_id).filter(Boolean)));
  const { data: profiles } = senderIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", senderIds as string[])
    : { data: [] as any[] };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Group {params.id.slice(0,8)}</h1>
      <ChatClient
        groupId={params.id}
        initialMessages={messages ?? []}
        profiles={profiles ?? []}
      />
    </main>
  );
}
