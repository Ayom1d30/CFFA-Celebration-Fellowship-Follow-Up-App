import { redirect } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatNavLive } from "@/components/layout/chat-nav-live";
import { getSessionUser, userHasUnreadMessages } from "@/lib/data/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, hasUnread] = await Promise.all([
    getSessionUser(),
    userHasUnreadMessages(),
  ]);
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh">
      <ChatNavLive userId={user.id} demo={user.isDemo ?? false} />
      <Sidebar user={user} hasUnread={hasUnread} />
      <div className="min-w-0 flex-1 pb-24 md:pb-8">
        <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
          {children}
        </main>
      </div>
      <BottomNavigation hasUnread={hasUnread} />
    </div>
  );
}
