-- Pause Coffee — the online ordering columns.
--
-- The customer app at / and the online app at /order-online write to the same
-- orders table; `order_channel` is the only thing that separates them, and
-- every rule that differs is expressed as a constraint here rather than as a
-- form rule in the client. An online order with no proof of payment is not
-- something the client is discouraged from sending — it is something the
-- database cannot store.
--
-- Requires 0012 to have COMMITTED (it uses the enum values 0012 adds).

-- ------------------------------------------------------------- retention

-- The single source of the 24-hour number. The chat window in 0016 and the
-- purge job in 0017 both read this, so the conversation can never outlive the
-- messages it displays, or vice versa.
create or replace function public.online_retention()
returns interval
language sql
immutable
as $$
  select interval '24 hours';
$$;

comment on function public.online_retention() is
  'How long an online order keeps its receipt image and its chat thread after '
  'it ends, and how long a rejected order stays readable before it is purged. '
  'Change it here and both 0016 and 0017 follow.';

-- Whether an order's chat thread is open, expressed once so that get_order,
-- both chat RPCs and the staff inbox view cannot disagree about it. Chat exists
-- only for an online order a human has approved, and closes one retention
-- period after the order ends — the same period after which 0017 deletes the
-- messages, so a thread can never outlive the rows it would display.
create or replace function public.chat_is_open(
  p_channel public.order_channel,
  p_approved_at timestamptz,
  p_completed_at timestamptz,
  p_cancelled_at timestamptz
)
returns boolean
language sql
stable
as $$
  select p_channel = 'online'
     and p_approved_at is not null
     and (
       coalesce(p_completed_at, p_cancelled_at) is null
       or coalesce(p_completed_at, p_cancelled_at) > now() - public.online_retention()
     );
$$;

-- ------------------------------------------------------- phone normalising

-- Stored one way so the admin can dial it with a tel: link and so two spellings
-- of the same number are the same string. Philippine mobile only: the shop
-- delivers within one city.
create or replace function public.normalize_ph_mobile(p_input text)
returns text
language plpgsql
immutable
as $$
declare
  v_digits text := regexp_replace(coalesce(p_input, ''), '\D', '', 'g');
begin
  -- 09xxxxxxxxx (11) → strip the 0; 639xxxxxxxxx (12) → strip the 63;
  -- 9xxxxxxxxx (10) → already the subscriber number.
  if v_digits ~ '^09[0-9]{9}$' then
    v_digits := substring(v_digits from 2);
  elsif v_digits ~ '^639[0-9]{9}$' then
    v_digits := substring(v_digits from 3);
  end if;

  if v_digits ~ '^9[0-9]{9}$' then
    return '+63' || v_digits;
  end if;

  -- Unrecognised. The caller decides whether that is fatal; the column's own
  -- check constraint refuses to store it either way.
  return null;
end;
$$;

-- ------------------------------------------------------------------ orders

alter table public.orders
  add column if not exists order_channel public.order_channel not null default 'in_store',
  add column if not exists payment_method public.payment_method,
  add column if not exists payment_reference text,
  add column if not exists payment_proof_path text,
  add column if not exists contact_phone text,
  add column if not exists delivery_address text,
  add column if not exists delivery_landmark text,
  add column if not exists delivery_lat numeric(9, 6),
  add column if not exists delivery_lng numeric(9, 6),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references public.profiles (id) on delete set null,
  add column if not exists rejected_at timestamptz,
  add column if not exists rejected_by uuid references public.profiles (id) on delete set null,
  add column if not exists rejection_reason text;

comment on column public.orders.payment_proof_path is
  'Object path inside the PRIVATE "payment-proofs" bucket. Nulled by 0017 once '
  'the image has been queued for deletion, so a null here on an online order '
  'means the receipt has been purged, not that one was never uploaded.';

-- When the ticket entered the barista's queue, which for an online order is
-- when it was approved and not when it was submitted. Without this, an order
-- placed at 9am and approved at 11am would sort ahead of every walk-in that
-- arrived in between and jump the queue by two hours.
-- Added and backfilled inside one guard rather than with `if not exists` plus a
-- blind update: re-running this file after an online order had been approved
-- would otherwise reset that ticket's queued_at back to when it was submitted.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'orders'
      and column_name = 'queued_at'
  ) then
    alter table public.orders
      add column queued_at timestamptz not null default now();

    update public.orders set queued_at = placed_at;
  end if;
end
$$;

-- ------------------------------------------------------------- constraints

-- Every online order carries proof of payment, the wallet it was paid from,
-- and a number the shop can ring. This is the requirement, stated once, where
-- no client can route around it.
alter table public.orders drop constraint if exists orders_online_payment_check;
alter table public.orders add constraint orders_online_payment_check check (
  order_channel = 'in_store'
  or (
    payment_method is not null
    and char_length(trim(coalesce(contact_phone, ''))) > 0
    -- Null once 0017 has purged the image; never null while the order is live.
    and (payment_proof_path is not null or completed_at is not null
         or cancelled_at is not null or rejected_at is not null)
  )
);

-- ...but only a delivery needs somewhere to deliver to. An online pickup is a
-- take_out that was paid for in advance.
alter table public.orders drop constraint if exists orders_delivery_location_check;
alter table public.orders add constraint orders_delivery_location_check check (
  order_type <> 'delivery'
  or (
    delivery_lat is not null and delivery_lng is not null
    and char_length(trim(coalesce(delivery_address, ''))) > 0
  )
);

alter table public.orders drop constraint if exists orders_delivery_coords_check;
alter table public.orders add constraint orders_delivery_coords_check check (
  (delivery_lat is null or delivery_lat between -90 and 90)
  and (delivery_lng is null or delivery_lng between -180 and 180)
);

alter table public.orders drop constraint if exists orders_contact_phone_check;
alter table public.orders add constraint orders_contact_phone_check check (
  contact_phone is null or contact_phone ~ '^\+639[0-9]{9}$'
);

-- Only in_store may be dine_in, and only online may be a delivery. The channel
-- and the fulfilment cannot drift into a combination the app has no screen for.
alter table public.orders drop constraint if exists orders_channel_type_check;
alter table public.orders add constraint orders_channel_type_check check (
  case order_channel
    when 'in_store' then order_type in ('dine_in', 'take_out')
    when 'online'   then order_type in ('delivery', 'take_out')
  end
);

-- --------------------------------------------------------------- indexes

-- A receipt is proof of exactly one payment. Partial because the column is
-- nulled on purge and many purged orders would otherwise collide.
create unique index if not exists orders_payment_proof_path_key
  on public.orders (payment_proof_path)
  where payment_proof_path is not null;

-- The approval inbox: one status, newest first.
create index if not exists orders_awaiting_approval_idx
  on public.orders (placed_at desc)
  where status = 'awaiting_approval';

-- The queue board's new sort key.
create index if not exists orders_queued_at_idx on public.orders (queued_at);

create index if not exists orders_channel_status_idx
  on public.orders (order_channel, status, placed_at desc);
