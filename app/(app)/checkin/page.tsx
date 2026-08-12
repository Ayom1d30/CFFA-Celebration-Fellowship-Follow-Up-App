import { redirect } from "next/navigation";
import { CheckinView } from "@/components/member/checkin-view";
import { Card } from "@/components/ui/card";
import { getHomeData } from "@/lib/data/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function CheckinPage() {
  const data = await getHomeData();
  if (!data) redirect("/login");

  if (!data.pair) {
    return (
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Buddy check-in</h1>
          <p className="mt-1 text-muted">
            Verify an in-person interaction with your buddy.
          </p>
        </header>
        <Card className="p-6 text-center">
          <p className="font-bold text-foreground">No pairing yet this week</p>
          <p className="mt-1 text-sm text-muted">
            You&apos;ll be able to check in once Tuesday&apos;s pairings are out.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <CheckinView
      pairId={data.pair.id}
      buddyName={data.buddy?.name ?? "your buddy"}
      demo={!isSupabaseConfigured()}
    />
  );
}
