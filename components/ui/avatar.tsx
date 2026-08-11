const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
};

const colors = [
  "bg-primary-soft text-primary",
  "bg-success/15 text-success",
  "bg-warning/15 text-warning",
  "bg-danger/15 text-danger",
];

export function Avatar({
  name,
  avatar,
  size = "md",
  online,
  className = "",
}: {
  name: string;
  avatar?: string | null;
  size?: keyof typeof sizes;
  online?: boolean;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizes[size]} ${color} flex items-center justify-center rounded-full font-bold`}
        >
          {initials}
        </div>
      )}
      {online ? (
        <span className="absolute right-0 bottom-0 h-3 w-3 rounded-full bg-success ring-2 ring-white" />
      ) : null}
    </div>
  );
}
