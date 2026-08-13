import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { MarkFollowedUpButton } from "@/components/admin/mark-followed-up-button";
import { formatLastActivity } from "@/lib/utils";
import type { NeedsFollowUpMember } from "@/lib/types";

export function NeedsFollowUpTable({
  members,
}: {
  members: NeedsFollowUpMember[];
}) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-5">
        <h3 className="text-lg font-bold text-foreground">Needs Follow-Up</h3>
        <p className="text-sm text-muted">
          Members below the engagement threshold.
        </p>
      </div>
      <div className="divide-y divide-border">
        {members.map((member) => (
          <div
            key={member.memberId}
            className="flex items-center gap-3 p-4 sm:px-5"
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{member.name}</p>
              <p className="text-xs text-muted">
                Last activity: {formatLastActivity(member.lastActivity)}
              </p>
            </div>
            {member.buddyName ? (
              <Badge color="primary">Buddy: {member.buddyName}</Badge>
            ) : null}
            <div className="flex items-center gap-2">
              <MarkFollowedUpButton
                memberId={member.memberId}
                label="Followed up"
              />
              <ButtonLink
                href={`/admin/members/${member.memberId}`}
                size="sm"
                variant="secondary"
              >
                View
              </ButtonLink>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
