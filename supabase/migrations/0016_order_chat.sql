-- Pause Coffee — the customer/shop conversation.
--
-- Chat exists for one reason: a delivery needs a way to say "the gate is the
-- blue one" or "nobody is answering". So it is scoped to exactly that — an
-- ONLINE order that a human has APPROVED. An order still awaiting approval has
-- no thread, and neither does a rejected one: the whole point of the approval
-- gate is that somebody who submits a junk order gets no channel to the shop.
--
-- The guest side mirrors orders exactly (0003): no RLS policy at all, and two
-- SECURITY DEFINER RPCs that will only act for a caller who already holds the
-- order's uuid. Staff, holding a real session, read and write the table direct.

-- ---------------------------------------------------------------- messages

create table if not exists public.order_messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  sender public.message_sender not null,
  -- Recorded for internal accountability — who on the team said this — and
  -- deliberately never returned to the customer, who sees only "Pause Coffee".
  staff_id uuid references public.profiles (id) on delete set null,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  -- Unread is tracked for staff only. The customer's tracker is a single open
  -- screen with the thread already on it; it has nothing to badge.
  read_by_staff boolean not null default false
);

create index if not exists order_messages_order_id_idx
  on public.order_messages (order_id, created_at);

-- Drives the inbox's unread count without touching the rest of the table.
create index if not exists order_messages_unread_idx
  on public.order_messages (order_id)
  where sender = 'customer' and not read_by_staff;

