import { Card } from "@/components/ui/card";
import { LeaderboardRow } from "@/components/member/leaderboard-row";
import { Badge } from "@/components/ui/badge";
import { MOCK_LEADERBOARD, CURRENT_USER } from "@/lib/mock-data";

export default function LeaderboardPage() {
  const myRank = MOCK_LEADERBOARD.find(
    (entry) => entry.userId === CURRENT_USER.id
  );

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="mt-1 text-muted">
          Friendly competition — engagement, not attendance alone.
        </p>
      </header>

      {myRank ? (
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-bold tracking-wider text-muted">YOUR RANK</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              #{myRank.rank}
            </p>
          </div>
          <Badge color="primary" icon="sparkle">
            {myRank.totalXp.toLocaleString()} XP
          </Badge>
        </Card>
      ) : null}

      <Card className="divide-y divide-border p-2">
        {MOCK_LEADERBOARD.map((entry) => (
          <LeaderboardRow
            key={entry.userId}
            entry={entry}
            highlight={entry.userId === CURRENT_USER.id}
          />
        ))}
      </Card>
    </div>
  );
}
