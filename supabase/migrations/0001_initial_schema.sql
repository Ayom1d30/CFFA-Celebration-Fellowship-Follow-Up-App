-- CFFA initial schema
-- Tables, indexes, RLS policies, and helper functions.

-- ============================================================
-- users
-- ============================================================
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar text,
  team text,
  role text not null default 'member' check (role in ('member', 'coordinator')),
  last_active_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users are readable by authenticated users"
  on public.users for select
  using (auth.role() = 'authenticated');

create policy "users can update their own row"
  on public.users for update
  using (auth.uid() = id);

-- Create a public.users row when a Supabase auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Helper: is the calling user a coordinator?
-- ============================================================
create or replace function public.is_coordinator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'coordinator'
  );
$$;

-- ============================================================
-- teams (P2)
-- ============================================================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text,
  created_at timestamptz not null default now()
);

alter table public.teams enable row level security;

create policy "teams are readable by authenticated users"
  on public.teams for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- buddy_pairs
-- ============================================================
create table if not exists public.buddy_pairs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  buddy_id uuid not null references public.users (id) on delete cascade,
  week date not null,
  status text not null default 'pending'
    check (status in ('pending', 'contacted', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint buddy_pairs_no_self check (user_id <> buddy_id)
);

create index if not exists idx_buddy_pairs_user_week on public.buddy_pairs (user_id, week);
create index if not exists idx_buddy_pairs_week on public.buddy_pairs (week);

alter table public.buddy_pairs enable row level security;

create policy "members read their own pairs"
  on public.buddy_pairs for select
  using (user_id = auth.uid() or buddy_id = auth.uid());

create policy "members update their own pairs"
  on public.buddy_pairs for update
  using (user_id = auth.uid() or buddy_id = auth.uid());

-- ============================================================
-- pairing_history
-- ============================================================
create table if not exists public.pairing_history (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.users (id) on delete cascade,
  user_b uuid not null references public.users (id) on delete cascade,
  week date not null,
  created_at timestamptz not null default now(),
  constraint pairing_history_order check (user_a < user_b),
  unique (user_a, user_b, week)
);

create index if not exists idx_pairing_history_pair on public.pairing_history (user_a, user_b);

alter table public.pairing_history enable row level security;

create policy "pairing history readable by authenticated users"
  on public.pairing_history for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- messages
-- ============================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users (id) on delete cascade,
  receiver_id uuid not null references public.users (id) on delete cascade,
  message text not null,
  is_quick boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_messages_conversation
  on public.messages (sender_id, receiver_id, created_at);

alter table public.messages enable row level security;

create policy "users read conversations they belong to"
  on public.messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

create policy "users send their own messages"
  on public.messages for insert
  with check (sender_id = auth.uid());

-- ============================================================
-- check_ins
-- ============================================================
create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  buddy_id uuid not null references public.users (id) on delete cascade,
  pair_id uuid references public.buddy_pairs (id) on delete set null,
  date date not null default current_date,
  verified boolean not null default true,
  created_at timestamptz not null default now(),
  unique (pair_id, user_id)
);

create index if not exists idx_check_ins_user_date on public.check_ins (user_id, date);

alter table public.check_ins enable row level security;

create policy "users read their own check-ins"
  on public.check_ins for select
  using (user_id = auth.uid() or buddy_id = auth.uid());

-- Inserts are only via the verify_checkin function (security definer).
create policy "no direct check-in inserts"
  on public.check_ins for insert
  with check (false);

