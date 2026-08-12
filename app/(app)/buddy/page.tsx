import { redirect } from "next/navigation";
import { BuddyCard } from "@/components/member/buddy-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { getHomeData } from "@/lib/data/server";

export default async function BuddyPage() {
  const data = await getHomeData();
  if (!data) redirect("/login");

  const { buddy, pair } = data;

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Your buddy</h1>
        <p className="mt-1 text-muted">
          Reassigned every Tuesday so everyone gets connected.
        </p>
      </header>

      {buddy && pair ? (
        <>
          <BuddyCard buddy={buddy} pairStatus={pair.status} />

          <Card className="p-5">
            <p className="text-xs font-bold tracking-wider text-muted">
              HOW IT WORKS
            </p>
            <ul className="mt-3 flex flex-col gap-3 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <Badge color="primary">1</Badge>
                Message your buddy — suggested messages make it easy.
              </li>
              <li className="flex items-start gap-2">
                <Badge color="primary">2</Badge>
                Complete the weekly mission for +10 XP.
              </li>
              <li className="flex items-start gap-2">
                <Badge color="primary">3</Badge>
                Meet up at fellowship and verify with a QR check-in for +15 XP.
              </li>
            </ul>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/chat/${buddy.id}`} className="flex-1">
              Message {buddy.name.split(" ")[0]}
            </ButtonLink>
            <ButtonLink href="/checkin" variant="secondary" className="flex-1">
              Check in with buddy
            </ButtonLink>
          </div>
        </>
      ) : (
        <Card className="p-6 text-center">
          <p className="font-bold text-foreground">No pairing yet this week</p>
          <p className="mt-1 text-sm text-muted">
            New buddies are assigned every Tuesday. You&apos;ll see your pair here
            once generated.
          </p>
        </Card>
      )}
    </div>
  );
}
