import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ButtonLink } from "@/components/ui/button";
import {
  CURRENT_USER,
  CURRENT_USER_STREAK,
  CURRENT_USER_XP,
  MOCK_BUDDY,
} from "@/lib/mock-data";

const activity = [
  { label: "Buddy check-in with Tomi", xp: "+15", date: "Last Tuesday" },
  { label: "Weekly mission completed", xp: "+10", date: "Last Tuesday" },
  { label: "Messaged your buddy", xp: "+5", date: "Last Tuesday" },
  { label: "Attended fellowship", xp: "+10", date: "Sunday" },
];

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </header>

      <Card className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar name={CURRENT_USER.name} avatar={CURRENT_USER.avatar} size="lg" />
        <div>
          <p className="text-xl font-bold text-foreground">{CURRENT_USER.name}</p>
          <p className="text-sm text-muted">
            {CURRENT_USER.team
              ? "Team " + CURRENT_USER.team.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ")
              : "Member"}{" "}
            · {CURRENT_USER.role}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{CURRENT_USER_XP} XP</p>
            <p className="text-xs text-muted">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">
              {CURRENT_USER_STREAK} ❤️
            </p>
            <p className="text-xs text-muted">Week streak</p>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <ProgressBar value={70} />
          <p className="mt-1.5 text-xs text-muted">70% toward next milestone</p>
        </div>
        <ButtonLink href="/checkin" variant="secondary" size="sm">
          Check in with {MOCK_BUDDY.name}
        </ButtonLink>
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">RECENT ACTIVITY</p>
        <div className="mt-3 divide-y divide-border">
          {activity.map((a) => (
            <div key={a.label} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
                <p className="text-xs text-muted">{a.date}</p>
              </div>
              <Badge color="primary">+{a.xp.replace("+", "")} XP</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