-- ============================================================
-- checkin_tokens
-- ============================================================
create table if not exists public.checkin_tokens (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references public.buddy_pairs (id) on delete cascade,
  token text not null unique,
  created_by uuid not null references public.users (id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.checkin_tokens enable row level security;

create policy "tokens created via functions only"
  on public.checkin_tokens for all
  using (false)
  with check (false);

-- ============================================================
-- points
-- ============================================================
create table if not exists public.points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  action text not null,
  points int not null check (points > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_points_user_date on public.points (user_id, created_at);

alter table public.points enable row level security;

create policy "users read their own points"
  on public.points for select
  using (user_id = auth.uid());

-- Inserts are only via the award_xp function.
create policy "no direct point inserts"
  on public.points for insert
  with check (false);

-- ============================================================
-- weekly_missions
-- ============================================================
create table if not exists public.weekly_missions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  xp_reward int not null default 10 check (xp_reward > 0),
  week date not null unique,
  created_at timestamptz not null default now()
);

alter table public.weekly_missions enable row level security;

create policy "missions readable by authenticated users"
  on public.weekly_missions for select
  using (auth.role() = 'authenticated');

-- ============================================================
-- mission_completions
-- ============================================================
create table if not exists public.mission_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  mission_id uuid not null references public.weekly_missions (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, mission_id)
);

alter table public.mission_completions enable row level security;

create policy "users read their own completions"
  on public.mission_completions for select
  using (user_id = auth.uid());

create policy "users complete their own missions"
  on public.mission_completions for insert
  with check (user_id = auth.uid());

-- ============================================================
-- award_xp (internal helper, security definer)
-- ============================================================
create or replace function public.award_xp(p_user uuid, p_action text, p_points int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.points (user_id, action, points)
  values (p_user, p_action, p_points);

  update public.users
  set last_active_at = now()
  where id = p_user;
end;
$$;

-- ============================================================
-- check-in verification (FR-07)
-- ============================================================
create or replace function public.create_checkin_token(p_pair_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token text;
  v_pair public.buddy_pairs%rowtype;
begin
  select * into v_pair from public.buddy_pairs where id = p_pair_id;
  if v_pair.id is null then
    raise exception 'Pair not found';
  end if;

  if v_pair.user_id <> auth.uid() and v_pair.buddy_id <> auth.uid() then
    raise exception 'Not your pairing';
  end if;

  if exists (
    select 1 from public.check_ins
    where pair_id = p_pair_id and verified
  ) then
    raise exception 'Already checked in this week';
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');

  insert into public.checkin_tokens (pair_id, token, created_by, expires_at)
  values (p_pair_id, v_token, auth.uid(), now() + interval '5 minutes');

  return v_token;
end;
$$;

create or replace function public.verify_checkin(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token public.checkin_tokens%rowtype;
  v_pair public.buddy_pairs%rowtype;
  v_buddy uuid;
  v_user uuid;
begin
  select * into v_token from public.checkin_tokens where token = p_token;
  if v_token.id is null then
    raise exception 'Invalid code';
  end if;
  if v_token.used_at is not null then
    raise exception 'Code already used';
  end if;
  if v_token.expires_at < now() then
    raise exception 'Code expired';
  end if;

  select * into v_pair from public.buddy_pairs where id = v_token.pair_id;
  if v_pair.id is null then
    raise exception 'Pair not found';
  end if;

  -- The scanner must be the buddy of the token creator.
  if v_pair.buddy_id <> auth.uid() and v_pair.user_id <> auth.uid() then
    raise exception 'Not your pairing';
  end if;

  v_user := v_pair.user_id;
  v_buddy := v_pair.buddy_id;

  update public.checkin_tokens set used_at = now() where id = v_token.id;

  insert into public.check_ins (user_id, buddy_id, pair_id, verified)
  values (v_user, v_buddy, v_pair.id, true)
  on conflict (pair_id, user_id) do nothing;

  insert into public.check_ins (user_id, buddy_id, pair_id, verified)
  values (v_buddy, v_user, v_pair.id, true)
  on conflict (pair_id, user_id) do nothing;

  update public.buddy_pairs
  set status = 'completed', completed_at = now()
  where id in (v_pair.id);

  perform public.award_xp(v_user, 'checkin', 15);
  perform public.award_xp(v_buddy, 'checkin', 15);
end;
$$;

-- ============================================================
-- leaderboard (FR-09)
-- ============================================================
create or replace function public.get_leaderboard(p_limit int default 50)
returns table (user_id uuid, name text, avatar text, total_xp bigint, rank bigint)
language sql
security definer
set search_path = public
as $$
  with totals as (
    select p.user_id as uid, sum(p.points) as total_xp
    from public.points p
    group by p.user_id
  )
  select u.id as user_id, u.name, u.avatar,
         coalesce(t.total_xp, 0) as total_xp,
         row_number() over (order by coalesce(t.total_xp, 0) desc) as rank
  from public.users u
  left join totals t on t.uid = u.id
  order by total_xp desc
  limit p_limit;
$$;

-- ============================================================
-- coordinator dashboard (FR-12 / FR-13)
-- ============================================================
create or replace function public.get_engagement_overview()
returns table (
  total_members bigint,
  active_this_week bigint,
  buddy_checkins bigint,
  needs_followup bigint
)
language sql
security definer
set search_path = public
as $$
  select
    (select count(*) from public.users) as total_members,
    (select count(*) from public.users
      where last_active_at >= now() - interval '7 days') as active_this_week,
    (select count(distinct pair_id) from public.check_ins
      where created_at >= date_trunc('week', now())) as buddy_checkins,
    (select count(*) from public.users
      where last_active_at is null or last_active_at < now() - interval '7 days') as needs_followup;
$$;

create or replace function public.get_needs_followup(p_days int default 7)
returns table (member_id uuid, name text, last_activity timestamptz, buddy_name text)
language sql
security definer
set search_path = public
as $$
  select u.id as member_id, u.name, u.last_active_at,
         (select name from public.users where id = (
           select buddy_id from public.buddy_pairs
           where user_id = u.id and week = date_trunc('week', now())::date
           limit 1
         )) as buddy_name
  from public.users u
  where u.last_active_at is null or u.last_active_at < now() - interval '1 day' * p_days
  order by u.last_active_at asc nulls first;
$$;
