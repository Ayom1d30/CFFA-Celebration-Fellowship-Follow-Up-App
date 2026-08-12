import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  BuddyPair,
  BuddyPairStatus,
  EngagementOverview,
  LeaderboardEntry,
  Message,
  NeedsFollowUpMember,
  User,
  WeeklyMission,
} from "@/lib/types";
import * as mock from "@/lib/mock-data";

export interface SessionUser extends User {
  isDemo?: boolean;
}

export interface HomeData {
  user: User;
  buddy?: User | null;
  pair?: BuddyPair | null;
  mission?: WeeklyMission | null;
  xp: number;
  weekXp: number;
  streak: number;
}

export interface ConversationSummary {
  id: string;
  name: string;
  avatar?: string | null;
  online?: boolean;
  lastMessage: string;
  lastMessageAt: string;
  lastMessageMine: boolean;
}

export interface ProfileData {
  user: User;
  xp: number;
  streak: number;
  recentActivity: { action: string; points: number; createdAt: string }[];
}

export interface MemberDetail {
  member: User;
  xp: number;
  streak: number;
  buddy?: { id: string; name: string; avatar?: string | null; status: string } | null;
  mission?: WeeklyMission | null;
  recentActivity: { action: string; points: number; createdAt: string }[];
}

function currentWeekIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }
  return null;
}

function asString(value: unknown): string {
  return value == null ? "" : String(value);
}

function asNullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

function asNumber(value: unknown): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

function toUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    avatar: (row.avatar as string | null) ?? null,
    team: (row.team as User["team"]) ?? null,
    role: row.role === "coordinator" ? "coordinator" : "member",
    lastActiveAt: (row.last_active_at as string | null) ?? null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
  };
}

function toMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id),
    senderId: String(row.sender_id),
    receiverId: String(row.receiver_id),
    message: String(row.message),
    isQuick: Boolean(row.is_quick),
    createdAt: String(row.created_at),
  };
}

