-- ============================================================
-- 0011: read receipts + competition ranking on the leaderboard.
-- ============================================================

-- Read receipts: when a message is seen by its receiver.
alter table public.messages
  add column if not exists read_at timestamptz;

-- Fast lookup of a user's unread inbox (receiver, newest first).
create index if not exists idx_messages_unread
  on public.messages (receiver_id, created_at)
  where read_at is null;

-- Receivers mark their incoming messages as read when they open the chat.
create or replace function public.mark_conversation_read(p_partner_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.messages
     set read_at = now()
   where receiver_id = auth.uid()
     and sender_id = p_partner_id
     and read_at is null;
end;
$$;

grant execute on function public.mark_conversation_read(uuid) to authenticated;

-- ============================================================
-- Competition ranking (FR-09): tied scores share a rank and the
-- next rank accounts for the tie (1, 2, 3, 3, 5). rank() is used
-- instead of row_number() so the displayed rank never comes from
-- the row position. The secondary ORDER BY (name) is only for a
-- deterministic display and never affects the rank value.
-- ============================================================
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
  order by total_xp desc, u.name asc
  limit p_limit;
$$;
