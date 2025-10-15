"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Msg = { id: string; content: string; sender_id: string | null; created_at: string };
type Profile = { id: string; display_name: string };

export default function ChatClient({
  groupId, initialMessages, profiles
}: { groupId: string; initialMessages: Msg[]; profiles: Profile[] }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [msgs, setMsgs] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const name = (id?: string | null) =>
    profiles.find(p => p.id === id)?.display_name ?? "Someone";

  useEffect(() => {
    console.log("Setting up realtime subscription for group:", groupId);
    
    const ch = supabase.channel(`grp-${groupId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `group_id=eq.${groupId}` },
        (payload) => {
          console.log("New message received:", payload);
          setMsgs(m => [...m, payload.new as Msg]);
        }
      )
      .subscribe();
    
    return () => { 
      console.log("Cleaning up subscription");
      supabase.removeChannel(ch); 
    };
  }, [groupId, supabase]);

  useEffect(() => { 
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); 
  }, [msgs.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    
    setText("");
    console.log("Sending message:", body);
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("messages").insert({ 
      group_id: groupId, 
      sender_id: user?.id ?? null, 
      content: body 
    });
    
    if (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  return (
    <div className="border rounded p-3 flex flex-col h-[70vh]">
      <div className="flex-1 overflow-auto space-y-2 mb-3">
        {msgs.map(m => (
          <div key={m.id} className="text-sm">
            <span className="font-medium">{name(m.sender_id)}</span>
            <span className="text-gray-500"> · {new Date(m.created_at).toLocaleTimeString()}</span>
            <div>{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a message…"
          className="border rounded px-3 py-2 flex-1"
        />
        <button className="px-4 py-2 rounded bg-black text-white">Send</button>
      </form>
    </div>
  );
}