export async function getUserById(id: string): Promise<User | null> {
  if (!isSupabaseConfigured()) {
    return mock.MOCK_BUDDY.id === id ? mock.MOCK_BUDDY : null;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return toUser(data as Record<string, unknown>);
}

export async function getSessionUser(): Promise<SessionUser | null> {  if (!isSupabaseConfigured()) {
    return { ...mock.CURRENT_USER, isDemo: true };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  if (!data) return null;

  return toUser(data as Record<string, unknown>);
}

export async function getHomeData(): Promise<HomeData | null> {
  const user = await getSessionUser();
  if (!user) return null;

  if (user.isDemo) {
    return {
      user: mock.CURRENT_USER,
      buddy: mock.MOCK_BUDDY,
      pair: mock.CURRENT_PAIR,
      mission: mock.MOCK_MISSION,
      xp: mock.CURRENT_USER_XP,
      weekXp: 40,
      streak: mock.CURRENT_USER_STREAK,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_weekly_data");
  if (error) return null;

  const d = asObject(data) ?? {};
  const pairRaw = asObject(d.pair);
  const pair: BuddyPair | null = pairRaw
    ? {
        id: asString(pairRaw.id),
        userId: user.id,
        buddyId: asString(pairRaw.buddy_id),
        week: currentWeekIso(),
        status: asString(pairRaw.status) as BuddyPairStatus,
        createdAt: "",
      }
    : null;

  const buddyRaw = asObject(d.buddy);
  const buddy: User | null = buddyRaw
    ? {
        id: asString(buddyRaw.id),
        name: asString(buddyRaw.name),
        email: "",
        avatar: asNullableString(buddyRaw.avatar),
        team: null,
        role: "member",
        lastActiveAt: asNullableString(buddyRaw.last_active_at),
        createdAt: "",
      }
    : null;

  const missionRaw = asObject(d.mission);
  const mission: WeeklyMission | null = missionRaw
    ? {
        id: asString(missionRaw.id),
        title: asString(missionRaw.title),
        description: asNullableString(missionRaw.description),
        xpReward: asNumber(missionRaw.xp_reward) || 10,
        week: asString(missionRaw.week) || currentWeekIso(),
        completed: Boolean(missionRaw.completed),
      }
    : null;

  return {
    user,
    buddy,
    pair,
    mission,
    xp: asNumber(d.xp),
    weekXp: asNumber(d.week_xp),
    streak: asNumber(d.streak),
  };
}

export async function getConversationMessages(
  buddyId: string
): Promise<Message[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (user.isDemo) return mock.MOCK_MESSAGES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${buddyId}),and(sender_id.eq.${buddyId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });
  if (error) return [];

  return (data ?? []).map((row) => toMessage(row as Record<string, unknown>));
}

export async function getChatList(): Promise<ConversationSummary[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (user.isDemo) {
    const last = mock.MOCK_MESSAGES[mock.MOCK_MESSAGES.length - 1];
    return [
      {
        id: mock.MOCK_BUDDY.id,
        name: mock.MOCK_BUDDY.name,
        avatar: mock.MOCK_BUDDY.avatar,
        online: Boolean(mock.MOCK_BUDDY.lastActiveAt),
        lastMessage: last.message,
        lastMessageAt: last.createdAt,
        lastMessageMine: last.senderId === user.id,
      },
    ];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id, receiver_id, message, is_quick, created_at")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });
  if (error) return [];

  const latestByPartner = new Map<
    string,
    { message: string; createdAt: string; mine: boolean }
  >();
  for (const row of data ?? []) {
    const partner =
      row.sender_id === user.id ? row.receiver_id : row.sender_id;
    if (!latestByPartner.has(partner)) {
      latestByPartner.set(partner, {
        message: String(row.message),
        createdAt: String(row.created_at),
        mine: row.sender_id === user.id,
      });
    }
  }

  const partnerIds = [...latestByPartner.keys()];
  const { data: profiles } = partnerIds.length
    ? await supabase
        .from("users")
        .select("id, name, avatar, last_active_at")
        .in("id", partnerIds)
    : { data: [] as Record<string, unknown>[] };

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      String(p.id),
      p as Record<string, unknown>,
    ])
  );

  return [...latestByPartner.entries()].map(([id, m]) => {
    const profile = profileMap.get(id);
    return {
      id,
      name: String(profile?.name ?? "Member"),
      avatar: (profile?.avatar as string | null) ?? null,
      online: Boolean(profile?.last_active_at),
      lastMessage: m.message,
      lastMessageAt: m.createdAt,
      lastMessageMine: m.mine,
    };
  });
}

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (user.isDemo) return mock.MOCK_LEADERBOARD;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_leaderboard", {
    p_limit: 50,
  });
  if (error) return [];

  const rows = (data ?? []) as JsonObject[];
  return rows.map((r) => {
    return {
      userId: asString(r.user_id),
      name: asString(r.name),
      avatar: asNullableString(r.avatar),
      totalXp: asNumber(r.total_xp),
      rank: asNumber(r.rank),
    };
  });
}

