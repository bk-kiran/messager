// src/app/groups/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChatClient from "./ui/ChatClient";
import Link from "next/link";

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

  // get group details
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, created_at")
    .eq("id", id)
    .single();

  if (!group) notFound();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/groups"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-sm text-gray-500">
                {(messages ?? []).length} messages
              </p>
            </div>
          </div>
          
          {/* Group menu button (optional) */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white border-x border-gray-200 overflow-hidden">
          <ChatClient
            groupId={id}
            groupName={group.name}
            initialMessages={messages ?? []}
            profiles={profiles ?? []}
          />
        </div>

        {/* Footer (optional info) */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-200 px-6 py-2 text-xs text-gray-500 text-center">
          Messages are end-to-end encrypted
        </div>
      </div>
    </div>
  );
}