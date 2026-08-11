import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons";

const features = [
  {
    icon: "buddy",
    title: "Weekly buddies",
    body: "You always know who to check in on each week.",
  },
  {
    icon: "mission",
    title: "Simple missions",
    body: "Small weekly actions that build real relationships.",
  },
  {
    icon: "checkin",
    title: "Verified moments",
    body: "Meet up, scan, and earn XP for meaningful interactions.",
  },
  {
    icon: "leaderboard",
    title: "Friendly rewards",
    body: "Track your engagement with XP, streaks, and rankings.",
  },
] as const;

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <div className="mb-8 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
          <Icon name="back" className="h-4 w-4" />
          Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-foreground">
        Fellowship follow-up,
        <br />
        for everyone.
      </h1>
      <p className="mt-3 text-muted">
        CFFA pairs you with a buddy each week so staying connected is simple —
        and gives coordinators visibility without the manual chasing.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {features.map((f) => (
          <Card key={f.title} className="flex items-start gap-4 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon name={f.icon} className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-foreground">{f.title}</p>
              <p className="text-sm text-muted">{f.body}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-auto pt-10">
        <ButtonLink href="/signup" size="lg" className="w-full">
          Create account
        </ButtonLink>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
