# CFFA — Product Requirement Document

- **Product:** CFFA (Celebration Fellowship Follow-up App)
- **Platform:** Mobile-first responsive web app / PWA
- **Primary Users:** Celebration Fellowship members
- **Secondary Users:** Fellowship coordinators
- **Timeline:** 4-week MVP
- **Product Owner:** Finance Vice President / Product Lead
- **Status:** MVP Planning

## 1. Product Overview

### 1.1 Product Summary

CFFA (Celebration Fellowship Follow-up App) is a mobile-first fellowship engagement platform designed to make member follow-up a shared responsibility rather than a task concentrated on one or two people.

The app organizes members into weekly Follow-Up Buddy pairings, allowing members to communicate, complete weekly missions, verify in-person interactions, and earn engagement points.

For fellowship coordinators, CFFA provides a lightweight dashboard showing overall engagement and identifying members who may require additional attention.

The product is not intended to replace personal relationships or human follow-up. Instead, it handles the repetitive coordination involved in follow-up and gives fellowship leaders visibility into who may need support.

### 1.2 Product Vision

Make fellowship follow-up everyone's responsibility.

CFFA should help transform follow-up from an administrative responsibility into an opportunity for fellowship members to build genuine relationships with one another.

### 1.3 Core Value Proposition

**For members:** "I always know who I should check in on and have simple ways to stay connected."

**For coordinators:** "I can quickly see who is engaged and who may need attention without manually following up with everyone."

## 2. Problem Statement

### 2.1 Current Problem

Follow-up within the fellowship is too dependent on a small number of people.

The original problem may appear to be "VP Communications has to follow up with members." However, the deeper product problem is: **member engagement and follow-up depends too heavily on one person or a small group of people.**

This creates several challenges:

- Follow-up becomes difficult as the number of members increases.
- Members may be unintentionally overlooked.
- The person responsible for follow-up carries an unnecessary administrative burden.
- Members may not have a clear reason or structure for checking in with one another.
- Coordinators may only discover that someone has become disengaged after a significant period of inactivity.

### 2.2 Opportunity

Instead of asking "How can VP Communications follow up with everyone?" CFFA asks: **"How can the fellowship distribute follow-up responsibility across its members while giving coordinators visibility into engagement?"**

## 3. Target Users

### 3.1 Primary User — Fellowship Member

A member who participates in Celebration Fellowship and wants to remain connected to other members.

**Needs**

- Know who they should check in with.
- Have an easy way to contact their buddy.
- Know what they are expected to do each week.
- Receive motivation to participate.
- Have a simple way to verify their interaction.

**Pain Points**

- May not know who to reach out to.
- May forget to follow up.
- May feel awkward starting a conversation.
- May only interact with people they already know.
- May lose connection with the fellowship when they become less active.

### 3.2 Secondary User — Fellowship Coordinator

A coordinator or leader responsible for understanding member engagement.

**Needs**

- See overall fellowship engagement.
- Identify members who may need follow-up.
- Know whether the buddy system is functioning.
- Reduce manual tracking.

**Pain Points**

- Manually checking on many members.
- Difficulty identifying who has become inactive.
- Limited visibility into whether follow-up actually happened.
- Follow-up responsibility becoming concentrated on a few leaders.

## 4. User Research / Evidence

The initial product hypothesis comes from an observed organizational problem within Celebration Fellowship: follow-up is currently a responsibility that can fall disproportionately on a small number of people.

### 4.1 Research Plan

Before finalizing the MVP, conduct interviews with approximately 5–10 fellowship members and relevant coordinators.

**Research Questions**

- How does follow-up currently happen?
- What makes following up difficult?
- Have members previously been responsible for checking on someone?
- What usually happens when someone stops attending?
- Would members be comfortable being paired with another member?
- What would make members actually use CFFA?
- What would make the buddy system feel helpful rather than forced?
- What information would coordinators actually need?

## 5. Goals & Success Metrics

### 5.1 Product Goals

1. **Distribute Follow-Up Responsibility** — Reduce manual follow-up from leaders by giving members clear weekly responsibility.
2. **Increase Member Engagement** — Create more opportunities for members to communicate and interact outside their existing circles.
3. **Improve Coordinator Visibility** — Give coordinators a simple overview of engagement and identify members needing attention.
4. **Encourage Consistent Participation** — Use lightweight gamification and weekly missions.

### 5.2 Success Metrics

**Primary Metrics**

- Weekly Active Members — percentage of registered members who interact with CFFA during a given week.
- Buddy Pairing Completion Rate — percentage of members who successfully complete their weekly buddy interaction.
- Buddy Contact Rate — percentage of members who report/verify they contacted their assigned buddy.
- Previously Inactive Members Re-engaged — number/percentage of previously inactive members who return to meaningful engagement.

