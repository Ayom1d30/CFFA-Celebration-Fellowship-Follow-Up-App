# CFFA — Celebration Fellowship Follow-up App

Mobile-first PWA that makes fellowship follow-up everyone's responsibility. CFFA assigns members a weekly Follow-Up Buddy, gives them simple tools and missions to stay connected, verifies meaningful interactions, rewards engagement with XP, and gives coordinators visibility into members who may need additional follow-up.

> MVP in one sentence: **CFFA assigns fellowship members a weekly buddy, gives them simple tools and missions to stay connected, verifies meaningful interactions, rewards engagement, and gives coordinators visibility into members who may need additional follow-up.**

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Hosting | Vercel |
| PWA | Web app manifest + service worker (offline shell) |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in values once a Supabase project exists:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Lint |
| `npm run typecheck` | TypeScript type check |

## Project Structure

```
.
├── app/                  # Next.js App Router routes
│   ├── (marketing)/      # Splash, onboarding, login, sign up
│   ├── (app)/            # Authenticated member screens
│   └── admin/            # Coordinator screens
├── components/           # Reusable UI components
├── lib/                  # Supabase client, types, data access
├── supabase/
│   └── migrations/       # Database schema SQL
├── docs/                 # Project documentation
└── Design/               # Mockup references (visual references only)
```

## Documentation

| Doc | Contents |
| --- | --- |
| [01-prd.md](docs/01-prd.md) | Product Requirement Document |
| [02-architecture.md](docs/02-architecture.md) | System architecture & flows |
| [03-database-schema.md](docs/03-database-schema.md) | Data model & RLS |
| [04-api-spec.md](docs/04-api-spec.md) | Functions/API specification |
| [05-design-system.md](docs/05-design-system.md) | Visual design system |
| [06-roadmap.md](docs/06-roadmap.md) | P0/P1/P2 roadmap & timeline |
