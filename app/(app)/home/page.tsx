import { BuddyCard } from "@/components/member/buddy-card";
import { MissionCard } from "@/components/member/mission-card";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { greeting } from "@/lib/constants";
import {
  CURRENT_USER,
  CURRENT_USER_XP,
  CURRENT_USER_STREAK,
  CURRENT_PAIR,
  MOCK_BUDDY,
  MOCK_MISSION,
} from "@/lib/mock-data";

const WEEKLY_GOAL_XP = 100;

export default function HomePage() {
  const progress = Math.round(
    Math.min(100, (CURRENT_USER_XP / WEEKLY_GOAL_XP) * 100)
  );

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {greeting().replace("👋", "")}
          <span className="ml-2">{CURRENT_USER.name} 👋</span>
        </h1>
        <p className="mt-1 text-muted">Here&apos;s your fellowship dashboard.</p>
      </header>

      <BuddyCard buddy={MOCK_BUDDY} pairStatus={CURRENT_PAIR.status} />

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider text-muted">YOUR WEEK</p>
          <Badge color="primary" icon="sparkle">
            +{CURRENT_USER_XP} XP
          </Badge>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1">
            <ProgressBar value={progress} />
            <p className="mt-2 text-xs text-muted">
              {CURRENT_USER_XP}/{WEEKLY_GOAL_XP} XP toward this week&apos;s goal
            </p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-foreground">
              {CURRENT_USER_STREAK}
              <span className="text-sm text-primary">❤️</span>
            </p>
            <p className="text-xs text-muted">
              {CURRENT_USER_STREAK}-week streak
            </p>
          </div>
        </div>
      </Card>

      <MissionCard mission={MOCK_MISSION} />

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
