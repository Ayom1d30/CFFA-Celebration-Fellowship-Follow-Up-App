"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MessageBubble } from "@/components/member/message-bubble";
import { QuickMessages } from "@/components/member/quick-messages";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { CURRENT_USER, MOCK_BUDDY, MOCK_MESSAGES } from "@/lib/mock-data";
import { XP_TABLE } from "@/lib/constants";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const buddy = params.id === MOCK_BUDDY.id ? MOCK_BUDDY : MOCK_BUDDY;

  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [draft, setDraft] = useState("");
  const [xpEarned, setXpEarned] = useState(false);

  const sorted = useMemo(
    () => [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [messages]
  );

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        senderId: CURRENT_USER.id,
        receiverId: buddy.id,
        message: trimmed,
        isQuick: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
    if (!xpEarned) setXpEarned(true);
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
        <Avatar name={buddy.name} avatar={buddy.avatar} size="sm" online />
        <div>
          <h1 className="font-bold text-foreground">{buddy.name}</h1>
          <p className="text-xs text-muted">Your buddy this week</p>
        </div>
        {xpEarned ? (
          <span className="ml-auto text-xs font-semibold text-success">
            +{XP_TABLE.message} XP
          </span>
        ) : null}
      </header>

      <div className="flex h-[55vh] flex-col overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {sorted.map((m) => (
            <MessageBubble
              key={m.id}
              message={m.message}
              mine={m.senderId === CURRENT_USER.id}
            />
          ))}
        </div>

        <div className="border-t border-border bg-surface p-3">
          <QuickMessages onSend={send} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2 border-t border-border bg-surface p-3"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${buddy.name.split(" ")[0]}…`}
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
