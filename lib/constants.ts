import type { IconName } from "@/components/ui/icons";
import type { XPAction } from "./types";

export const XP_TABLE: Record<XPAction, number> = {
  message: 5,
  weekly_followup: 10,
  checkin: 15,
  attendance: 10,
  encourage: 5,
  special_mission: 20,
};

export const QUICK_MESSAGES = [
  "How's your week going?",
  "Are you coming this week?",
  "Need prayer?",
  "See you Tuesday👋",
];

export const APP_NAME = "CFFA";
export const APP_TAGLINE = "Celebration Fellowship Follow-up App";

export const TEAMS = [
  { id: "grace", name: "Team Grace", color: "#F43F5E" },
  { id: "faith", name: "Team Faith", color: "#0EA5E9" },
  { id: "living-water", name: "Team Living Water", color: "#10B981" },
  { id: "light", name: "Team Light", color: "#F59E0B" },
];

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
}

export const MOBILE_NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/missions", label: "Missions", icon: "mission" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export const DESKTOP_NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/buddy", label: "Buddy", icon: "buddy" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/missions", label: "Missions", icon: "mission" },
  { href: "/leaderboard", label: "Leaderboard", icon: "leaderboard" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning 👋";
  if (hour < 17) return "Good afternoon 👋";
  return "Good evening 👋";
}