**Secondary Metrics**

- Fellowship attendance
- Weekly mission completion rate
- Buddy check-in completion rate
- Average interactions per member
- 7-day retention
- 30-day retention

**Long-Term Success Metric**

The percentage of fellowship members receiving consistent follow-up before vs. after CFFA.

## 6. Non-Goals

CFFA will not attempt to become a complete social network or fellowship management platform. The MVP will **not** include:

- Full social networking
- Public member profiles
- Photo sharing
- Voice/video calls
- Complex character marketplace
- Advanced notification infrastructure
- NFC infrastructure
- Movie-style or entertainment features
- Complex attendance management

## 7. User Stories

### 7.1 Member Stories

- **Account** — As a fellowship member, I want to create an account so that I can participate in CFFA.
- **Weekly Buddy** — As a fellowship member, I want to see my assigned buddy so that I know who I should check in on this week.
- **Communication** — As a fellowship member, I want to message my buddy so that I can easily start a conversation.
- **Quick Messages** — As a fellowship member, I want suggested messages so that I don't have to think of what to say:
  - "How's your week going?"
  - "Are you coming this week?"
  - "Need prayer?"
  - "See you Tuesday👋"
- **Weekly Mission** — As a fellowship member, I want to receive a weekly mission so that I have a simple action I can complete.
- **Buddy Check-In** — As a fellowship member, I want to verify that I met my buddy so that our interaction can be recorded.
- **Gamification** — As a fellowship member, I want to earn XP for meaningful engagement so that I feel motivated.
- **Leaderboard** — As a fellowship member, I want to see my ranking so that I can track engagement.

### 7.2 Coordinator Stories

- As a coordinator, I want to see fellowship engagement so that I understand how members are participating.
- As a coordinator, I want to see members who may need follow-up so that I can personally reach out when necessary.
- As a coordinator, I want to see buddy completion rates so that I know whether the follow-up system is working.

## 8. User Flows

### 8.1 New Member Flow

Open CFFA → Create Account → Complete Profile → Join Celebration Fellowship → View Home Dashboard → Receive Weekly Buddy → Contact Buddy

### 8.2 Weekly Buddy Flow

Tuesday → System generates weekly pairings and notifies members → Member opens CFFA → Sees assigned buddy → Messages buddy → Completes weekly mission → Meets/interacts with buddy (optional) → Buddy Check-In → +XP → Progress updated

> The pairing system should use previous pairing history to avoid repeatedly assigning the same people to one another.

### 8.3 Buddy Check-In at Fellowship Flow

Member A → Selects "Check in with buddy" → Temporary QR generated → Member B scans QR → System verifies interaction → Both users receive confirmation → XP awarded

> QR is preferred for the MVP because it reduces device compatibility and implementation complexity. NFC can be considered for a future version.

### 8.4 Coordinator Flow

Coordinator Login → Dashboard → View Fellowship Overview → View Engagement → View "Needs Follow-Up" → Identify Member → Personally Follow Up

> The goal is for CFFA to identify who might need human attention, rather than attempting to replace human follow-up.

## 9. Functional Requirements

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-01 | Authentication — securely log in members and authorized coordinators | P0 |
| FR-02 | Member Profile — view basic account information | P0 |
| FR-03 | Weekly Buddy Assignment — auto-assign a buddy each week; store pairing history; avoid repeated pairings; show current buddy | P0 |
| FR-04 | Buddy Messaging — send text, view conversation history, show timestamps | P0 |
| FR-05 | Quick Messages — suggested messages to initiate conversations | P1 |
| FR-06 | Weekly Missions — display a weekly mission (meet buddy, learn something new, encourage someone, pray for someone, invite someone) | P0 |
| FR-07 | Buddy Check-In — verify in-person interaction via temporary QR | P0 |
| FR-08 | XP System — award XP for defined engagement actions | P0 |
| FR-09 | Individual Leaderboard | P1 |
| FR-10 | Team Leaderboard (Team Grace, Faith, Living Water, Light) | P2 |
| FR-11 | Member Engagement Dashboard — current buddy, buddy status, weekly mission, XP, streak/progress, leaderboard position | P0 |
| FR-12 | Coordinator Dashboard — total members, active members, buddy check-ins, members needing follow-up, recent activity | P0 |
| FR-13 | Follow-Up Needed List — flag members below engagement threshold | P0 |

**XP Examples**

| Action | XP |
| --- | --- |
| Message buddy | +5 |
| Complete weekly follow-up | +10 |
| Buddy check-in | +15 |
| Attend fellowship | +10 |
| Encourage someone | +5 |
| Complete special mission | +20 |

