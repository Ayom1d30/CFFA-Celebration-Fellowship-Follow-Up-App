import { MissionCard } from "@/components/member/mission-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_MISSION } from "@/lib/mock-data";

export default function MissionsPage() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Missions</h1>
        <p className="mt-1 text-muted">
          One simple action each week to build relationships.
        </p>
      </header>

      <MissionCard mission={MOCK_MISSION} />

      <Card className="p-5">
        <p className="text-xs font-bold tracking-wider text-muted">IDEA LIBRARY</p>
        <p className="mt-2 text-sm text-muted">
          Future missions could include:
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {[
            "Learn something new about your buddy",
            "Encourage someone",
            "Pray for someone",
            "Invite someone to fellowship",
          ].map((idea) => (
            <Badge key={idea} color="primary">
              {idea}
            </Badge>
          ))}
        </ul>
      </Card>

      <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-foreground">Missed a week?</p>
          <p className="text-sm text-muted">
            We missed you! Want to check in with someone this week?
          </p>
        </div>
        <Button>Message my buddy</Button>
      </Card>
    </div>
  );
}
