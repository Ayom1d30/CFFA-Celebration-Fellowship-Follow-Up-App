-- CFFA MVP functions
-- Pairing generation, messaging, weekly missions, XP, streaks,
-- profile data, coordinator guards, and tightened RLS.
-- Apply AFTER 0001_initial_schema.sql.

-- ============================================================
-- Tighten RLS: enforce server-only writes via functions.
-- ============================================================
drop policy if exists "members update their own pairs" on public.buddy_pairs;
drop policy if exists "users send their own messages" on public.messages;
drop policy if exists "users complete their own missions" on public.mission_completions;

-- ============================================================
-- Streak: consecutive active weeks ending now (or last week).
-- ============================================================
create or replace function public.get_current_streak(p_user uuid)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week date := date_trunc('week', now())::date;
  v_has boolean;
  v_streak int := 0;
begin
  -- If no activity this week yet, start counting from last week.
  select exists (
    select 1 from public.points
    where user_id = p_user and date_trunc('week', created_at)::date = v_week
  ) into v_has;
  if not v_has then
    v_week := v_week - 7;
  end if;

  loop
    select exists (
      select 1 from public.points
      where user_id = p_user and date_trunc('week', created_at)::date = v_week
    ) into v_has;
    exit when not v_has;
    v_streak := v_streak + 1;
    v_week := v_week - 7;
  end loop;

  return v_streak;
end;
$$;

