"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function QuickMessages({
  suggestions,
  onSend,
}: {
  suggestions: string[];
  onSend: (text: string) => void;
}) {
  const [sent, setSent] = useState<string | null>(null);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {suggestions.map((text) => (
        <button
          key={text}
          type="button"
          onClick={() => {
            onSend(text);
            setSent(text);
          }}
          className={`shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
            sent === text
              ? "border-primary bg-primary-soft text-primary"
              : "border-border bg-surface text-foreground hover:border-primary/40"
          }`}
        >
          {text}
        </button>
      ))}
      <Button size="sm" variant="secondary" onClick={() => setSent(null)}>
        Reset
      </Button>
    </div>
  );
}
