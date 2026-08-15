-- Repair: set_pairing_schedule parsed p_time "HH:MM" with minute/hour swapped,
-- producing invalid cron expressions (e.g. "3 30 * * 3"). Redefine correctly.

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
