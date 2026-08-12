"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageBubble } from "@/components/member/message-bubble";
import { QuickMessages } from "@/components/member/quick-messages";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { sendBuddyMessage } from "@/lib/data/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";

export function ChatView({
  buddyId,
  buddyName,
  buddyAvatar,
  currentUserId,
  initialMessages,
  demo,
}: {
  buddyId: string;
  buddyName: string;
  buddyAvatar?: string | null;
  currentUserId: string;
  initialMessages: Message[];
  demo: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [xpEarned, setXpEarned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const configured = isSupabaseConfigured();

  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages]
  );

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [sorted.length]);

  useEffect(() => {
    if (demo || !configured) return;
    const client = createClient();
    const channel = client
      .channel(`chat:${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (String(row.sender_id) === buddyId) {
            setMessages((prev) => [
              ...prev,
              {
                id: String(row.id),
                senderId: String(row.sender_id),
                receiverId: String(row.receiver_id),
                message: String(row.message),
                isQuick: Boolean(row.is_quick),
                createdAt: String(row.created_at),
              },
            ]);
          }
        }
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [buddyId, currentUserId, demo, configured]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setDraft("");
    setError(null);

    if (demo) {
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          senderId: currentUserId,
          receiverId: buddyId,
          message: trimmed,
          isQuick: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      setXpEarned(true);
      return;
    }

    const { error: sendError } = await sendBuddyMessage(buddyId, trimmed);
    if (sendError) {
      setError(sendError);
      setDraft(trimmed);
      return;
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `optimistic-${Date.now()}`,
        senderId: currentUserId,
        receiverId: buddyId,
        message: trimmed,
        isQuick: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setXpEarned(true);
  }

  async function sendQuick(text: string) {
    await send(text);
  }

  return (
    <div className="flex flex-col">
      <header className="mb-4 flex items-center gap-3">
        <Link
          href="/chat"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:bg-black/5"
          aria-label="Back to chats"
        >
          <Icon name="back" className="h-5 w-5" />
        </Link>
        <Avatar name={buddyName} avatar={buddyAvatar} size="sm" />
        <div>
          <h1 className="font-bold text-foreground">{buddyName}</h1>
          <p className="text-xs text-muted">Your buddy this week</p>
        </div>
        {xpEarned ? (
          <span className="ml-auto text-xs font-semibold text-success">
            +5 XP
          </span>
        ) : null}
      </header>

      <div className="flex h-[55vh] flex-col overflow-hidden rounded-2xl border border-border bg-background">
        <div
          ref={scroller}
          className="flex-1 space-y-3 overflow-y-auto p-4"
        >
          {sorted.length === 0 ? (
            <p className="pt-8 text-center text-sm text-muted">
              Say hi to {buddyName.split(" ")[0]} 👋
            </p>
          ) : (
            sorted.map((m) => (
              <MessageBubble
                key={m.id}
                message={m.message}
                mine={m.senderId === currentUserId}
              />
            ))
          )}
        </div>

        {error ? (
          <p className="border-t border-border bg-danger/5 px-4 py-2 text-xs font-medium text-danger">
            {error}
          </p>
        ) : null}

        <div className="border-t border-border bg-surface p-3">
          <QuickMessages onSend={sendQuick} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
          className="flex items-center gap-2 border-t border-border bg-surface p-3"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${buddyName.split(" ")[0]}…`}
            className="flex-1"
          />
          <Button
            type="submit"
            size="md"
            className="h-11 w-11 rounded-full p-0"
            aria-label="Send"
          >
            <Icon name="send" className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
