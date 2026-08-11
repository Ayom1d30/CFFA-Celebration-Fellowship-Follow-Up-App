import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-24 md:pb-8">
        <main className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
          {children}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
