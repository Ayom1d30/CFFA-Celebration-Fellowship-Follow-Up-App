-- ============================================================
-- 0012: mutual buddy pairings with the coordinator only joining
-- an odd member count, and a member-only leaderboard.
--
--   * Members (role = 'member') are paired into mutual buddy
--     relationships (reciprocal buddy_pairs rows).
--   * If the member count is odd, the coordinator fills the final
--     slot so the remaining member still has a buddy. The
--     coordinator pairing is also mutual (works for chat and QR
--     check-in in both directions).
--   * If the member count is even, the coordinator is not included.
--   * Re-running for the same week regenerates cleanly (idempotent),
--     and buddy_pairs_no_self guarantees nobody is paired with
--     themselves.
--   * The coordinator never appears on the member leaderboard.
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
  v_coordinator uuid;
begin
  -- Regenerate cleanly for the given week (idempotent).
  delete from public.buddy_pairs where week = v_week;
  delete from public.pairing_history where week = v_week;

  select coalesce(array_agg(id), '{}') into v_ids
  from public.users
  where role = 'member';

  v_len := array_length(v_ids, 1);
  if v_len is null or v_len = 0 then
    return 0;
  end if;

  -- Odd number of members: set the last one aside for the
  -- coordinator so every remaining member has a paired buddy.
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

  -- Mutual member-member pairs.
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

  -- Odd member out: pair with the coordinator, in both directions.
  if v_unpaired is not null then
    select id into v_coordinator
    from public.users
    where role = 'coordinator'
    limit 1;

    if v_coordinator is not null then
      insert into public.buddy_pairs (user_id, buddy_id, week)
      values (v_unpaired, v_coordinator, v_week);
      insert into public.buddy_pairs (user_id, buddy_id, week)
      values (v_coordinator, v_unpaired, v_week);
      v_pairs := v_pairs + 1;
    end if;
  end if;

  return v_pairs;
end;
$$;

-- Member leaderboard only: the coordinator is not ranked among members.
create or replace function public.get_leaderboard(p_limit int default 50)
returns table (user_id uuid, name text, avatar text, total_xp bigint, rank bigint)
language sql
security definer
set search_path = public
as $$
  with totals as (
    select p.user_id as uid, sum(p.points)::bigint as total_xp
    from public.points p
    group by p.user_id
  )
  select u.id as user_id, u.name, u.avatar,
         coalesce(t.total_xp, 0) as total_xp,
         rank() over (order by coalesce(t.total_xp, 0) desc) as rank
  from public.users u
  left join totals t on t.uid = u.id
  where u.role = 'member'
  order by total_xp desc, u.name asc
  limit p_limit;
$$;