export async function getProfileData(): Promise<ProfileData | null> {
  const user = await getSessionUser();
  if (!user) return null;

  if (user.isDemo) {
    return {
      user: mock.CURRENT_USER,
      xp: mock.CURRENT_USER_XP,
      streak: mock.CURRENT_USER_STREAK,
      recentActivity: [
        { action: "checkin", points: 15, createdAt: "2026-08-05T18:00:00Z" },
        { action: "weekly_followup", points: 10, createdAt: "2026-08-05T17:00:00Z" },
        { action: "message", points: 5, createdAt: "2026-08-05T16:00:00Z" },
      ],
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_profile");
  if (error) {
    return { user, xp: 0, streak: 0, recentActivity: [] };
  }

  const d = asObject(data) ?? {};
  return {
    user,
    xp: asNumber(d.xp),
    streak: asNumber(d.streak),
    recentActivity: (Array.isArray(d.recent_activity)
      ? (d.recent_activity as JsonObject[])
      : []
    ).map((a) => ({
      action: asString(a.action),
      points: asNumber(a.points),
      createdAt: asString(a.created_at),
    })),
  };
}

export async function getAdminOverview(): Promise<EngagementOverview | null> {
  const user = await getSessionUser();
  if (!user) return null;

  if (user.isDemo) return mock.MOCK_OVERVIEW;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_engagement_overview");
  if (error) return null;

  const d = asObject(data) ?? {};
  return {
    totalMembers: asNumber(d.total_members),
    activeThisWeek: asNumber(d.active_this_week),
    buddyCheckins: asNumber(d.buddy_checkins),
    needsFollowup: asNumber(d.needs_followup),
  };
}

export async function getNeedsFollowUpList(): Promise<NeedsFollowUpMember[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (user.isDemo) return mock.MOCK_NEEDS_FOLLOWUP;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_needs_followup", {
    p_days: 7,
  });
  if (error) return [];

  const rows = (data ?? []) as JsonObject[];
  return rows.map((r) => ({
    memberId: asString(r.member_id),
    name: asString(r.name),
    lastActivity: asNullableString(r.last_activity),
    buddyName: asNullableString(r.buddy_name),
  }));
}

export async function getMemberDetail(
  memberId: string
): Promise<MemberDetail | null> {
  const user = await getSessionUser();
  if (!user) return null;

  if (user.isDemo) {
    const fallback =
      mock.MOCK_ACTIVE_MEMBERS.find((m) => m.id === memberId) ??
      mock.CURRENT_USER;
    return {
      member: fallback,
      xp: 340,
      streak: 5,
      buddy: {
        id: mock.MOCK_BUDDY.id,
        name: mock.MOCK_BUDDY.name,
        avatar: mock.MOCK_BUDDY.avatar,
        status: mock.CURRENT_PAIR.status,
      },
      mission: mock.MOCK_MISSION,
      recentActivity: [
        { action: "checkin", points: 15, createdAt: "2026-08-05T18:00:00Z" },
        { action: "weekly_followup", points: 10, createdAt: "2026-08-05T17:00:00Z" },
        { action: "message", points: 5, createdAt: "2026-08-05T16:00:00Z" },
      ],
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_member_detail", {
    p_user_id: memberId,
  });
  if (error) return null;

  const d = asObject(data) ?? {};
  const memberRow = asObject(d.member) ?? {};
  const buddyRow = asObject(d.buddy);

  return {
    member: toUser(memberRow),
    xp: asNumber(d.xp),
    streak: asNumber(d.streak),
    buddy: buddyRow
      ? {
          id: asString(buddyRow.id),
          name: asString(buddyRow.name),
          avatar: asNullableString(buddyRow.avatar),
          status: asString(buddyRow.status) || "pending",
        }
      : null,
    mission: asObject(d.mission)
      ? {
          id: asString(asObject(d.mission)?.id ?? ""),
          title: asString(asObject(d.mission)?.title),
          description: null,
          xpReward: asNumber(asObject(d.mission)?.xp_reward) || 10,
          week: currentWeekIso(),
          completed: Boolean(asObject(d.mission)?.completed),
        }
      : null,
    recentActivity: (Array.isArray(d.recent_activity)
      ? (d.recent_activity as JsonObject[])
      : []
    ).map((a) => ({
      action: asString(a.action),
      points: asNumber(a.points),
      createdAt: asString(a.created_at),
    })),
  };
}

export async function getRecentMembers(): Promise<User[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (user.isDemo) return mock.MOCK_ACTIVE_MEMBERS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("last_active_at", { ascending: false, nullsFirst: false })
    .limit(10);
  if (error) return [];

  return (data ?? []).map((row) => toUser(row as Record<string, unknown>));
}
