"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESKTOP_NAV, APP_NAME } from "@/lib/constants";
import { Icon } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import { CURRENT_USER } from "@/lib/mock-data";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-5 md:flex">
      <Link href="/home" className="mb-8 flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
          <Icon name="heart" className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-foreground">{APP_NAME}</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {DESKTOP_NAV.map((item) => {
          const active =
            item.href === "/home"
              ? pathname === "/home"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary-soft text-primary"
                  : "text-foreground/70 hover:bg-black/5 hover:text-foreground"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-background p-3">
        <Avatar name={CURRENT_USER.name} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-foreground">
            {CURRENT_USER.name}
          </p>
          <p className="text-xs text-muted">{CURRENT_USER.role}</p>
        </div>
      </div>
    </aside>
  );
}
