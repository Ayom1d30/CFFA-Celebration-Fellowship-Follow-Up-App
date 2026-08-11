import { StatCard } from "@/components/admin/stat-card";
import { NeedsFollowUpTable } from "@/components/admin/needs-follow-up-table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import {
  MOCK_OVERVIEW,
  MOCK_NEEDS_FOLLOWUP,
  MOCK_ACTIVE_MEMBERS,
} from "@/lib/mock-data";

export default function AdminDashboardPage() {
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
        <ButtonLink href="/admin/members/u-chi" variant="secondary" size="sm">
          View member details
        </ButtonLink>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Members"
          value={MOCK_OVERVIEW.totalMembers}
          icon="profile"
        />
        <StatCard
          label="Active this week"
          value={MOCK_OVERVIEW.activeThisWeek}
          icon="checkin"
        />
        <StatCard
          label="Buddy check-ins"
          value={MOCK_OVERVIEW.buddyCheckins}
          icon="buddy"
        />
        <StatCard
          label="Needs follow-up"
          value={MOCK_OVERVIEW.needsFollowup}
          icon="heart"
          hint="Inactive for 7+ days"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <h3 className="text-lg font-bold text-foreground">Recent activity</h3>
          </div>
          <div className="divide-y divide-border">
            {MOCK_ACTIVE_MEMBERS.slice(0, 5).map((member, i) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-4 sm:px-5"
              >
                <Avatar name={member.name} avatar={member.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="text-xs text-muted">
                    {i % 2 === 0
                      ? ["Active today", "Active yesterday", "Active 3 days ago"][i % 3]
                      : "Messaged their buddy"}
                  </p>
                </div>
                <Badge color={i < 3 ? "success" : "warning"}>
                  {i < 3 ? "Active" : "Check-in due"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <NeedsFollowUpTable members={MOCK_NEEDS_FOLLOWUP} />
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
