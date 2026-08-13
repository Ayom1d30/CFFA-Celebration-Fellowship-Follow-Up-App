import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MarkFollowedUpButton } from "@/components/admin/mark-followed-up-button";
import { getMemberDetail } from "@/lib/data/server";
import { formatLastActivity } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  message: "Messaged buddy",
  weekly_followup: "Weekly mission completed",
  checkin: "Buddy check-in",
  attendance: "Attended fellowship",
  encourage: "Encouraged someone",
  special_mission: "Special mission completed",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getMemberDetail(id);

  if (!detail) {
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
          <h1 className="text-2xl font-bold text-foreground">Member not found</h1>
        </header>
        <Card className="p-5 text-sm text-muted">
          This member could not be loaded.
        </Card>
      </div>
    );
  }

  const { member, xp, streak, buddy, mission, recentActivity } = detail;
  const engaged = buddy?.status === "completed";

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
            <h1 className="text-2xl font-bold text-foreground">
              {member.name}
            </h1>
            <p className="text-sm text-muted">
              {member.email} · last active {formatLastActivity(member.lastActiveAt)}
            </p>
          </div>
        </div>
        <Badge color={engaged ? "success" : "warning"}>
          {engaged ? "Engaged" : "Needs follow-up"}
        </Badge>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-muted">
            ENGAGEMENT
          </p>
          <p className="mt-2 text-2xl font-bold text-foreground">{xp} XP</p>
          <div className="mt-3">
            <ProgressBar value={Math.min(100, Math.round((xp / 1000) * 100))} />
          </div>
          <p className="mt-2 text-xs text-muted">
            {streak}-week streak
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-muted">
            ASSIGNED BUDDY
          </p>
          {buddy ? (
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={buddy.name} avatar={buddy.avatar} size="md" />
              <div>
                <p className="font-bold text-foreground">{buddy.name}</p>
                <p className="text-xs text-muted">
                  {buddy.status === "completed"
                    ? "Check-in completed"
                    : buddy.status === "contacted"
                      ? "Contacted this week"
                      : "Check-in pending"}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">No buddy assigned yet.</p>
          )}
        </Card>

        <Card className="p-5">
          <p className="text-xs font-bold tracking-wider text-muted">
            CURRENT MISSION
          </p>
          {mission ? (
            <>
              <p className="mt-2 font-bold text-foreground">{mission.title}</p>
              <Badge color="primary" icon="sparkle" className="mt-2">
                +{mission.xpReward} XP
                {mission.completed ? " · Done" : ""}
              </Badge>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">No mission this week.</p>
          )}
        </Card>
      </section>

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">
          RECENT ACTIVITY
        </p>
        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No recorded activity yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {ACTION_LABELS[a.action] ?? a.action}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(a.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Badge color="primary">+{a.points} XP</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">
          COORDINATOR ACTION
        </p>
        <p className="mt-2 text-sm text-foreground/80">
          Reach out personally — CFFA identifies who may need attention; it does
          not replace human follow-up.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground transition-colors hover:bg-black/5"
          >
            Back to dashboard
          </Link>
          <MarkFollowedUpButton memberId={member.id} />
        </div>
      </Card>
    </div>
  );
}
