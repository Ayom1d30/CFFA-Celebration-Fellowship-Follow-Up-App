import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icons";
import { getSessionUser } from "@/lib/data/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (isSupabaseConfigured() && user.role !== "coordinator") {
    redirect("/home");
  }

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Icon name="heart" className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Coordinator Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
          <Link
            href="/home"
            className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-black/5 hover:text-foreground"
          >
            <Icon name="profile" className="h-4 w-4" />
            Member view
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
