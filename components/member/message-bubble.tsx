import { cn } from "@/lib/utils";

export function MessageBubble({
  message,
  mine,
  status,
}: {
  message: string;
  mine: boolean;
  status?: "sent" | "seen";
}) {
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
          mine
            ? "rounded-br-md bg-primary text-white"
            : "rounded-bl-md bg-white border border-border text-foreground"
        )}
      >
        {message}
        {mine && status ? (
          <span
            className={cn(
              "ml-2 inline-block select-none text-xs leading-none",
              status === "seen" ? "text-white/90" : "text-white/50"
            )}
            title={status === "seen" ? "Seen" : "Sent"}
          >
            {status === "seen" ? "✓✓" : "✓"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
