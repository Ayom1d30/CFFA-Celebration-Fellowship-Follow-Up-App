import { StatCard } from "@/components/admin/stat-card";
import { NeedsFollowUpTable } from "@/components/admin/needs-follow-up-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import {
  getAdminOverview,
  getNeedsFollowUpList,
  getRecentMembers,
} from "@/lib/data/server";
import { formatLastActivity } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [overview, needsFollowUp, recentMembers] = await Promise.all([
    getAdminOverview(),
    getNeedsFollowUpList(),
    getRecentMembers(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Fellowship overview
          </h1>
          <p className="mt-1 text-muted">
            Quick visibility into who is engaged and who may need attention.
          </p>
        </div>
        {recentMembers[0] ? (
          <ButtonLink
            href={`/admin/members/${recentMembers[0].id}`}
            variant="secondary"
            size="sm"
          >
            View member details
          </ButtonLink>
        ) : null}
      </header>

      {overview ? (
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Members"
            value={overview.totalMembers}
            icon="profile"
          />
          <StatCard
            label="Active this week"
            value={overview.activeThisWeek}
            icon="checkin"
          />
          <StatCard
            label="Buddy check-ins"
            value={overview.buddyCheckins}
            icon="buddy"
          />
          <StatCard
            label="Needs follow-up"
            value={overview.needsFollowup}
            icon="heart"
            hint="Inactive for 7+ days"
          />
        </section>
      ) : (
        <Card className="p-5">
          <p className="text-sm text-muted">
            Overview unavailable — confirm your coordinator role in the
            database.
          </p>
        </Card>
      )}

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <h3 className="text-lg font-bold text-foreground">Recent activity</h3>
          </div>
          {recentMembers.length === 0 ? (
            <p className="p-5 text-sm text-muted">No members yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentMembers.slice(0, 6).map((member, i) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-4 sm:px-5"
                >
                  <Avatar name={member.name} avatar={member.avatar} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {member.name}
                    </p>
                    <p className="text-xs text-muted">
                      {formatLastActivity(member.lastActiveAt)}
                    </p>
                  </div>
                  <Badge color={i < 3 ? "success" : "warning"}>
                    {i < 3 ? "Active" : "Check-in due"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <NeedsFollowUpTable members={needsFollowUp} />
      </section>

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">
          WHAT THE SYSTEM IS FOR
        </p>
        <p className="mt-2 text-sm text-foreground/80">
          CFFA identifies who might need human attention — it does not replace
          human follow-up. Use this list to reach out personally.
        </p>
      </Card>
    </div>
  );
}
