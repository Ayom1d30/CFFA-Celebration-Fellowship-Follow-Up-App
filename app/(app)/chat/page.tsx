import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MOCK_BUDDY, MOCK_MESSAGES } from "@/lib/mock-data";

export default function ChatListPage() {
  const lastMessage = MOCK_MESSAGES[MOCK_MESSAGES.length - 1];

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        <p className="mt-1 text-muted">Follow up with your buddy.</p>
      </header>

      <Card>
        <Link
          href={`/chat/${MOCK_BUDDY.id}`}
          className="flex items-center gap-3 p-4 transition-colors hover:bg-black/5"
        >
          <Avatar
            name={MOCK_BUDDY.name}
            avatar={MOCK_BUDDY.avatar}
            size="md"
            online={Boolean(MOCK_BUDDY.lastActiveAt)}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-foreground">{MOCK_BUDDY.name}</p>
              <span className="text-xs text-muted">Tue</span>
            </div>
            <p className="truncate text-sm text-muted">
              {lastMessage.senderId === MOCK_BUDDY.id ? "" : "You: "}
              {lastMessage.message}
            </p>
          </div>
        </Link>
      </Card>

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
        <Badge color="primary">Tip</Badge>
        Your conversation list grows as you get new buddies each week.
      </div>
    </div>
  );
}
