import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { APP_NAME } from "@/lib/constants";

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon name="heart" className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-foreground">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-xs text-muted">
        {APP_NAME} needs a connection for the latest updates. Check your internet
        and try again.
      </p>
      <Link
        href="/home"
        className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white"
      >
        Try again
      </Link>
    </main>
  );
}
