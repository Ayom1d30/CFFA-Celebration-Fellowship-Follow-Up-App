-- ============================================================
-- Realtime chat + configurable weekly pairing schedule.
-- Apply AFTER 0006_fix_checkin_token_function.sql.
-- ============================================================

-- Publish message inserts over Supabase Realtime so the chat screen
-- (and chat list) updates live instead of requiring a page reload.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'messages'
  ) then
    alter publication supabase_realtime add table public.messages;
  end if;
end $$;

-- ============================================================
-- get_pairing_schedule: read the current pg_cron pairing job.
-- Coordinator-only.
-- ============================================================
create or replace function public.get_pairing_schedule()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job record;
  v_minute text;
  v_hour text;
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;

  select * into v_job
  from cron.job
  where jobname = 'weekly-pairings'
  limit 1;

  if v_job.jobid is null then
    return jsonb_build_object(
      'enabled', false,
      'schedule', null,
      'weekday', null,
      'time', null
    );
  end if;

  v_minute := split_part(v_job.schedule, ' ', 1);
  v_hour := split_part(v_job.schedule, ' ', 2);

  return jsonb_build_object(
    'enabled', v_job.active,
    'schedule', v_job.schedule,
    'weekday', split_part(v_job.schedule, ' ', 5)::int,
    'time', lpad(v_hour, 2, '0') || ':' || lpad(v_minute, 2, '0')
  );
end;
$$;

-- ============================================================
-- set_pairing_schedule: change the weekly pairing day/time.
-- p_weekday: 0 = Sunday .. 6 = Saturday. p_time: HH:MM (24h).
-- Coordinator-only.
-- ============================================================
create or replace function public.set_pairing_schedule(p_weekday int, p_time text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_minute int;
  v_hour int;
  v_schedule text;
  v_jobid bigint;
begin
  if not public.is_coordinator() then
    raise exception 'Not authorized';
  end if;

  if p_weekday < 0 or p_weekday > 6 then
    raise exception 'Weekday must be between 0 (Sunday) and 6 (Saturday)';
  end if;

  if p_time !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' then
    raise exception 'Time must be in HH:MM 24h format';
  end if;

  v_hour := split_part(p_time, ':', 1)::int;
  v_minute := split_part(p_time, ':', 2)::int;
  v_schedule := v_minute || ' ' || v_hour || ' * * ' || p_weekday;

  select jobid into v_jobid
  from cron.job
  where jobname = 'weekly-pairings'
  limit 1;

  if v_jobid is null then
    select cron.schedule('weekly-pairings', v_schedule, 'select public.run_scheduled_pairings();')
    into v_jobid;
  else
    perform cron.alter_job(v_jobid, schedule := v_schedule);
  end if;

  return public.get_pairing_schedule();
end;
$$;
