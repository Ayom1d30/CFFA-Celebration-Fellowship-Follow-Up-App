-- CFFA seed data: coordinator, test members, weekly mission, demo points.
-- Test login password for all seeded accounts: CFFA-Test-123!
-- Runs once per environment (tracked by db:migrate); idempotent re-runs are safe.

create extension if not exists pgcrypto;

-- ============================================================
-- Test accounts (auth.users -> public.users via handle_new_user trigger)
-- ============================================================
do $$
begin
  if not exists (select 1 from auth.users where email = 'coordinator@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'coordinator@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Grace Coordinator"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'mary@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'mary@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Mary A"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'john@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'john@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"John B"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'kemi@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'kemi@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Kemi C"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'ade@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'ade@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Ade D"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'tunde@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'tunde@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Tunde E"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'emeka@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'emeka@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Emeka F"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'ngozi@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'ngozi@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Ngozi G"}', now(), now());
  end if;

  if not exists (select 1 from auth.users where email = 'sola@celebration.org') then
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, confirmation_token, recovery_token, email_change, email_change_token_new, reauthentication_token, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'sola@celebration.org', crypt('CFFA-Test-123!', gen_salt('bf')), '', '', '', '', '', now(), '{"provider":"email","providers":["email"]}', '{"name":"Sola H"}', now(), now());
  end if;
end $$;

-- Promote the coordinator account.
update public.users
set role = 'coordinator'
where email = 'coordinator@celebration.org' and role <> 'coordinator';

-- ============================================================
-- Weekly mission for the current week.
-- ============================================================
insert into public.weekly_missions (title, description, xp_reward, week)
values (
  'Reach out to your buddy',
  'Send a message or call your buddy this week to start the conversation.',
  10,
  date_trunc('week', now())::date
)
on conflict (week) do nothing;

-- ============================================================
-- Demo activity so XP / leaderboard / admin views show data.
-- Ngozi and Sola are intentionally left inactive (needs follow-up).
-- ============================================================
insert into public.points (user_id, action, points, created_at)
select u.id, 'message', 5, now() - interval '2 days'
from public.users u
where u.email in ('mary@celebration.org', 'john@celebration.org');

insert into public.points (user_id, action, points, created_at)
select u.id, 'weekly_followup', 10, now() - interval '2 days'
from public.users u
where u.email = 'mary@celebration.org';

-- ============================================================
-- Generate this week's pairings for the seeded members.
-- ============================================================
select public.pair_members_week(null);
