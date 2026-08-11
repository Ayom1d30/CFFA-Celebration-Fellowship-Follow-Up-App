# CFFA — Database Schema

PostgreSQL schema for Supabase. All tables use the `public` schema. Row Level Security (RLS) is enabled on every table. Timestamps default to `now()`.

## Tables

### `users`

Extends Supabase Auth. The auth user row is `auth.users`; `public.users` is created by a trigger on sign-up.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | references `auth.users.id` |
| name | text NOT NULL | display name |
| email | text NOT NULL UNIQUE | |
| avatar | text | URL to avatar image |
| team | text | team/house id (P2) |
| role | text NOT NULL DEFAULT 'member' | `member` or `coordinator` |
| last_active_at | timestamptz | updated on engagement actions |
| created_at | timestamptz NOT NULL DEFAULT now() | |

### `teams` (P2)

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| name | text NOT NULL | e.g. Team Grace |
| color | text | accent for team UI |
| created_at | timestamptz DEFAULT now() | |

### `buddy_pairs`

One reciprocal row per member, per week. Storing both directions makes each member's view a simple query.

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid FK users | the member |
| buddy_id | uuid FK users | assigned buddy |
| week | date NOT NULL | start-of-week date |
| status | text NOT NULL DEFAULT 'pending' | `pending`, `contacted`, `completed` |
| completed_at | timestamptz | when check-in completed |
| created_at | timestamptz DEFAULT now() |

Index: `(user_id, week)`, `(week)`.

### `pairing_history`

Tracks who has been paired with whom to avoid repeat pairings (FR-03).

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_a | uuid FK users | lower id first |
| user_b | uuid FK users | higher id second |
| week | date NOT NULL | |
| created_at | timestamptz DEFAULT now() |

Index: `(user_a, user_b)`.

### `messages`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| sender_id | uuid FK users | |
| receiver_id | uuid FK users | |
| message | text NOT NULL | |
| is_quick | boolean DEFAULT false | sent via quick message |
| created_at | timestamptz DEFAULT now() | timestamp |

Index: `(sender_id, receiver_id, created_at)`.

### `check_ins`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid FK users | |
| buddy_id | uuid FK users | |
| pair_id | uuid FK buddy_pairs | ties to the week |
| date | date NOT NULL | |
| verified | boolean DEFAULT true | set by QR verification |
| created_at | timestamptz DEFAULT now() |

Index: `(user_id, date)`, `(pair_id)`. Unique `(pair_id, user_id)` prevents duplicate check-ins.

### `checkin_tokens`

Short-lived QR verification tokens (FR-07).

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| pair_id | uuid FK buddy_pairs | |
| token | text NOT NULL UNIQUE | opaque nonce embedded in QR |
| created_by | uuid FK users | |
| expires_at | timestamptz NOT NULL | short expiry (e.g. 5 min) |
| used_at | timestamptz | set on successful scan |

### `points`

XP ledger — one row per engagement action (FR-08).

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid FK users | |
| action | text NOT NULL | from the XP action table below |
| points | int NOT NULL | |
| created_at | timestamptz DEFAULT now() |

Index: `(user_id, created_at)`. XP is derived via `SUM(points)`.

### `weekly_missions`

One mission per week, shown to all members (FR-06).

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| title | text NOT NULL | e.g. "Check in with your buddy" |
| description | text | |
| xp_reward | int NOT NULL DEFAULT 10 | |
| week | date NOT NULL UNIQUE | |
| created_at | timestamptz DEFAULT now() |

### `mission_completions`

| Column | Type | Notes |
| --- | --- | --- |
| id | uuid PK | |
| user_id | uuid FK users | |
| mission_id | uuid FK weekly_missions | |
| completed_at | timestamptz DEFAULT now() |

Unique `(user_id, mission_id)`.

## XP Action Table

| Action | Points |
| --- | --- |
| `message` | 5 |
| `weekly_followup` | 10 |
| `checkin` | 15 |
| `attendance` | 10 |
| `encourage` | 5 |
| `special_mission` | 20 |

## Row Level Security (RLS)

Policy model — every table has RLS enabled. Default policies:

- **users**: authenticated users can read all users (buddy lookup) but only update their own row.
- **buddy_pairs**: user can read/write rows where `user_id = auth.uid()`.
- **pairing_history**: authenticated users can read (used to avoid repeats via the pairing function).
- **messages**: users can read conversations they belong to; insert where `sender_id = auth.uid()`.
- **check_ins**: users can read own rows; verified inserts require a valid token (server function).
- **checkin_tokens**: created by the issuing user; verified via the server function only.
- **points**: users read own rows; inserts via server function only.
- **weekly_missions**: authenticated users can read.
- **mission_completions**: users can read own; insert own.
- **coordinator-only reads** (admin dashboard): policies check `users.role = 'coordinator'` via a helper `is_coordinator()`.

> Migration SQL lives in `supabase/migrations/` and must be applied before deploying the app.
