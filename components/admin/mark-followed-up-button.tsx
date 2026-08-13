"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markFollowedUp } from "@/lib/data/client";

export function MarkFollowedUpButton({
  memberId,
  label = "Mark as followed up",
}: {
  memberId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const { error: e } = await markFollowedUp(memberId);
    setLoading(false);
    if (e) {
      setError(e);
      return;
    }
    setDone(true);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={onClick} disabled={loading || done}>
        {done ? "Marked as followed up" : loading ? "Marking…" : label}
      </Button>
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
