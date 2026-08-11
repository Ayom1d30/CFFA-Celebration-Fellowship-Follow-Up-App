import { cn } from "@/lib/utils";

export function MessageBubble({
  message,
  mine,
}: {
  message: string;
  mine: boolean;
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
      </div>
    </div>
  );
}
