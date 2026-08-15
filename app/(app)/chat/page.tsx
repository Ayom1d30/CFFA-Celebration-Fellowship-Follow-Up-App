import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getChatList } from "@/lib/data/server";
import { formatRelativeTime } from "@/lib/utils";

export default async function ChatListPage() {
  const [conversations] = await Promise.all([getChatList()]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Chat</h1>
        <p className="mt-1 text-muted">Follow up with your buddy.</p>
      </header>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold text-foreground">No conversations yet</p>
          <p className="text-sm text-muted">
            Your buddy&apos;s messages will show up here each week.
          </p>
        </div>
      ) : (
        <Card>
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/chat/${c.id}`}
              className="flex items-center gap-3 p-4 transition-colors hover:bg-black/5"
            >
              <Avatar
                name={c.name}
                avatar={c.avatar}
                size="md"
                online={c.online}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-bold text-foreground">{c.name}</p>
                  <span className="shrink-0 text-xs text-muted">
                    {formatRelativeTime(c.lastMessageAt)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted">
                  {c.lastMessageMine ? "You: " : ""}
                  {c.lastMessage}
                </p>
              </div>
              {c.unread > 0 ? (
                <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-white">
                  {c.unread}
                </span>
              ) : null}
            </Link>
          ))}
        </Card>
      )}

      <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border p-6 text-sm text-muted">
        <Badge color="primary">Tip</Badge>
        New buddies appear here each Tuesday.
      </div>
    </div>
  );
}
