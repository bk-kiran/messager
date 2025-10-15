// src/app/groups/[id]/ui/ChatClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Msg = { id: string; content: string; sender_id: string | null; created_at: string };
type Profile = { id: string; display_name: string };

export default function ChatClient({
  groupId,
  groupName,
  initialMessages,
  profiles,
}: {
  groupId: string;
  groupName: string;
  initialMessages: Msg[];
  profiles: Profile[];
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [msgs, setMsgs] = useState<Msg[]>(initialMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const nameFor = (id?: string | null) =>
    profiles.find((p) => p.id === id)?.display_name ?? "Someone";

  useEffect(() => {
    const channel = supabase
      .channel(`group-${groupId}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on("broadcast", { event: "new_message" }, (payload) => {
        setMsgs((prev) => [...prev, payload.payload as Msg]);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
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

    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: newMsg, error } = await supabase
      .from("messages")
      .insert({ 
        group_id: groupId, 
        sender_id: user?.id ?? null, 
        content: body 
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending message:", error);
      setText(body);
      return;
    }

    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast",
        event: "new_message",
        payload: newMsg,
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Be the first to say hello in {groupName}!</p>
          </div>
        ) : (
          <>
            {msgs.map((m, idx) => {
              const isFirstFromSender = idx === 0 || msgs[idx - 1].sender_id !== m.sender_id;
              
              return (
                <div key={m.id} className="flex gap-3">
                  {isFirstFromSender ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {nameFor(m.sender_id)[0]?.toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-8 flex-shrink-0" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {isFirstFromSender && (
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {nameFor(m.sender_id)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(m.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    )}
                    <div className="text-gray-800 text-sm break-words">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={send} className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message ${groupName}...`}
            className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
          <button 
            type="submit"
            disabled={!text.trim()}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}