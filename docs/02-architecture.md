# CFFA — Architecture

## Overview

CFFA is a mobile-first PWA built with Next.js (App Router), TypeScript, and Tailwind CSS, backed by Supabase (PostgreSQL, Auth, Realtime, Storage) and deployed on Vercel.

```
┌─────────────────────────────┐
│        Browser / PWA        │
│  Next.js App Router (SSR)   │
│  + Tailwind + PWA (SW)      │
└──────────────┬──────────────┘
               │ HTTPS (Vercel)
┌──────────────▼──────────────┐
│           Supabase          │
│  ┌─────────┬─────────┬────┐ │
│  │  Auth   │ Postgres│RLS │ │
│  ├─────────┼─────────┴────┤ │
│  │Realtime │   Storage    │ │
│  └─────────┴──────────────┘ │
└─────────────────────────────┘
```

## Key Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Rendering | App Router with server components | Fast loads, SEO for splash/onboarding |
| State/data | Supabase client (supabase-js) with RLS | Auth + DB in one service, secure by default |
| PWA | Manual manifest + lightweight service worker | Dependency-light; installable, offline shell |
| Styling | Tailwind CSS | Utility-first, matches design system tokens |
| Auth | Supabase Auth (email + password) | Handles sessions, JWT, refresh automatically |

## Project Structure

```
app/
├── (marketing)/
│   ├── page.tsx            # Splash (CFFA branding)
│   ├── onboarding/page.tsx # What CFFA does
│   ├── login/page.tsx      # Sign in
│   └── signup/page.tsx     # New member registration
├── (app)/
│   ├── layout.tsx          # Auth guard + nav shell (BottomNav / Sidebar)
│   ├── home/page.tsx       # Buddy, mission, XP, streak, progress
│   ├── buddy/page.tsx      # Assigned buddy details + contact action
│   ├── chat/[id]/page.tsx  # Conversation + quick messages
│   ├── missions/page.tsx   # Weekly mission + completion state
│   ├── checkin/page.tsx    # Generate/scan temporary QR
│   ├── leaderboard/page.tsx# Rank, XP
│   └── profile/page.tsx    # Avatar, XP, streak, history
├── admin/
│   ├── layout.tsx          # Coordinator guard + admin shell
│   ├── page.tsx            # Engagement overview + needs-follow-up
│   └── members/[id]/page.tsx # Member detail
├── layout.tsx              # Root layout, manifest, SW registration
```

```
components/
├── ui/                     # Button, Card, Avatar, Badge, Input, Modal, ProgressBar
├── member/                 # BuddyCard, MissionCard, MessageBubble, LeaderboardRow, QuickMessages
├── layout/                 # BottomNavigation, Sidebar, Header
└── admin/                  # StatCard, NeedsFollowUpTable
```

```
lib/
├── supabase/
│   ├── client.ts           # Browser client
│   └── server.ts           # Server client (route handlers / server components)
├── constants.ts            # App constants (XP table, nav items, teams)
└── types.ts                # Shared TypeScript types mirroring the DB schema
```

```
supabase/
└── migrations/             # SQL schema + RLS + functions
```

## Authentication Flow

1. Member signs up via `/signup` → Supabase Auth creates a user → `public.users` row created via trigger.
2. Server components call `createServerClient` (cookie-based) to read the session.
3. The `(app)` and `admin` layouts check session server-side; unauthenticated users redirect to `/login`.
4. Coordinators are detected via `users.role = 'coordinator'`.

## Weekly Pairing Flow

1. A scheduled job (Supabase scheduled function or cron) runs each Tuesday.
2. It gathers active members, shuffles, and pairs them while consulting `pairing_history` to avoid repeated pairings.
3. Rows are inserted into `buddy_pairs` (reciprocal rows per member).
4. Members see their buddy on Home and get a notification (MVP: in-app banner; push is P2).

## QR Check-In Flow (MVP)

1. Member A taps "Check in with buddy" → server function creates a short-lived token + QR payload.
2. Member B scans the QR (in-app camera or copy code) → the code includes the pair id + a nonce.
3. The verify function validates: token not expired, pair matches, both members involved, no duplicate check-in this week.
4. On success, both members receive +XP and confirmation.

See [04-api-spec.md](04-api-spec.md) for the function signatures.

## PWA

- `app/manifest.ts` produces the web app manifest (name, icons, theme_color = purple, standalone display) served at `/manifest.webmanifest`.
- `public/sw.js` is a minimal service worker that caches the app shell and serves an offline fallback.
- Registration happens in the root layout via `registerSW()` (deferred, production only).
- Full push notifications are **P2** per the PRD.

## Hosting / Deploy

- Vercel connects to the repo; `npm run build` runs on deploy.
- Supabase project holds DB + auth; migrations applied via the Supabase CLI or SQL editor.
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see README).

## Security

- **RLS enforced** on all tables (see [03-database-schema.md](03-database-schema.md)).
- Anonymous API key is safe because RLS restricts row access to the authenticated user.
- Server-side auth checks in layouts; never trust client-only checks for authorization.
- No secrets in the client bundle (only the anon key is public).
