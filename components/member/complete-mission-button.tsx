"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons";
import { completeWeeklyMission } from "@/lib/data/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function CompleteMissionButton({
  completed,
}: {
  completed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onComplete() {
    if (!isSupabaseConfigured()) {
      router.refresh();
      return;
    }
    startTransition(async () => {
      const { error: e } = await completeWeeklyMission();
      if (e) {
        setError(e);
        return;
      }
      router.refresh();
    });
  }

  if (completed) {
    return (
      <Button disabled variant="secondary">
        <Icon name="checkin" className="h-4 w-4" />
        Completed
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={onComplete} disabled={pending}>
        <Icon name="checkin" className="h-4 w-4" />
        {pending ? "Completing…" : "Complete mission"}
      </Button>
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
