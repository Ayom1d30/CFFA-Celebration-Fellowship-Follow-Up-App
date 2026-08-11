# CFFA — Design System

Source of truth: the CFFA PNG mockups (`Design/mobile-home.png`, `Design/desktop-dashboard.png`) and the textual design specification. These are **visual references**, not assets to display inside the app. Recreate the interface with HTML/React/Tailwind components — never render the mockup images in the UI.

## Design Language

CFFA is a modern, friendly fellowship/community application — not an enterprise admin dashboard.

- Clean, spacious interface
- Soft rounded cards
- Purple as the primary brand/accent color
- White/light neutral surfaces
- Dark charcoal text
- Subtle borders and shadows
- Large readable headings
- Friendly but not childish
- Minimal visual clutter
- Clear hierarchy
- Strong use of cards to group related information
- Rounded buttons and interactive elements
- Consistent spacing throughout

The product should feel **warm, trustworthy, modern, and approachable**.

## Color Direction

Purple is used for: primary buttons, active navigation, important indicators, progress/accent elements, selected states. Neutrals dominate backgrounds and card surfaces. Avoid making the entire interface purple.

| Token | Value | Usage |
| --- | --- | --- |
| `primary` | Purple (Tailwind `violet`-based, e.g. `#7C3AED`) | Primary buttons, active nav, accents, progress |
| `primary-soft` | Light violet (e.g. `#EDE9FE`) | Selected backgrounds, badges, active nav background |
| `surface` | White (`#FFFFFF`) | Cards |
| `background` | Light neutral (`#F8F7FC`) | Page background |
| `text-primary` | Dark charcoal (`#1F2937`) | Headings/body |
| `text-muted` | Gray (`#6B7280`) | Secondary text, timestamps |
| `border` | Subtle gray (`#E5E7EB`) | Card/border strokes |
| `success` | Green | Online status, completed, check-in verified |
| `warning` | Amber | Needs attention, streak warnings |

> Exact hex values are centralized in Tailwind theme tokens; adjust once confirmed against Figma.

## Typography

- Default Tailwind font stack (system fonts) — fast and readable.
- Headings: large, bold, generous line-height.
- Greeting on home: prominent but not oversized.

## Spacing & Radius

- Consistent spacing scale (Tailwind defaults: `p-4`, `gap-3`, etc.).
- Cards: `rounded-2xl` soft corners, subtle `shadow-sm` or `border`.
- Buttons/inputs: `rounded-full` for primary CTA feel.
- Bottom nav safe-area padding on mobile.

## Component System

Reusable components (accept props/data, never hardcoded content):

| Component | Notes |
| --- | --- |
| `Button` | Variants: primary (purple), secondary (soft), ghost, danger; sizes |
| `Card` | Rounded surface container |
| `Avatar` | Image or initials fallback; sizes; online dot |
| `Badge` | Status/role chips (e.g. Active, Needs follow-up) |
| `ProgressBar` | Purple fill for weekly progress |
| `MissionCard` | Mission title, description, XP reward, completion state |
| `BuddyCard` | Buddy avatar, name, status, follow-up prompt, Message action |
| `MessageBubble` | Sent/received bubbles, timestamps |
| `BottomNavigation` | Mobile: Home, Chat, Missions, Profile; active = purple |
| `Sidebar` | Desktop: logo + Home, Buddy, Chat, Missions, Leaderboard, Profile, Settings; active = purple accent + soft bg |
| `Header` | Page greeting/title |
| `Modal` | For QR, confirmations |
| `Input` | Form fields |
| `LeaderboardRow` | Rank, avatar, name, XP |
| `StatCard` | Coordinator dashboard metric |

## Screens

| Screen | Key elements |
| --- | --- |
| Splash | Logo, app name, fellowship identity |
| Onboarding | What CFFA does, buddy system, engagement |
| Login | Email, password, sign-in |
| Sign Up | Name, email, password |
| Home/Dashboard | Buddy, weekly mission, XP, streak, progress |
| Buddy | Buddy profile, status, contact action |
| Chat | Messages, quick conversation starters |
| Mission | Weekly mission, completion state, XP reward |
| QR Check-in | Generate/scan temporary QR |
| Leaderboard | Rank, XP, individual/team |
| Profile | Avatar, XP, streak, history |
| Notifications | Buddy/mission reminders (P1/P2) |
| Coordinator Dashboard | Active members, engagement, needs-follow-up |
| Member Details | Member activity, buddy status, last interaction |

## Mobile Home Hierarchy

Screen communicates in this order:

1. Greeting — "Good morning 👋"
2. Current buddy — prominent BuddyCard (avatar, name, status, follow-up prompt, `[Message Tomi →]`)
3. Buddy interaction status
4. Weekly progress — progress toward goal, XP, streak, at-a-glance
5. Weekly mission — actionable card with "+10 XP"
6. Bottom navigation

> Core question the UI must answer instantly: **"Who am I supposed to follow up with this week?"**

## Desktop Member Dashboard

- Left sidebar (logo, Home, Buddy, Chat, Missions, Leaderboard, Profile, Settings) with purple active state.
- Greeting: "Good morning, Ayo 👋"
- Responsive grid of cards: Buddy Card, Weekly Progress Card (progress bar, current XP, weekly progress, streak), Weekly Mission Card.
- More information-dense than mobile, never cluttered.

## Responsive Behavior

The desktop and mobile screens are the **same product**, not separate designs.

- **Mobile:** single column, bottom nav, full-width cards, large touch targets, reduced density, thumb-accessible actions.
- **Tablet:** transitional; cards may go two columns; nav adapts to width.
- **Desktop:** sidebar nav, multi-column dashboard, more info visible, larger spacing, more detailed admin views.

Do not scale mobile up or shrink desktop down — use real responsive layout changes.

## Priority When Uncertain

1. PRD requirements
2. This design specification
3. Mobile usability
4. Consistency between mobile and desktop
5. Simplicity