-- The row-level form of the same gate. SECURITY DEFINER so the insert policy
-- below costs one lookup rather than four correlated subqueries, and so it
-- reads the order regardless of who is asking.
create or replace function public.chat_is_open_for(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.chat_is_open(o.order_channel, o.approved_at, o.completed_at, o.cancelled_at)
  from public.orders o
  where o.id = p_order_id;
$$;

revoke execute on function public.chat_is_open_for(uuid) from public, anon;
grant execute on function public.chat_is_open_for(uuid) to authenticated;

-- --------------------------------------------------------------------- rls

alter table public.order_messages enable row level security;

-- No anon policy, on purpose and for the same reason as orders: a permissive
-- one would let anyone with the anon key read every conversation in the shop.
drop policy if exists "order_messages_staff_read" on public.order_messages;
create policy "order_messages_staff_read" on public.order_messages
  for select to authenticated using (public.is_staff());

-- A staff row must be stamped as a staff row, written by the account that is
-- actually signed in. Without the WITH CHECK, a staff session could post a
-- message that renders to the customer as if the customer had sent it.
drop policy if exists "order_messages_staff_insert" on public.order_messages;
create policy "order_messages_staff_insert" on public.order_messages
  for insert to authenticated
  with check (
    public.is_staff()
    and sender = 'staff'
    and staff_id = auth.uid()
    and public.chat_is_open_for(order_id)
  );

-- Marking a thread read is the only update anyone makes here. A message's body
-- is never editable, by either side.
drop policy if exists "order_messages_staff_mark_read" on public.order_messages;
create policy "order_messages_staff_mark_read" on public.order_messages
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- ------------------------------------------------------------- guest write

create or replace function public.send_order_message(
  p_order_id uuid,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_body text := trim(coalesce(p_body, ''));
  v_total integer;
  v_message public.order_messages;
begin
  select * into v_order from public.orders where id = p_order_id;

  if not found then
    raise exception 'Order not found.' using errcode = 'no_data_found';
  end if;

  -- The gate. Everything else in this function is housekeeping.
  if not public.chat_is_open(
    v_order.order_channel, v_order.approved_at,
    v_order.completed_at, v_order.cancelled_at
  ) then
    raise exception 'This conversation is closed.' using errcode = '42501';
  end if;

  if v_body = '' then
    raise exception 'Write something first.' using errcode = 'check_violation';
  end if;

  if char_length(v_body) > 1000 then
    raise exception 'That message is too long.' using errcode = 'check_violation';
  end if;

  -- Two cheap ceilings. The order behind this thread was approved by a human,
  -- so the abuse surface is small — but a stuck client retrying in a loop
  -- should not be able to fill a table with it.
  if exists (
    select 1 from public.order_messages
    where order_id = p_order_id
      and sender = 'customer'
      and created_at > now() - interval '2 seconds'
  ) then
    raise exception 'Give us a moment to read the last one.'
      using errcode = 'check_violation';
  end if;

  select count(*) into v_total from public.order_messages where order_id = p_order_id;

  if v_total >= 200 then
    raise exception 'This conversation has reached its limit. Please call the shop.'
      using errcode = 'check_violation';
  end if;

  insert into public.order_messages (order_id, sender, body)
  values (p_order_id, 'customer', v_body)
  returning * into v_message;

  return jsonb_build_object(
    'id', v_message.id,
    'sender', v_message.sender,
    'body', v_message.body,
    'created_at', v_message.created_at
  );
end;
$$;

grant execute on function public.send_order_message(uuid, text) to anon, authenticated;

-- -------------------------------------------------------------- guest read

-- staff_id is not in this projection and must never be added to it: to the
-- customer, every reply comes from "Pause Coffee".
create or replace function public.get_order_messages(p_order_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id;

  if not found then
    return '[]'::jsonb;
  end if;

  if not public.chat_is_open(
    v_order.order_channel, v_order.approved_at,
    v_order.completed_at, v_order.cancelled_at
  ) then
    return '[]'::jsonb;
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', m.id,
      'sender', m.sender,
      'body', m.body,
      'created_at', m.created_at
    ) order by m.created_at)
    from public.order_messages m
    where m.order_id = p_order_id
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.get_order_messages(uuid) to anon, authenticated;

-- ----------------------------------------------------------- live delivery

-- Both sides write through different doors — the guest through the RPC above,
-- staff through the table's own insert policy — so the broadcast lives on the
-- table, where neither can bypass it.
--
-- The payload carries no body, exactly as 0005's status broadcast carries no
-- customer name: it is a hint that says "read again", and the RPC remains the
-- only path that will actually hand a guest the text.
create or replace function public.broadcast_order_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform realtime.send(
    jsonb_build_object('order_id', new.order_id, 'sender', new.sender),
    'message',
    'order:' || new.order_id::text,
    false
  );
  return new;
end;
$$;

drop trigger if exists order_messages_broadcast on public.order_messages;
create trigger order_messages_broadcast
  after insert on public.order_messages
  for each row
  execute function public.broadcast_order_message();

-- Staff hold a select policy here, so postgres_changes reaches the admin app
-- the same way the queue board already receives orders.
do $$
begin
  alter publication supabase_realtime add table public.order_messages;
exception
  when duplicate_object then null;
end
$$;

-- ------------------------------------------------------------ staff inbox

-- One row per conversation, so /admin/messages is a single query rather than a
-- fetch per order. security_invoker keeps the caller's RLS in force — without
-- it a view runs as its owner and would hand every conversation to the anon key.
drop view if exists public.order_message_threads;
create view public.order_message_threads
with (security_invoker = on) as
select
  o.id as order_id,
  o.order_number,
  o.customer_name,
  o.contact_phone,
  o.status,
  o.order_type,
  public.chat_is_open(
    o.order_channel, o.approved_at, o.completed_at, o.cancelled_at
  ) as chat_open,
  count(*) as message_count,
  count(*) filter (where m.sender = 'customer' and not m.read_by_staff) as unread_count,
  max(m.created_at) as last_message_at,
  (
    select x.body
    from public.order_messages x
    where x.order_id = o.id
    order by x.created_at desc
    limit 1
  ) as last_message_body,
  (
    select x.sender
    from public.order_messages x
    where x.order_id = o.id
    order by x.created_at desc
    limit 1
  ) as last_message_sender
from public.orders o
join public.order_messages m on m.order_id = o.id
group by o.id;

grant select on public.order_message_threads to authenticated;
