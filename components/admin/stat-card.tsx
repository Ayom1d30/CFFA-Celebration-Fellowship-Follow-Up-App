import { Card } from "@/components/ui/card";
import { Icon, type IconName } from "@/components/ui/icons";

export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: IconName;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-muted uppercase">
        <Icon name={icon} className="h-4 w-4" />
        {label}
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </Card>
  );
}
