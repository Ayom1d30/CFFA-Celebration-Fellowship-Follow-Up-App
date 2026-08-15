import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type ClientResult<T> = Promise<{ data: T | null; error: string | null }>;

async function run<T>(
  fn: () => Promise<{ data: T | null; error: { message: string } | null }>
): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await fn();
  return { data, error: error ? error.message : null };
}

export function sendBuddyMessage(
  buddyId: string,
  message: string,
  isQuick = false
) {
  return run<void>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("send_message", {
      p_buddy_id: buddyId,
      p_message: message,
      p_is_quick: isQuick,
    });
  });
}

export function completeWeeklyMission() {
  return run<void>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("complete_weekly_mission");
  });
}

export function createCheckinToken(pairId: string) {
  return run<string>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("create_checkin_token", { p_pair_id: pairId });
  });
}

export function verifyCheckin(token: string) {
  return run<void>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("verify_checkin", { p_token: token });
  });
}

export function markFollowedUp(memberId: string) {
  return run<void>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("mark_followed_up", { p_user_id: memberId });
  });
}

export interface PairingSchedule {
  enabled: boolean;
  schedule: string | null;
  weekday: number | null;
  time: string | null;
}

export function getPairingSchedule() {
  return run<PairingSchedule>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("get_pairing_schedule");
  });
}

export function setPairingSchedule(weekday: number, time: string) {
  return run<PairingSchedule>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("set_pairing_schedule", { p_weekday: weekday, p_time: time });
  });
}

export function generatePairingsNow() {
  return run<number>(async () => {
    if (!isSupabaseConfigured()) return { data: null, error: null };
    const client = createClient();
    return client.rpc("generate_weekly_pairings");
  });
}