## 10. UX / Design Requirements

- **Mobile First** — primarily designed for mobile.
- **Low Friction** — the user should be able to answer "Who am I supposed to check on this week?" within seconds of opening the app.
- **Home Screen Priority** — current buddy, follow-up status, weekly mission, XP/progress, quick access to messaging.
- **Encouraging, Not Punitive** — missing fellowship should never be shamed. Instead of "You failed," the system says: "We missed you! Want to check in with someone this week?"

Example home screen:

```
Good morning 👋

YOUR BUDDY THIS WEEK
Tomi
🟢 Active yesterday
"You haven't checked in yet."
[Message Tomi →]

YOUR WEEK
❤️❤️❤️❤️❤️
5-week streak
+20 XP

WEEKLY MISSION
Check in with your buddy
+10 XP
```

## 11. Technical Requirements

### 11.1 Platform

Responsive web application / Progressive Web App (no native distribution).

### 11.2 Recommended Technology Stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Authentication, Realtime, Storage)
- **Hosting:** Vercel

### 11.3 Core Data Entities

- **Users** — id, name, email, avatar, team, role, created_at
- **BuddyPairs** — id, user_id, buddy_id, week, completed
- **Messages** — id, sender_id, receiver_id, message, timestamp
- **CheckIns** — id, user_id, buddy_id, date, verified
- **Points** — id, user_id, action, points, date

## 12. Edge Cases & Error States

**Pairing:** odd number of members; member joins after pairings generated; member leaves; repeated pairing; previous pairing incomplete.

**Messaging:** messaging a deleted/inactive account; message fails to send; lost internet; empty message.

**Check-In:** QR expires; QR scanned by wrong person; multiple check-in attempts; buddy hasn't opened the app; poor internet.

**Engagement:** member misses fellowship; doesn't contact buddy; inactive for multiple weeks; returns after inactivity. The product should respond to inactivity with re-engagement opportunities rather than treating absence as failure.

## 13. MVP Scope & Prioritization

### P0 — Must Have

- **Member:** Authentication, member profile, weekly buddy assignment, buddy dashboard, basic messaging, weekly mission, QR buddy check-in, XP system
- **Admin:** Admin authentication, member list, fellowship engagement overview, needs-follow-up list

### P1 — Should Have

- Quick messages, individual leaderboard, streaks, basic engagement analytics, improved notifications, character progression

### P2 — Future

- Team/houses system, team leaderboard, character customization, NFC check-in, advanced analytics, push notifications, more sophisticated engagement missions

> **MVP Principle:** If a feature does not directly contribute to follow-up, engagement, accountability, or coordinator visibility, it probably does not belong in V1.

## 14. Launch Plan

- **Phase 1 — Research (Days 1–3):** interview 5–10 members, speak with leadership, document existing follow-up process, validate weekly buddy concept.
- **Phase 2 — Prototype (Days 4–7):** Figma prototype of all screens; usability testing.
- **Phase 3 — MVP Development (Weeks 2–3):** auth, database, pairing, messaging, missions, QR verification, XP, admin dashboard.
- **Phase 4 — Pilot (Week 4):** launch to a controlled group; monitor engagement metrics.
- **Phase 5 — Iteration:** review data, interview users, prioritize, release next iteration.

## 15. Risks & Assumptions

### 15.1 Assumptions

Members are willing to participate in a buddy system; comfortable communicating with assigned buddies; have smartphones; have internet access; leadership supports the system; members respond positively to lightweight gamification.

### 15.2 Risks

1. **Forced Relationships** → allow reporting problematic pairings; coordinators can adjust.
2. **Gamification Becomes the Goal** → award points primarily for meaningful engagement, not opening the app.
3. **False Check-Ins** → two-person verification + temporary QR codes; accountability mechanism, not surveillance.
4. **Low Adoption** → research before development; test onboarding with real members.
5. **Scope Creep** → maintain strict P0/P1/P2 prioritization.

## 16. Open Questions

- Are members comfortable being randomly assigned a buddy?
- Should members be able to request a new buddy?
- Should pairings change every week?
- Should members message only their assigned buddy?
- What counts as a meaningful follow-up?
- How long before appearing on "Needs Follow-Up"?
- Should attendance be part of the engagement system?
- Do members actually want XP and leaderboards?
- Would individual competition motivate or discourage?
- Who should access member engagement information?
- Which coordinators can adjust pairings?
- What does leadership need from the dashboard?
- NFC support? Push notifications? Integration with existing systems?

## Product Success Definition

CFFA is successful if follow-up is no longer primarily dependent on a small number of fellowship leaders. The outcome is not "everyone used the app" but: **"More members are consistently connected to one another, and coordinators spend less time manually tracking who needs follow-up."**
