import { Avatar } from "@/components/ui/avatar";
import type { LeaderboardEntry } from "@/lib/types";

export function LeaderboardRow({
  entry,
  highlight,
}: {
  entry: LeaderboardEntry;
  highlight?: boolean;
}) {
  const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        highlight ? "bg-primary-soft" : "hover:bg-black/5"
      }`}
    >
      <span className="w-8 text-center font-bold text-muted">
        {medal ?? entry.rank}
      </span>
      <Avatar name={entry.name} avatar={entry.avatar} size="sm" />
      <span className="flex-1 truncate font-semibold text-foreground">
        {entry.name}
      </span>
      <span className="font-bold text-primary">{entry.totalXp.toLocaleString()} XP</span>
    </div>
  );
}
