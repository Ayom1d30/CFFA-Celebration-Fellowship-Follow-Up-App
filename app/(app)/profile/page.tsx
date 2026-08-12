import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { signOut } from "@/lib/actions/auth";
import { getHomeData, getProfileData } from "@/lib/data/server";

const ACTION_LABELS: Record<string, string> = {
  message: "Messaged your buddy",
  weekly_followup: "Weekly mission completed",
  checkin: "Buddy check-in",
  attendance: "Attended fellowship",
  encourage: "Encouraged someone",
  special_mission: "Special mission completed",
};

export default async function ProfilePage() {
  const [profile, home] = await Promise.all([getProfileData(), getHomeData()]);
  if (!profile) redirect("/login");

  const { user, xp, streak, recentActivity } = profile;
  const buddy = home?.buddy ?? null;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
      </header>

      <Card className="flex flex-col items-center gap-3 p-6 text-center">
        <Avatar name={user.name} avatar={user.avatar} size="lg" />
        <div>
          <p className="text-xl font-bold text-foreground">{user.name}</p>
          <p className="text-sm text-muted">
            {user.team
              ? "Team " +
                user.team
                  .split("-")
                  .map((w) => (w[0]?.toUpperCase() ?? "") + w.slice(1))
                  .join(" ")
              : "Member"}{" "}
            · {user.role}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{xp} XP</p>
            <p className="text-xs text-muted">Total</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{streak} ❤️</p>
            <p className="text-xs text-muted">Week streak</p>
          </div>
        </div>
        <div className="w-full max-w-xs">
          <ProgressBar value={Math.min(100, Math.round((xp / 1000) * 100))} />
          <p className="mt-1.5 text-xs text-muted">
            {Math.min(100, Math.round((xp / 1000) * 100))}% toward the next
            milestone
          </p>
        </div>
        {buddy ? (
          <ButtonLink href="/checkin" variant="secondary" size="sm">
            Check in with {buddy.name}
          </ButtonLink>
        ) : null}
      </Card>

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">
          RECENT ACTIVITY
        </p>
        {recentActivity.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No activity yet — message your buddy to start earning XP.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {recentActivity.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2.5"
              >
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

      <form action={signOut}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-sm font-semibold text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Icon name="logout" className="h-5 w-5" />
          Sign out
        </button>
      </form>
    </div>
  );
}
