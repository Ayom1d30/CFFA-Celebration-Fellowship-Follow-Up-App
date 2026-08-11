import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { daysSince } from "@/lib/mock-data";
import type { User } from "@/lib/types";

export function BuddyCard({
  buddy,
  pairStatus,
}: {
  buddy: User;
  pairStatus: "pending" | "contacted" | "completed";
}) {
  const statusLabel =
    pairStatus === "completed"
      ? "Checked in ✅"
      : pairStatus === "contacted"
        ? "Contacted"
        : "Not checked in yet";

  const statusColor =
    pairStatus === "completed"
      ? "success"
      : pairStatus === "contacted"
        ? "primary"
        : "warning";

  return (
    <Card className="p-5">
      <p className="text-xs font-bold tracking-wider text-muted">YOUR BUDDY</p>
      <div className="mt-3 flex items-center gap-4">
        <Avatar
          name={buddy.name}
          avatar={buddy.avatar}
          size="lg"
          online={Boolean(buddy.lastActiveAt)}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-foreground">{buddy.name}</h2>
          <p className="text-sm text-muted">{daysSince(buddy.lastActiveAt)}</p>
          <div className="mt-1.5">
            <Badge color={statusColor}>{statusLabel}</Badge>
          </div>
        </div>
      </div>
      <ButtonLink href={`/chat/${buddy.id}`} className="mt-4 w-full">
        Message {buddy.name.split(" ")[0]}
      </ButtonLink>
    </Card>
  );
}
