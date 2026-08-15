"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function ChatNavLive({
  userId,
  demo,
}: {
  userId: string;
  demo: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (demo || !isSupabaseConfigured() || !userId) return;
    const client = createClient();
    const channel = client
      .channel(`chatnav:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${userId}`,
        },
        () => router.refresh()
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [userId, demo, router]);

  return null;
}
