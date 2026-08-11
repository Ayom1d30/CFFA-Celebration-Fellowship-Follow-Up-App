# CFFA — Roadmap

Tracks the 4-week MVP and the P0/P1/P2 backlog from the PRD.

## MVP Principle

> If a feature does not directly contribute to follow-up, engagement, accountability, or coordinator visibility, it probably does not belong in V1.

## MVP Scope

### P0 — Must Have

- [ ] Member
  - [ ] Authentication (FR-01)
  - [ ] Member profile (FR-02)
  - [ ] Weekly buddy assignment (FR-03)
  - [ ] Buddy dashboard (FR-11)
  - [ ] Basic messaging (FR-04)
  - [ ] Weekly mission (FR-06)
  - [ ] QR buddy check-in (FR-07)
  - [ ] XP system (FR-08)
- [ ] Admin
  - [ ] Admin authentication
  - [ ] Member list
  - [ ] Fellowship engagement overview (FR-12)
  - [ ] Needs-follow-up list (FR-13)

### P1 — Should Have

- [ ] Quick messages (FR-05)
- [ ] Individual leaderboard (FR-09)
- [ ] Streaks
- [ ] Basic engagement analytics
- [ ] Improved notifications
- [ ] Character progression

### P2 — Future

- [ ] Team/houses system (FR-10)
- [ ] Team leaderboard
- [ ] Character customization
- [ ] NFC check-in
- [ ] Advanced analytics
- [ ] Push notifications
- [ ] More sophisticated engagement missions

## 4-Week Launch Plan

| Phase | Window | Work |
| --- | --- | --- |
| Research | Days 1–3 | Interview 5–10 members; speak with leadership; document existing follow-up process; validate weekly buddy concept |
| Prototype | Days 4–7 | Figma prototype (all screens in design system); usability testing with members |
| MVP Development | Weeks 2–3 | Auth, database, pairing, messaging, weekly missions, QR verification, XP, admin dashboard |
| Pilot | Week 4 | Launch to a controlled group; monitor weekly active members, buddy completion, message activity, check-ins, needs-follow-up, feedback |
| Iteration | After pilot | Identify friction; review data; interview users; prioritize; release next iteration |

## Build Sequence (Suggested)

1. **Foundation** — Next.js scaffold, PWA shell, Supabase client, DB migrations, design tokens.
2. **Auth** — login/signup/onboarding, profile, auth guards.
3. **Member core** — home dashboard, buddy card, weekly mission, messaging + quick messages.
4. **Engagement** — XP system, streaks, progress, leaderboard.
5. **Check-in** — QR token create/verify functions + screens.
6. **Coordinator** — admin guard, engagement overview, needs-follow-up, member detail.

## Definition of Done (per feature)

- [ ] Code merged and builds (`npm run build`)
- [ ] Lint + typecheck pass
- [ ] Works on mobile viewport and desktop
- [ ] RLS/auth verified (no data leak between members)
- [ ] Follows design system components
