-- CFFA admin follow-up + scheduled pairing (FR-03 / FR-13)
-- Apply AFTER 0002_mvp_functions.sql.

-- ============================================================
-- mark_followed_up: coordinator records a manual follow-up.
-- Touches last_active_at so the member drops off the
-- needs-follow-up list (which is time-based).
-- ============================================================
create or replace function public.mark_followed_up(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;

  update public.users
  set last_active_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'Member not found';
  end if;
end;
$$;

-- ============================================================
-- Pairing refactor: extract the auth-independent pairing routine
-- so it can run on a schedule (pg_cron has no auth context).
-- ============================================================
create or replace function public.pair_members_week(p_week date default null)
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

-- Coordinator-triggered pairing (keeps the auth gate for RPC callers).
create or replace function public.generate_weekly_pairings(p_week date default null)
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;
  return public.pair_members_week(p_week);
end;
$$;

-- Scheduled pairing (pg_cron runs with no auth context).
create or replace function public.run_scheduled_pairings()
returns int
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.pair_members_week(null);
end;
$$;

-- Do not expose the auth-independent routines over PostgREST.
revoke execute on function public.pair_members_week(date) from anon, authenticated, public;
revoke execute on function public.run_scheduled_pairings() from anon, authenticated, public;

-- ============================================================
-- Schedule: regenerate pairings every Tuesday at 02:00.
-- ============================================================
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'weekly-pairings';
select cron.schedule('weekly-pairings', '0 2 * * 2', 'select public.run_scheduled_pairings();');
