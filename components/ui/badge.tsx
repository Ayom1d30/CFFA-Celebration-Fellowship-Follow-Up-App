import { Icon, type IconName } from "./icons";

export function Badge({
  children,
  color = "default",
  icon,
  className = "",
}: {
  children: React.ReactNode;
  color?: "default" | "primary" | "success" | "warning" | "danger";
  icon?: IconName;
  className?: string;
}) {
  const colors: Record<string, string> = {
    default: "bg-black/5 text-foreground",
    primary: "bg-primary-soft text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${colors[color]} ${className}`}
    >
      {icon ? <Icon name={icon} className="h-3.5 w-3.5" /> : null}
      {children}
    </span>
  );
}
