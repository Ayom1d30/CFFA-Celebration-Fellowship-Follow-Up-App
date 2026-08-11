import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icons";
import type { WeeklyMission } from "@/lib/types";

export function MissionCard({
  mission,
  className = "",
}: {
  mission: WeeklyMission;
  className?: string;
}) {
  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold tracking-wider text-muted">
          WEEKLY MISSION
        </p>
        {mission.completed ? (
          <Badge color="success" icon="checkin">
            Done
          </Badge>
        ) : (
          <Badge color="primary" icon="sparkle">
            +{mission.xpReward} XP
          </Badge>
        )}
      </div>
      <h3 className="mt-2 text-lg font-bold text-foreground">{mission.title}</h3>
      {mission.description ? (
        <p className="mt-1 text-sm text-muted">{mission.description}</p>
      ) : null}
      <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary">
        <Icon name="sparkle" className="h-4 w-4" />
        +{mission.xpReward} XP
      </div>
    </Card>
  );
}
