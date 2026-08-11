import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import {
  CURRENT_PAIR,
  MOCK_BUDDY,
  MOCK_MISSION,
  MOCK_ACTIVE_MEMBERS,
  CURRENT_USER,
} from "@/lib/mock-data";

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member =
    MOCK_ACTIVE_MEMBERS.find((m) => m.id === id) ??
    MOCK_ACTIVE_MEMBERS[0] ??
    CURRENT_USER;

  const pair = CURRENT_PAIR;
  const buddy = MOCK_BUDDY;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-foreground shadow-sm transition-colors hover:bg-black/5"
          aria-label="Back to dashboard"
        >
          <Icon name="back" className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <Avatar name={member.name} avatar={member.avatar} size="lg" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{member.name}</h1>
            <p className="text-sm text-muted">{member.email}</p>
          </div>
        </div>
        <Badge color={pair.status === "completed" ? "success" : "warning"}>
          {pair.status === "completed" ? "Engaged" : "Needs follow-up"}
        </Badge>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-muted">ENGAGEMENT</p>
          <p className="mt-2 text-2xl font-bold text-foreground">340 XP</p>
          <div className="mt-3">
            <ProgressBar value={62} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Last active: 9 days ago · 5-week streak
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-muted">
            ASSIGNED BUDDY
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={buddy.name} avatar={buddy.avatar} size="md" />
            <div>
              <p className="font-bold text-foreground">{buddy.name}</p>
              <p className="text-xs text-muted">
                {pair.status === "completed" ? "Check-in completed" : "Check-in pending"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-muted">
            CURRENT MISSION
          </p>
          <p className="mt-2 font-bold text-foreground">{MOCK_MISSION.title}</p>
          <Badge color="primary" icon="sparkle" className="mt-2">
            +{MOCK_MISSION.xpReward} XP
          </Badge>
        </Card>
      </section>

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">
          COORDINATOR ACTIONS
        </p>
        <p className="mt-2 text-sm text-foreground/80">
          Reach out personally — CFFA identifies who may need attention; it does
          not replace human follow-up.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/admin" variant="secondary">
            Back to dashboard
          </ButtonLink>
          <Button>Mark as followed up</Button>
        </div>
      </Card>
    </div>
  );
}
