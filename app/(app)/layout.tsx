import { redirect } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatNavLive } from "@/components/layout/chat-nav-live";
import { getSessionUser, userHasChat } from "@/lib/data/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, hasChat] = await Promise.all([getSessionUser(), userHasChat()]);
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh">
      <ChatNavLive userId={user.id} demo={user.isDemo ?? false} />
      <Sidebar user={user} hasChat={hasChat} />
      <div className="min-w-0 flex-1 pb-24 md:pb-8">
        <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
          {children}
        </main>
      </div>
      <BottomNavigation hasChat={hasChat} />
    </div>
  );
}
