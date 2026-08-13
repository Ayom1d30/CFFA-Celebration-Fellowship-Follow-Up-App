-- Repair: public.create_checkin_token called gen_random_bytes() unqualified,
-- but on Supabase pgcrypto functions live in the "extensions" schema and the
-- function sets search_path = public, so the call failed at runtime with
-- "function gen_random_bytes(integer) does not exist".
-- Redefine with a schema-qualified call (idempotent).

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

  v_token := encode(extensions.gen_random_bytes(24), 'hex');

  insert into public.checkin_tokens (pair_id, token, created_by, expires_at)
  values (p_pair_id, v_token, auth.uid(), now() + interval '5 minutes');

  return v_token;
end;
$$;