-- ============================================================
-- Weekly pairing generation (FR-03).
-- Runs on a schedule (each Tuesday). Avoids recent repeat pairings.
-- ============================================================
create or replace function public.generate_weekly_pairings(p_week date default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week date := coalesce(p_week, date_trunc('week', now())::date);
  v_ids uuid[];
  v_len int;
  v_attempt int;
  v_i int;
  v_a uuid;
  v_b uuid;
  v_ok boolean;
  v_pairs int := 0;
  v_unpaired uuid;
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;

  -- Regenerate cleanly for the given week.
  delete from public.buddy_pairs where week = v_week;
  delete from public.pairing_history where week = v_week;

  select coalesce(array_agg(id), '{}') into v_ids
  from public.users
  where role = 'member';

  v_len := array_length(v_ids, 1);
  if v_len is null or v_len = 0 then
    return 0;
  end if;

  -- Odd number of members: set aside the last one.
  if mod(v_len, 2) = 1 then
    v_unpaired := v_ids[v_len];
    v_ids := v_ids[1 : v_len - 1];
    v_len := v_len - 1;
  end if;

  -- Try up to 30 shuffles to find a matching with no recent repeats.
  for v_attempt in 1..30 loop
    select coalesce(array_agg(m order by random()), '{}') into v_ids
    from unnest(v_ids) as m;

    v_ok := true;
    for v_i in 1..(v_len / 2) loop
      v_a := v_ids[v_i * 2 - 1];
      v_b := v_ids[v_i * 2];
      if exists (
        select 1 from public.pairing_history
        where user_a = least(v_a, v_b) and user_b = greatest(v_a, v_b)
          and week >= (v_week - interval '56 days')::date
      ) then
        v_ok := false;
        exit;
      end if;
    end loop;

    exit when v_ok;
  end loop;

  for v_i in 1..(v_len / 2) loop
    v_a := v_ids[v_i * 2 - 1];
    v_b := v_ids[v_i * 2];
    insert into public.buddy_pairs (user_id, buddy_id, week)
    values (v_a, v_b, v_week);
    insert into public.buddy_pairs (user_id, buddy_id, week)
    values (v_b, v_a, v_week);
    insert into public.pairing_history (user_a, user_b, week)
    values (least(v_a, v_b), greatest(v_a, v_b), v_week);
    v_pairs := v_pairs + 1;
  end loop;

  -- Odd member out: pair with a coordinator so they still have a buddy.
  if v_unpaired is not null then
    insert into public.buddy_pairs (user_id, buddy_id, week)
    select v_unpaired, id, v_week
    from public.users
    where role = 'coordinator'
    limit 1;
  end if;

  return v_pairs;
end;
$$;

-- ============================================================
-- Messaging (FR-04 / FR-08): validated send + XP award.
-- ============================================================
create or replace function public.send_message(p_buddy_id uuid, p_message text, p_is_quick boolean default false)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week date := date_trunc('week', now())::date;
  v_has_message boolean;
begin
  if length(trim(coalesce(p_message, ''))) = 0 then
    raise exception 'Message cannot be empty';
  end if;

  if not exists (
    select 1 from public.buddy_pairs
    where user_id = auth.uid() and buddy_id = p_buddy_id and week = v_week
  ) then
    raise exception 'Not your buddy this week';
  end if;

  insert into public.messages (sender_id, receiver_id, message, is_quick)
  values (auth.uid(), p_buddy_id, p_message, coalesce(p_is_quick, false));

  update public.buddy_pairs
  set status = 'contacted'
  where user_id = auth.uid() and buddy_id = p_buddy_id
    and week = v_week and status = 'pending';

  -- Award message XP once per sender per week.
  select exists (
    select 1 from public.points
    where user_id = auth.uid() and action = 'message'
      and created_at >= v_week
  ) into v_has_message;

  if not v_has_message then
    perform public.award_xp(auth.uid(), 'message', 5);
  end if;
end;
$$;

-- ============================================================
-- Weekly mission (FR-06): complete + XP.
-- ============================================================
create or replace function public.complete_weekly_mission()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week date := date_trunc('week', now())::date;
  v_mission public.weekly_missions%rowtype;
begin
  select * into v_mission
  from public.weekly_missions
  where week = v_week;

  if v_mission.id is null then
    raise exception 'No mission this week';
  end if;

  if exists (
    select 1 from public.mission_completions
    where user_id = auth.uid() and mission_id = v_mission.id
  ) then
    return;
  end if;

  insert into public.mission_completions (user_id, mission_id)
  values (auth.uid(), v_mission.id);

  perform public.award_xp(auth.uid(), 'weekly_followup', v_mission.xp_reward);
end;
$$;

-- ============================================================
-- Home payload (FR-11): pair, buddy, mission, XP, streak.
-- ============================================================
create or replace function public.get_my_weekly_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week date := date_trunc('week', now())::date;
  v_result jsonb;
begin
  select jsonb_build_object(
    'pair', (
      select jsonb_build_object('id', bp.id, 'buddy_id', bp.buddy_id, 'status', bp.status)
      from public.buddy_pairs bp
      where bp.user_id = auth.uid() and bp.week = v_week
      limit 1
    ),
    'buddy', (
      select jsonb_build_object(
        'id', u.id, 'name', u.name, 'avatar', u.avatar, 'last_active_at', u.last_active_at
      )
      from public.buddy_pairs bp
      join public.users u on u.id = bp.buddy_id
      where bp.user_id = auth.uid() and bp.week = v_week
      limit 1
    ),
    'mission', (
      select jsonb_build_object(
        'id', m.id, 'title', m.title, 'description', m.description,
        'xp_reward', m.xp_reward, 'week', m.week,
        'completed', exists (
          select 1 from public.mission_completions mc
          where mc.user_id = auth.uid() and mc.mission_id = m.id
        )
      )
      from public.weekly_missions m
      where m.week = v_week
      limit 1
    ),
    'xp', (select coalesce(sum(points), 0) from public.points where user_id = auth.uid()),
    'week_xp', (select coalesce(sum(points), 0) from public.points where user_id = auth.uid() and created_at >= v_week),
    'streak', public.get_current_streak(auth.uid())
  ) into v_result;

  return v_result;
end;
$$;

-- ============================================================
-- Profile payload: total XP, streak, recent activity.
-- ============================================================
create or replace function public.get_my_profile()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'xp', (select coalesce(sum(points), 0) from public.points where user_id = auth.uid()),
    'streak', public.get_current_streak(auth.uid()),
    'recent_activity', (
      select coalesce(jsonb_agg(
        jsonb_build_object('action', p.action, 'points', p.points, 'created_at', p.created_at)
        order by p.created_at desc
      ), '[]'::jsonb)
      from (select action, points, created_at
            from public.points
            where user_id = auth.uid()
            order by created_at desc
            limit 10) p
    )
  ) into v_result;

  return v_result;
