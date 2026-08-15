-- Repair: get_pairing_schedule returned the cron minute:hour fields in the
-- wrong order when building the "time" display value (reported "30:03" for a
-- 03:30 schedule). Redefine with the hour:minute order. Also guarantees a
-- single 'weekly-pairings' cron job (in case earlier runs ever duplicated it).

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

-- Make sure exactly one 'weekly-pairings' job exists.
select cron.unschedule(jobid) from cron.job where jobname = 'weekly-pairings';
select cron.schedule('weekly-pairings', '0 2 * * 2', 'select public.run_scheduled_pairings();');
