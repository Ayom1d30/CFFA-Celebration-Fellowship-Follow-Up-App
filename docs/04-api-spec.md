# CFFA — API / Functions Specification

CFFA uses Supabase as its backend. Sensitive logic (pairing, XP, QR verification) lives in **Postgres functions** called via RPC so it cannot be tampered with from the client. Realtime subscriptions deliver new messages.

## Conventions

- All functions are `SECURITY DEFINER` so they can enforce their own authorization.
- Client never writes directly to `points`, `check_ins`, `checkin_tokens`, or `pairing_history` — only through functions.
- Error conditions are returned as `raises` with friendly messages mapped in the client.

## Authentication & Profile

### `sign_up(p_name, p_email, p_password)`

Creates a Supabase Auth user and inserts `public.users` via trigger.

### `get_profile()`

Returns the calling user's `users` row (name, avatar, team, role).

## Pairing (FR-03)

### `generate_weekly_pairings(p_week date)`

Called weekly (scheduled job / cron on Tuesday). Coordinator-gated.

1. Fetch active members (role = `member`, not soft-removed).
2. Shuffle members deterministically per week.
3. Build pairs while avoiding pairs already present in `pairing_history` for recent weeks (fall back to reshuffling when unavoidable, e.g. odd numbers → last member paired with a coordinator or left unpaired with a flag).
4. Insert reciprocal `buddy_pairs` rows.
5. Insert `pairing_history` rows.
6. Returns count of pairs created.

> Odd-member edge case handled here; the unpaired member is flagged `needs_pair = true` for coordinator attention.

### `get_my_buddy()`

Returns the current week's `buddy_pairs` row + buddy `users` row for `auth.uid()`.

## Messaging (FR-04)

### `send_message(p_buddy_id uuid, p_message text, p_is_quick boolean default false)`

Validates `p_message` non-empty, buddy is active, then inserts a `messages` row and grants XP via `award_xp` (message action, at most once per conversation per week).

### Realtime

`messages` table has Realtime enabled; the chat screen subscribes to `sender_id`/`receiver_id` rows for the conversation.

## Quick Messages (FR-05)

Client-side only — constants list of suggested messages:

```
"How's your week going?"
"Are you coming this week?"
"Need prayer?"
"See you Tuesday👋"
```

Sent via `send_message` with `is_quick = true`.

## Weekly Mission (FR-06)

### `get_weekly_mission()`

Returns `weekly_missions` row for the current week plus the caller's `mission_completions` status.

### `complete_weekly_mission()`

Marks the mission complete (idempotent) and awards `weekly_followup` XP.

## QR Check-In (FR-07)

### `create_checkin_token(p_pair_id uuid)`

1. Validates the pair belongs to `auth.uid()`.
2. Rejects if a completed check-in already exists for this pair/week.
3. Inserts a `checkin_tokens` row with `expires_at = now() + interval '5 minutes'`.
4. Returns `{ token }` — encoded into the QR payload.

### `verify_checkin(p_token text, p_verifier_id uuid default auth.uid())`

Called by the scanning member (Member B).

1. Looks up the token; rejects if missing, expired, or already used.
2. Validates the verifier is the pair's buddy (`buddy_pairs.buddy_id = auth.uid()`).
3. Marks token used, inserts `check_ins` rows for both members.
4. Updates both `buddy_pairs` rows to `status = 'completed'`.
5. Awards `checkin` XP to both members.

Edge cases handled: expired QR, wrong person scans, duplicate attempt, buddy never opened app (token simply expires), poor connection (retry is safe because used tokens are idempotent).

## XP (FR-08)

### `award_xp(p_user uuid, p_action text, p_points int)`

Internal `SECURITY DEFINER` helper — inserts into `points`. Public surface is the specific action functions, each guarding against farming (per-action/week dedupe where the PRD calls for it).

### `get_my_xp()`

Returns total XP + current streak.

## Leaderboard (FR-09)

### `get_leaderboard(p_limit int default 50)`

Returns users ordered by total XP with rank. Teams variant (`get_team_leaderboard`) is P2.

## Coordinator Dashboard (FR-12, FR-13)

### `get_engagement_overview()`

Returns the aggregate for the coordinator dashboard:

| Metric | Source |
| --- | --- |
| Total members | count of `users` |
| Active this week | users with activity in last 7 days |
| Buddy check-ins | `check_ins` in current week |
| Needs follow-up | users inactive ≥ N days (threshold configurable, default 7) |

### `get_needs_followup(p_days int default 7)`

Returns members whose `last_active_at` is older than `p_days`, with their assigned buddy:

```
member name | last activity | assigned buddy
```

### `get_member_detail(p_user_id uuid)`

Coordinator-only: member profile, XP, recent activity, current buddy, buddy status, last interaction.
