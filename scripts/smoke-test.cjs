#!/usr/bin/env node
/**
 * End-to-end smoke test against the live Supabase project.
 *
 * Requires in .env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 * SUPABASE_DB_CONNECTION_STRING. Uses the seeded accounts from
 * supabase/migrations/0004_seed_data.sql (password: CFFA-Test-123!).
 *
 * Run: npm run smoke:test
 * Exits non-zero if any assertion fails.
 */
const { readFileSync } = require("fs");
const { resolve } = require("path");
const { Client } = require("pg");
const { createClient } = require("@supabase/supabase-js");

const ROOT = resolve(__dirname, "..");
const SEED_PASSWORD = "CFFA-Test-123!";

function loadEnvFile(path) {
  try {
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
      }
    }
  } catch {
    /* ignore */
  }
}
loadEnvFile(resolve(ROOT, ".env"));

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const DB = process.env.SUPABASE_DB_CONNECTION_STRING;

let pass = 0;
let fail = 0;

function ok(name) {
  pass++;
  console.log(`  PASS  ${name}`);
}
function bad(name, why) {
  fail++;
  console.log(`  FAIL  ${name}: ${why}`);
}
function check(name, cond, why) {
  if (cond) ok(name);
  else bad(name, why || "assertion failed");
}

function clientFor(accessToken) {
  return createClient(URL, ANON, {
    global: { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Client with the session applied (required for realtime, which authenticates
// the websocket from the auth session rather than request headers).
function sessionClient(session) {
  const c = createClient(URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return c.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  }).then(() => c);
}

async function signIn(email) {
  const c = clientFor();
  const { data, error } = await c.auth.signInWithPassword({
    email,
    password: SEED_PASSWORD,
  });
  if (error) throw new Error(`sign in failed for ${email}: ${error.message}`);
  return { client: clientFor(data.session.access_token), user: data.user };
}

async function main() {
  if (!URL || !ANON || !DB) {
    console.error("Missing required env vars (NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, DB connection).");
    process.exit(1);
  }

  const pg = new Client({ connectionString: DB, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  // ---- Resolve seeded users ------------------------------------------------
  const usersRes = await pg.query("select u.id, u.email, u.role from public.users u order by u.email");
  const byEmail = new Map(usersRes.rows.map((r) => [r.email, r]));
  const mary = byEmail.get("mary@celebration.org");
  const coordinator = byEmail.get("coordinator@celebration.org");
  if (!mary || !coordinator) {
    console.error("Seed data missing — run npm run dev once (applies migrations) or npm run db:migrate.");
    process.exit(1);
  }
  const SEED_MEMBERS = [
    "mary@celebration.org",
    "john@celebration.org",
    "kemi@celebration.org",
    "ade@celebration.org",
    "tunde@celebration.org",
    "emeka@celebration.org",
    "ngozi@celebration.org",
    "sola@celebration.org",
  ];
  const seededMemberEmails = new Set(SEED_MEMBERS);
  const memberEmails = usersRes.rows
    .filter((r) => r.role === "member")
    .map((r) => r.email);

  // ---- Reset test data so the suite is repeatable --------------------------
  const ids = usersRes.rows.map((r) => r.id);
  await pg.query("delete from public.checkin_tokens where created_by = any($1::uuid[])", [ids]);
  await pg.query("delete from public.check_ins where user_id = any($1::uuid[]) or buddy_id = any($1::uuid[])", [ids]);
  await pg.query("delete from public.messages where sender_id = any($1::uuid[]) or receiver_id = any($1::uuid[])", [ids]);
  await pg.query("delete from public.points where user_id = any($1::uuid[])", [ids]);
  await pg.query("delete from public.mission_completions where user_id = any($1::uuid[])", [ids]);
  await pg.query("update public.users set last_active_at = null where id = any($1::uuid[])", [ids]);
  await pg.query("delete from auth.users where email like 'smoke-%@celebration.org'");

  console.log("\n== AUTH & ROLES ==");

  const coord = await signIn("coordinator@celebration.org");
  check("coordinator can sign in", coord.user.email === "coordinator@celebration.org");

  const maryClient = (await signIn("mary@celebration.org")).client;

  // ---- Pairings (FR-03) ----------------------------------------------------
  console.log("\n== PAIRINGS ==");

  const gen = await coord.client.rpc("generate_weekly_pairings");
  check("coordinator can generate pairings", !gen.error && Number(gen.data) > 0, gen.error?.message);

  const maryGen = await maryClient.rpc("generate_weekly_pairings");
  check("member cannot generate pairings", !!maryGen.error, "expected error");

  // Regenerate until mary's buddy is a seeded account (the project may contain
  // pre-existing members we don't have credentials for).
  let weekData = null;
  let buddyId = null;
  let pairId = null;
  for (let attempt = 0; attempt < 30; attempt++) {
    const wd = await maryClient.rpc("get_my_weekly_data");
    if (!wd.error && wd.data && wd.data.buddy && wd.data.buddy.id) {
      const bEmail = usersRes.rows.find((r) => r.id === wd.data.buddy.id)?.email;
      if (bEmail && seededMemberEmails.has(bEmail)) {
        weekData = wd.data;
        buddyId = wd.data.buddy.id;
        pairId = wd.data.pair && wd.data.pair.id;
        break;
      }
    }
    await coord.client.rpc("generate_weekly_pairings");
  }
  check("member weekly data loads", !!weekData, "could not load weekly data");
  const missionId = weekData && weekData.mission && weekData.mission.id;
  check("member has a buddy this week", !!buddyId, "no buddy in weekly data");
  check("member has a pair this week", !!pairId, "no pair in weekly data");

  const buddyEmail = usersRes.rows.find((r) => r.id === buddyId)?.email;
  check("buddy is a seeded member", !!buddyEmail, `unknown buddy id ${buddyId}`);
  const buddyClient = buddyEmail ? (await signIn(buddyEmail)).client : null;

  // ---- Messaging (FR-04 / FR-08) -------------------------------------------
  console.log("\n== MESSAGING ==");

  const send = await maryClient.rpc("send_message", { p_buddy_id: buddyId, p_message: "Hi! Checking in this week." });
  check("member can message their buddy", !send.error, send.error?.message);

  const nonBuddy = usersRes.rows.find((r) => r.role === "member" && r.id !== mary.id && r.id !== buddyId);
  if (nonBuddy) {
    const badSend = await maryClient.rpc("send_message", { p_buddy_id: nonBuddy.id, p_message: "hi" });
    check("cannot message a non-buddy", !!badSend.error, "expected error");
  }

  const messagesRes = await maryClient.from("messages").select("*");
  check("member reads only own conversations (RLS)",
    messagesRes.data.every((m) => m.sender_id === mary.id || m.receiver_id === mary.id),
    messagesRes.error?.message);

  // ---- Realtime chat (FR-04, live updates without reload) -------------------
  console.log("\n== REALTIME CHAT ==");

  const marySession = await clientFor().auth.signInWithPassword({
    email: "mary@celebration.org",
    password: SEED_PASSWORD,
  });
  const maryRt = await sessionClient(marySession.data.session);
  let rtReceived = false;
  const rtChannel = maryRt
    .channel("smoke-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `receiver_id=eq.${mary.id}`,
      },
      () => {
        rtReceived = true;
      }
    )
    .subscribe();
  await new Promise((r) => setTimeout(r, 2000));
  await buddyClient.rpc("send_message", {
    p_buddy_id: mary.id,
    p_message: "realtime smoke check",
  });
  const rtDeadline = Date.now() + 10000;
  while (!rtReceived && Date.now() < rtDeadline) {
    await new Promise((r) => setTimeout(r, 250));
  }
  check(
    "new message arrives via realtime (no reload)",
    rtReceived === true,
    "realtime INSERT event not received"
  );
  await maryRt.removeChannel(rtChannel);

  // ---- Weekly mission (FR-06) ----------------------------------------------
  console.log("\n== WEEKLY MISSION ==");

  const complete = await maryClient.rpc("complete_weekly_mission");
  check("member completes weekly mission", !complete.error, complete.error?.message);
  const mc = await pg.query(
    "select 1 from public.mission_completions where user_id = $1 and mission_id = $2",
    [mary.id, missionId]
  );
  check("mission_completions row written", mc.rowCount === 1);

  // ---- Check-in QR flow (FR-07) ---------------------------------------------
  console.log("\n== CHECK-IN (QR) ==");

  const token = await maryClient.rpc("create_checkin_token", { p_pair_id: pairId });
  check("member can create check-in token", !token.error && typeof token.data === "string", token.error?.message);

  const selfVerify = await maryClient.rpc("verify_checkin", { p_token: token.data });
  check("member cannot verify their own check-in", !!selfVerify.error, "expected error");

  const verify = await buddyClient.rpc("verify_checkin", { p_token: token.data });
  check("buddy can verify the check-in", !verify.error, verify.error?.message);

  const ciRes = await pg.query(
    "select count(*)::int as n from public.check_ins where pair_id = $1", [pairId]
  );
  check("two check_ins written (one per member)", ciRes.rows[0].n === 2, `got ${ciRes.rows[0].n}`);

  const again = await maryClient.rpc("create_checkin_token", { p_pair_id: pairId });
  check("cannot check in twice in one week", !!again.error, "expected 'already checked in' error");

  // ---- XP / leaderboard (FR-08 / FR-09) ------------------------------------
  console.log("\n== XP & LEADERBOARD ==");

  const xpRes = await maryClient.rpc("get_my_profile");
  const xp = xpRes.data && xpRes.data.xp;
  check("member has XP after activity", !xpRes.error && Number(xp) > 0, xpRes.error?.message);

  const lb = await maryClient.rpc("get_leaderboard", { p_limit: 50 });
  check("leaderboard returns rows", !lb.error && Array.isArray(lb.data) && lb.data.length > 0, lb.error?.message);

  // ---- Coordinator dashboard (FR-12 / FR-13) -------------------------------
  console.log("\n== COORDINATOR DASHBOARD ==");

  const overview = await coord.client.rpc("get_engagement_overview");
  check("coordinator sees engagement overview", !overview.error && overview.data, overview.error?.message);
  check("overview has member count",
    Number(overview.data && overview.data.total_members) >= 9,
    "expected >= 9 members");

  const memberOverview = await maryClient.rpc("get_engagement_overview");
  check("member cannot read engagement overview", !!memberOverview.error, "expected error");

  const followup = await coord.client.rpc("get_needs_followup", { p_days: 7 });
  const followupList = followup.data || [];
  check("needs-follow-up list loads", !followup.error && Array.isArray(followupList), followup.error?.message);
  check("inactive members flagged for follow-up",
    followupList.some((m) => m.member_id === byEmail.get("ngozi@celebration.org").id),
    "ngozi (never active) should be in the list");

  const detail = await coord.client.rpc("get_member_detail", { p_user_id: mary.id });
  check("coordinator sees member detail", !detail.error && detail.data && detail.data.member, detail.error?.message);

  const detailDenied = await maryClient.rpc("get_member_detail", { p_user_id: mary.id });
  check("member cannot read member detail (coordinator-only)", !!detailDenied.error, "expected error");

  // ---- Follow-up action (FR-13) --------------------------------------------
  console.log("\n== FOLLOW-UP ==");

  const ngoziId = byEmail.get("ngozi@celebration.org").id;
  const follow = await coord.client.rpc("mark_followed_up", { p_user_id: ngoziId });
  check("coordinator can mark followed up", !follow.error, follow.error?.message);

  const la = await pg.query("select last_active_at from public.users where id = $1", [ngoziId]);
  check("follow-up updates last_active_at", la.rows[0].last_active_at != null);

  const followDenied = await maryClient.rpc("mark_followed_up", { p_user_id: ngoziId });
  check("member cannot mark followed up", !!followDenied.error, "expected error");

  // ---- Signup trigger (handle_new_user) ------------------------------------
  console.log("\n== SIGNUP TRIGGER ==");

  const signupEmail = `smoke-${Date.now()}@celebration.org`;
  const sc = clientFor();
  const { error: suErr } = await sc.auth.signUp({
    email: signupEmail,
    password: SEED_PASSWORD,
    options: { data: { name: "Smoke Tester" } },
  });
  check("signup succeeds via Auth API", !suErr, suErr?.message);
  await new Promise((r) => setTimeout(r, 1500));
  const sr = await pg.query("select name from public.users where email = $1", [signupEmail]);
  check("signup trigger creates public.users row", sr.rowCount === 1 && sr.rows[0].name === "Smoke Tester");

  // ---- Scheduling (pg_cron) -------------------------------------------------
  console.log("\n== SCHEDULING ==");

  const cron = await pg.query("select jobname from cron.job where jobname = 'weekly-pairings'");
  check("pg_cron job registered", cron.rowCount >= 1, "job missing");

  // ---- Pairing schedule (FR-03 admin) ---------------------------------------
  console.log("\n== PAIRING SCHEDULE ==");

  const sched = await coord.client.rpc("get_pairing_schedule");
  check(
    "coordinator can read pairing schedule",
    !sched.error && sched.data && sched.data.enabled === true,
    sched.error?.message ?? "no schedule data"
  );

  const setSched = await coord.client.rpc("set_pairing_schedule", { p_weekday: 3, p_time: "03:30" });
  check(
    "coordinator can change pairing schedule",
    !setSched.error && setSched.data && setSched.data.weekday === 3 && setSched.data.time === "03:30",
    setSched.error?.message ?? "schedule not updated"
  );

  const schedDenied = await maryClient.rpc("get_pairing_schedule");
  check("member cannot read pairing schedule", !!schedDenied.error, "expected error");

  await coord.client.rpc("set_pairing_schedule", { p_weekday: 2, p_time: "02:00" });

  // ---- Membership views summary --------------------------------------------
  console.log("\n== SUMMARY ==");
  console.log(`  members: ${memberEmails.length}, coordinator: ${coordinator.email}`);

  await pg.end();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("\nSMOKE TEST CRASHED:", e.message);
  process.exit(1);
});
