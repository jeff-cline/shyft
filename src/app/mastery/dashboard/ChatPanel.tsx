"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Shyft } from "@/components/brand/Shyft";
import { sendChat, loadChat } from "./actions";

interface Message {
  id: string;
  body: string;
  authorId: string;
  createdAt: string;
  readAt: string | null;
}

export function ChatPanel({ userId, userRole }: { userId: string; userRole: "customer" | "admin" }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      const msgs = await loadChat(userId);
      if (!cancelled) setMessages(msgs);
    }
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [userId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function handleSend() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    startTransition(async () => {
      await sendChat(userId, body);
      const msgs = await loadChat(userId);
      setMessages(msgs);
    });
  }

  return (
    <div className="border border-ink/10 rounded-md bg-paper flex flex-col h-96">
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="opacity-50 text-sm text-center pt-12">
            <Shyft>No messages yet. Say hi.</Shyft>
          </p>
        ) : (
          messages.map((m) => {
            const isMe = userRole === "customer" ? m.authorId === userId : m.authorId !== userId;
            return (
              <div
                key={m.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg whitespace-pre-wrap ${
                    isMe ? "bg-brand-y text-paper" : "bg-ink/5"
                  }`}
                >
                  <div className="text-xs opacity-60 mb-1">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div>{m.body}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="p-2 border-t border-ink/10 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-ink/20 rounded-md bg-paper outline-none focus:border-ink"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !draft.trim()}
          className="bg-brand-y text-paper font-display px-4 py-2 rounded-md disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
