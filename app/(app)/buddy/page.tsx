import { BuddyCard } from "@/components/member/buddy-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { CURRENT_PAIR, MOCK_BUDDY, CURRENT_USER } from "@/lib/mock-data";

export default function BuddyPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Your buddy</h1>
        <p className="mt-1 text-muted">
          Reassigned every Tuesday so everyone gets connected.
        </p>
      </header>

      <BuddyCard buddy={MOCK_BUDDY} pairStatus={CURRENT_PAIR.status} />

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">HOW IT WORKS</p>
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
        <ButtonLink href={`/chat/${MOCK_BUDDY.id}`} className="flex-1">
          Message {MOCK_BUDDY.name}
        </ButtonLink>
        <ButtonLink href="/checkin" variant="secondary" className="flex-1">
          Check in with buddy
        </ButtonLink>
      </div>

      <p className="text-xs text-muted">
        You are {CURRENT_USER.name}&apos;s buddy, and they are yours. Pairings are
        chosen to vary week to week.
      </p>
    </div>
  );
}
