export type Role = "member" | "coordinator";

export type Team = "grace" | "faith" | "living-water" | "light";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  team?: Team | null;
  role: Role;
  lastActiveAt?: string | null;
  createdAt: string;
}

export type BuddyPairStatus = "pending" | "contacted" | "completed";

export interface BuddyPair {
  id: string;
  userId: string;
  buddyId: string;
  week: string;
  status: BuddyPairStatus;
  completedAt?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isQuick: boolean;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  buddyId: string;
  pairId?: string | null;
  date: string;
  verified: boolean;
  createdAt: string;
}

export interface PointsEntry {
  id: string;
  userId: string;
  action: XPAction;
  points: number;
  createdAt: string;
}

export type XPAction =
  | "message"
  | "weekly_followup"
  | "checkin"
  | "attendance"
  | "encourage"
  | "special_mission";

export interface WeeklyMission {
  id: string;
  title: string;
  description?: string | null;
  xpReward: number;
  week: string;
  completed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string | null;
  totalXp: number;
  rank: number;
}

export interface EngagementOverview {
  totalMembers: number;
  activeThisWeek: number;
  buddyCheckins: number;
  needsFollowup: number;
}

export interface NeedsFollowUpMember {
  memberId: string;
  name: string;
  lastActivity?: string | null;
  buddyName?: string | null;
}
