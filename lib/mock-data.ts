import type {
  BuddyPair,
  EngagementOverview,
  LeaderboardEntry,
  Message,
  NeedsFollowUpMember,
  User,
  WeeklyMission,
} from "./types";

export const CURRENT_USER: User = {
  id: "u-ayo",
  name: "Ayo",
  email: "ayo@celebration.org",
  team: "grace",
  role: "member",
  createdAt: "2026-01-12T09:00:00Z",
};

export const CURRENT_USER_XP = 340;
export const CURRENT_USER_STREAK = 5;

export const MOCK_BUDDY: User = {
  id: "u-tomi",
  name: "Tomi",
  email: "tomi@celebration.org",
  team: "faith",
  role: "member",
  lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
  createdAt: "2026-01-12T09:00:00Z",
};

export const CURRENT_PAIR: BuddyPair = {
  id: "pair-1",
  userId: CURRENT_USER.id,
  buddyId: MOCK_BUDDY.id,
  week: "2026-08-10",
  status: "pending",
  createdAt: "2026-08-10T09:00:00Z",
};

export const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    senderId: "u-tomi",
    receiverId: CURRENT_USER.id,
    message: "Hey Ayo! How's your week going?",
    isQuick: true,
    createdAt: "2026-08-10T10:00:00Z",
  },
  {
    id: "m2",
    senderId: CURRENT_USER.id,
    receiverId: "u-tomi",
    message: "Great! Busy but good. Are you coming this week?",
    isQuick: false,
    createdAt: "2026-08-10T10:15:00Z",
  },
  {
    id: "m3",
    senderId: "u-tomi",
    receiverId: CURRENT_USER.id,
    message: "Yes, see you Tuesday👋",
    isQuick: true,
    createdAt: "2026-08-10T10:20:00Z",
  },
];

export const MOCK_MISSION: WeeklyMission = {
  id: "mission-1",
  title: "Check in with your buddy",
  description: "Send a message and make sure they're doing okay this week.",
  xpReward: 10,
  week: "2026-08-10",
  completed: false,
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { userId: "u-chi", name: "Chioma", totalXp: 1280, rank: 1 },
  { userId: "u-femi", name: "Femi", totalXp: 1120, rank: 2 },
  { userId: "u-sarah", name: "Sarah", totalXp: 980, rank: 3 },
  { userId: "u-daniel", name: "Daniel", totalXp: 860, rank: 4 },
  { userId: "u-tolu", name: "Tolu", totalXp: 720, rank: 5 },
  { userId: "u-blessing", name: "Blessing", totalXp: 640, rank: 6 },
  { userId: "u-ayo", name: "Ayo", totalXp: 340, rank: 7 },
];

export const MOCK_OVERVIEW: EngagementOverview = {
  totalMembers: 87,
  activeThisWeek: 74,
  buddyCheckins: 63,
  needsFollowup: 8,
};

export const MOCK_NEEDS_FOLLOWUP: NeedsFollowUpMember[] = [
  { memberId: "u-daniel", name: "Daniel", lastActivity: "9 days ago", buddyName: "Sarah" },
  { memberId: "u-tolu", name: "Tolu", lastActivity: "12 days ago", buddyName: "Ayo" },
  { memberId: "u-grace", name: "Grace", lastActivity: "7 days ago", buddyName: "David" },
];

export const MOCK_ACTIVE_MEMBERS: User[] = [
  { id: "u-chi", name: "Chioma", email: "chi@celebration.org", role: "member", createdAt: "2026-01-12T09:00:00Z" },
  { id: "u-femi", name: "Femi", email: "femi@celebration.org", role: "member", createdAt: "2026-01-12T09:00:00Z" },
  { id: "u-sarah", name: "Sarah", email: "sarah@celebration.org", role: "member", createdAt: "2026-01-12T09:00:00Z" },
  { id: "u-daniel", name: "Daniel", email: "daniel@celebration.org", role: "member", createdAt: "2026-01-12T09:00:00Z" },
  { id: "u-tolu", name: "Tolu", email: "tolu@celebration.org", role: "member", createdAt: "2026-01-12T09:00:00Z" },
  { id: "u-grace", name: "Grace", email: "grace@celebration.org", role: "member", createdAt: "2026-01-12T09:00:00Z" },
];

export function daysSince(iso?: string | null): string {
  if (!iso) return "No activity yet";
  const days = Math.floor(
    (Date.now() - new Date(iso).getTime()) / 86400000
  );
  if (days <= 0) return "Active today";
  if (days === 1) return "Active yesterday";
  return `Active ${days} days ago`;
}
