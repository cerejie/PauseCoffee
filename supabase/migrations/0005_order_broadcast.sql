-- Live status for the customer's tracker.
--
-- The admin board listens on postgres_changes, which works because staff have a
-- select policy on public.orders. Guests deliberately do not (see 0003), and
-- Realtime honours RLS — so a postgres_changes subscription would simply never
-- fire for them. Instead the row broadcasts its own status change to a public
-- topic named after the order id: holding the uuid stays the whole capability,
-- and the payload carries the status only, never the customer's name.

create or replace function public.broadcast_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform realtime.send(
    jsonb_build_object(
      'id', new.id,
      'status', new.status,
      'ready_at', new.ready_at
    ),
    'status',
    'order:' || new.id::text,
    -- Public topic: an anonymous device can subscribe with only the uuid, which
    -- it already had to know to reach this order at all.
    false
  );
  return new;
end;
$$;

create trigger orders_broadcast_status
  after update of status on public.orders
  for each row
  execute function public.broadcast_order_status();