end;
$$;

-- ============================================================
-- Check-in verification (FR-07): the buddy must scan. Tightened.
-- ============================================================
create or replace function public.verify_checkin(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token public.checkin_tokens%rowtype;
  v_pair public.buddy_pairs%rowtype;
  v_user uuid;
  v_buddy uuid;
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

  -- Two-person verification: the scanning user must be the pair buddy.
  if v_pair.buddy_id <> auth.uid() then
    raise exception 'Only your buddy can verify this check-in';
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
  where id = v_pair.id;

  perform public.award_xp(v_user, 'checkin', 15);
  perform public.award_xp(v_buddy, 'checkin', 15);
end;
$$;

-- ============================================================
-- Coordinator dashboard (FR-12 / FR-13) — coordinator-gated.
-- ============================================================
create or replace function public.get_engagement_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total bigint;
  v_active bigint;
  v_checkins bigint;
  v_needs bigint;
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;

  select count(*) into v_total from public.users;
  select count(*) into v_active from public.users
    where last_active_at >= now() - interval '7 days';
  select count(distinct pair_id) into v_checkins from public.check_ins
    where created_at >= date_trunc('week', now());
  select count(*) into v_needs from public.users
    where last_active_at is null or last_active_at < now() - interval '7 days';

  return jsonb_build_object(
    'total_members', v_total,
    'active_this_week', v_active,
    'buddy_checkins', v_checkins,
    'needs_followup', v_needs
  );
end;
$$;

create or replace function public.get_needs_followup(p_days int default 7)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;

  return (
    select coalesce(jsonb_agg(
      jsonb_build_object(
        'member_id', u.id,
        'name', u.name,
        'last_activity', u.last_active_at,
        'buddy_name', (
          select bu.name
          from public.buddy_pairs bp
          join public.users bu on bu.id = bp.buddy_id
          where bp.user_id = u.id and bp.week = date_trunc('week', now())::date
          limit 1
        )
      )
      order by u.last_active_at asc nulls first
    ), '[]'::jsonb)
    from public.users u
    where u.last_active_at is null or u.last_active_at < now() - interval '1 day' * p_days
  );
end;
$$;

-- ============================================================
-- Member detail for coordinators.
-- ============================================================
create or replace function public.get_member_detail(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;

  select jsonb_build_object(
    'member', (
      select jsonb_build_object(
        'id', u.id, 'name', u.name, 'email', u.email, 'avatar', u.avatar,
        'team', u.team, 'last_active_at', u.last_active_at, 'created_at', u.created_at
      )
      from public.users u
      where u.id = p_user_id
    ),
    'xp', (select coalesce(sum(points), 0) from public.points where user_id = p_user_id),
    'streak', public.get_current_streak(p_user_id),
    'buddy', (
      select jsonb_build_object(
        'id', bu.id, 'name', bu.name, 'avatar', bu.avatar, 'status', bp.status
      )
      from public.buddy_pairs bp
      join public.users bu on bu.id = bp.buddy_id
      where bp.user_id = p_user_id and bp.week = date_trunc('week', now())::date
      limit 1
    ),
    'mission', (
      select jsonb_build_object(
        'id', m.id, 'title', m.title, 'xp_reward', m.xp_reward,
        'completed', exists (
          select 1 from public.mission_completions mc
          where mc.user_id = p_user_id and mc.mission_id = m.id
        )
      )
      from public.weekly_missions m
      where m.week = date_trunc('week', now())::date
      limit 1
    ),
    'recent_activity', (
      select coalesce(jsonb_agg(
        jsonb_build_object('action', p.action, 'points', p.points, 'created_at', p.created_at)
        order by p.created_at desc
      ), '[]'::jsonb)
      from (select action, points, created_at
            from public.points
            where user_id = p_user_id
            order by created_at desc
            limit 10) p
    )
  ) into v_result;

  return v_result;
end;
$$;
