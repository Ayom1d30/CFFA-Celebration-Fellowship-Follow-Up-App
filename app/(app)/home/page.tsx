import { redirect } from "next/navigation";
import { BuddyCard } from "@/components/member/buddy-card";
import { MissionCard } from "@/components/member/mission-card";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { greeting } from "@/lib/constants";
import { getHomeData } from "@/lib/data/server";

const WEEKLY_GOAL_XP = 100;

export default async function HomePage() {
  const data = await getHomeData();
  if (!data) redirect("/login");

  const { user, buddy, pair, mission, xp, weekXp, streak } = data;
  const progress = Math.round(Math.min(100, (weekXp / WEEKLY_GOAL_XP) * 100));

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {greeting().replace("👋", "")}
          <span className="ml-2">{user.name} 👋</span>
        </h1>
        <p className="mt-1 text-muted">Here&apos;s your fellowship dashboard.</p>
      </header>

      {buddy && pair ? (
        <BuddyCard buddy={buddy} pairStatus={pair.status} />
      ) : (
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <Icon name="buddy" className="h-6 w-6" />
          </span>
          <div>
            <p className="font-bold text-foreground">No buddy yet this week</p>
            <p className="text-sm text-muted">
              New pairings are generated every Tuesday. Check back then!
            </p>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider text-muted">YOUR WEEK</p>
          <Badge color="primary" icon="sparkle">
            {xp.toLocaleString()} XP total
          </Badge>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={progress} />
            <p className="mt-2 text-xs text-muted">
              {weekXp}/{WEEKLY_GOAL_XP} XP toward this week&apos;s goal
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">
              {streak}
              <span className="text-sm text-primary">❤️</span>
            </p>
            <p className="text-xs text-muted">
              {streak}-week streak
            </p>
          </div>
        </div>
      </Card>

      {mission ? (
        <MissionCard mission={mission} />
      ) : (
        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-muted">
            WEEKLY MISSION
          </p>
          <p className="mt-2 font-bold text-foreground">
            Check in with your buddy
          </p>
          <p className="mt-1 text-sm text-muted">
            Coming soon — missions unlock with this week&apos;s pairing.
          </p>
        </Card>
      )}

      <Card className="flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Icon name="checkin" className="h-5 w-5" />
          </span>
          <div>
            <p className="font-bold text-foreground">Check in with your buddy</p>
            <p className="text-sm text-muted">Verify an in-person interaction</p>
          </div>
        </div>
        <ButtonLink href="/checkin" variant="secondary" size="sm">
          Open
        </ButtonLink>
      </Card>
    </div>
  );
}
