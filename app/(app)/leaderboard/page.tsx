import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LeaderboardRow } from "@/components/member/leaderboard-row";
import { Badge } from "@/components/ui/badge";
import { getLeaderboardData, getSessionUser } from "@/lib/data/server";

export default async function LeaderboardPage() {
  const [leaderboard, user] = await Promise.all([
    getLeaderboardData(),
    getSessionUser(),
  ]);
  if (!user) redirect("/login");

  const top = leaderboard[0] ?? null;
  const mine = leaderboard.find((e) => e.userId === user.id);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="mt-1 text-muted">
          Friendly competition — engagement, not attendance alone.
        </p>
      </header>

      {mine ? (
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-bold tracking-wider text-muted">
              YOUR RANK
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">#{mine.rank}</p>
          </div>
          <Badge color="primary" icon="sparkle">
            {mine.totalXp.toLocaleString()} XP
          </Badge>
        </Card>
      ) : null}

      {leaderboard.length > 0 ? (
        <Card className="divide-y divide-border p-2">
          {leaderboard.map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              highlight={entry.userId === user.id}
            />
          ))}
        </Card>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Leaderboard will populate as members earn XP.
        </div>
      )}

      {top && top.userId !== user.id ? (
        <p className="text-center text-xs text-muted">
          {top.name} leads with {top.totalXp.toLocaleString()} XP
        </p>
      ) : null}
    </div>
  );
}
