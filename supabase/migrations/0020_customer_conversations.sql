-- Pause Coffee — one conversation per customer, on both sides of the glass.
--
-- Until now a "thread" was an order. That is the wrong unit for the people
-- using it. The shop sees a person, not a ticket: somebody who ordered on
-- Tuesday and again on Friday is one conversation with two orders in it, and
-- splitting them across two inbox rows loses the context that makes the reply
-- useful. And the customer sees one shop — their line to the counter should
-- not empty out because the last order closed.
--
-- So there are two groupings here, because the two sides know different things
-- about who they are talking to:
--
--   * staff group by contact_phone. Every online order carries one (0013's
--     orders_online_payment_check), normalised to +639XXXXXXXXX, so it is the
--     one durable name the shop has for a guest.
--   * the guest groups by device_id — a random uuid their browser keeps in
--     localStorage and sends with each order. A browser cannot read a MAC
--     address, or any other hardware identifier; nothing on the web platform
--     exposes one. A uuid the app mints itself is the honest equivalent, and
--     it is exactly the capability model the tracker already runs on: holding
--     the id is the permission, as holding an order's uuid is (0003).
--
-- The retention window is unchanged and still the only clock. A device sees a
-- conversation for precisely as long as chat_is_open() says it exists, 0017
-- deletes the messages behind it on the same schedule, and the device_id is
-- forgotten with them — the order row survives as sales history, the pointer
-- to somebody's phone does not.

-- ------------------------------------------------------------- device_id

alter table public.orders add column if not exists device_id uuid;

comment on column public.orders.device_id is
  'Random uuid minted by the customer''s browser, not a hardware identifier. '
  'Lets one device reopen its own conversation across several orders. Cleared '
  'by purge_online_data() one retention period after the order ends.';

-- The guest's read and write both start from this column, and the purge sweeps
-- it; neither may become a table scan.
create index if not exists orders_device_id_idx
  on public.orders (device_id, placed_at desc)
  where device_id is not null;

create index if not exists orders_device_purge_idx
  on public.orders (coalesce(completed_at, cancelled_at))
  where device_id is not null;

-- ------------------------------------------------------------ place_order
--
-- Reproduced from 0015 with one addition: the payload may name the device that
-- placed the order. It is stored as sent and never trusted for anything but
-- reuniting a phone with its own thread — it grants no more than the order id
-- the same client already holds.

create or replace function public.place_order(payload jsonb)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_name text := trim(coalesce(payload ->> 'customer_name', ''));
  v_type public.order_type := coalesce((payload ->> 'order_type')::public.order_type, 'take_out');
  v_notes text := nullif(trim(coalesce(payload ->> 'notes', '')), '');
  v_items jsonb := coalesce(payload -> 'items', '[]'::jsonb);
  v_item jsonb;
  v_index integer := 0;

  -- Online-only. All null for an in-store order, which is paid at the counter.
  v_channel public.order_channel :=
    coalesce((payload ->> 'order_channel')::public.order_channel, 'in_store');
  v_is_online boolean := false;
  v_method public.payment_method;
  v_reference text;
  v_proof text;
  v_phone text;
  v_address text;
  v_landmark text;
  v_lat numeric(9, 6);
  v_lng numeric(9, 6);
  v_status public.order_status;
  -- Not online-only: an in-store order placed on the same phone is still that
  -- phone's order, and the column costs nothing on a row that never chats.
  v_device uuid := nullif(payload ->> 'device_id', '')::uuid;

  v_product public.products;
  v_size public.product_sizes;
  v_category public.categories;
  v_qty integer;
  v_temp public.beverage_temperature;
  v_sweetness text;
  v_addon_ids uuid[];
  v_addons jsonb;
  v_addons_total numeric(10, 2);
  v_line_total numeric(10, 2);

  v_subtotal numeric(10, 2) := 0;
  v_count integer := 0;
begin
  v_is_online := v_channel = 'online';

  if v_name = '' then
    raise exception 'A name is required to place an order.'
      using errcode = 'check_violation';
  end if;

  if jsonb_array_length(v_items) = 0 then
    raise exception 'Cannot place an empty order.'
      using errcode = 'check_violation';
  end if;

  if jsonb_array_length(v_items) > 40 then
    raise exception 'An order cannot contain more than 40 lines.'
      using errcode = 'check_violation';
  end if;

  -- ------------------------------------------------------- channel rules

  -- Delivery is an online-only fulfilment, and dine-in an in-store one. Caught
  -- here so a tampered payload gets a sentence rather than a constraint name.
  if not v_is_online and v_type not in ('dine_in', 'take_out') then
    raise exception 'That is not something the counter can serve.'
      using errcode = 'check_violation';
  end if;

  if v_is_online then
    if v_type not in ('delivery', 'take_out') then
      raise exception 'An online order is either delivered or collected.'
        using errcode = 'check_violation';
    end if;

    v_method := nullif(payload ->> 'payment_method', '')::public.payment_method;
    if v_method is null then
      raise exception 'Tell us which wallet you paid from.'
        using errcode = 'check_violation';
    end if;

    v_phone := public.normalize_ph_mobile(payload ->> 'contact_phone');
    if v_phone is null then
      raise exception 'That mobile number does not look right. Use 09XX XXX XXXX.'
        using errcode = 'check_violation';
    end if;

    v_reference := nullif(trim(coalesce(payload ->> 'payment_reference', '')), '');
    v_proof := nullif(trim(coalesce(payload ->> 'payment_proof_path', '')), '');

    -- The requirement, enforced where it cannot be skipped: no receipt, no
    -- order. The client cannot satisfy this by lying, because the next three
    -- checks look at the object store rather than at the payload.
    if v_proof is null then
      raise exception 'Upload the receipt for your payment before ordering.'
        using errcode = 'check_violation';
    end if;

    if v_proof !~ '^proofs/' then
      raise exception 'That receipt is not in the right place.'
        using errcode = 'check_violation';
    end if;

    if not exists (
      select 1 from storage.objects
      where bucket_id = 'payment-proofs' and name = v_proof
    ) then
      raise exception 'We could not find that receipt. Please upload it again.'
        using errcode = 'no_data_found';
    end if;

    -- One receipt proves one payment. Without this, a screenshot could be
    -- replayed across as many orders as somebody cared to submit.
    if exists (select 1 from public.orders where payment_proof_path = v_proof) then
      raise exception 'That receipt has already been used for another order.'
        using errcode = 'unique_violation';
    end if;

    -- Already condemned by 0017 (orphaned, or belonged to a purged order).
    if exists (
      select 1 from public.storage_purge_queue
      where bucket = 'payment-proofs' and path = v_proof
    ) then
      raise exception 'That receipt has expired. Please upload it again.'
        using errcode = 'check_violation';
    end if;

    if v_type = 'delivery' then
      v_address := nullif(trim(coalesce(payload ->> 'delivery_address', '')), '');
      v_landmark := nullif(trim(coalesce(payload ->> 'delivery_landmark', '')), '');
      v_lat := nullif(payload ->> 'delivery_lat', '')::numeric;
      v_lng := nullif(payload ->> 'delivery_lng', '')::numeric;

      if v_address is null or v_lat is null or v_lng is null then
        raise exception 'Drop a pin on the map so we know where to deliver.'
          using errcode = 'check_violation';
      end if;
    end if;
  end if;

  -- An online order is not work for the barista until a human has looked at the
  -- payment. Note that 'awaiting_approval' is not one of the queue statuses, so
  -- this ticket cannot appear on the board no matter what the client does.
  v_status := case when v_is_online then 'awaiting_approval' else 'pending' end;

  insert into public.orders (
    order_number, customer_name, order_type, notes, status,
    order_channel, payment_method, payment_reference, payment_proof_path,
    contact_phone, delivery_address, delivery_landmark, delivery_lat, delivery_lng,
    device_id
  )
  values (
    public.next_order_number(), left(v_name, 60), v_type, left(v_notes, 400), v_status,
    v_channel, v_method, left(v_reference, 60), v_proof,
    v_phone, left(v_address, 240), left(v_landmark, 120), v_lat, v_lng,
    v_device
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(v_items)
  loop
    v_index := v_index + 1;

    v_qty := coalesce((v_item ->> 'quantity')::integer, 0);
    if v_qty < 1 or v_qty > 50 then
      raise exception 'Invalid quantity on line %.', v_index
        using errcode = 'check_violation';
    end if;

    select * into v_size
    from public.product_sizes
    where id = (v_item ->> 'size_id')::uuid and is_active;

    if not found then
      raise exception 'That size is no longer available (line %).', v_index
        using errcode = 'no_data_found';
    end if;

    select * into v_product
    from public.products
    where id = v_size.product_id and is_active;

    if not found then
      raise exception 'That item is no longer available (line %).', v_index
        using errcode = 'no_data_found';
    end if;

    select * into v_category from public.categories where id = v_product.category_id;

    -- Options the category does not offer are dropped rather than rejected, so
    -- a stale cart still checks out with a sane line.
    v_temp := case
      when v_category.has_temperature then (v_item ->> 'temperature')::public.beverage_temperature
      else null
    end;
    v_sweetness := case
      when v_category.has_sweetness then nullif(trim(coalesce(v_item ->> 'sweetness', '')), '')
      else null
    end;

    select coalesce(array_agg(value::text::uuid), '{}')
    into v_addon_ids
    from jsonb_array_elements_text(coalesce(v_item -> 'addon_ids', '[]'::jsonb)) as value;

    -- Only add-ons this category actually offers are priced in.
    select
      coalesce(jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name, 'price', a.price)
        order by a.sort_order), '[]'::jsonb),
      coalesce(sum(a.price), 0)
    into v_addons, v_addons_total
    from public.addons a
    join public.category_addons ca
      on ca.addon_id = a.id and ca.category_id = v_category.id
    where a.id = any (v_addon_ids) and a.is_active;

    v_line_total := (v_size.price + v_addons_total) * v_qty;

    insert into public.order_items (
      order_id, product_id, product_name, size_label, temperature, sweetness,
      unit_price, addons, addons_total, quantity, line_total, notes, sort_order
    )
    values (
      v_order.id, v_product.id, v_product.name, v_size.label, v_temp, v_sweetness,
      v_size.price, v_addons, v_addons_total, v_qty, v_line_total,
      nullif(trim(coalesce(v_item ->> 'notes', '')), ''), v_index
    );

    v_subtotal := v_subtotal + v_line_total;
    v_count := v_count + v_qty;
  end loop;

  -- Delivery is arranged and settled with the rider, so there is no fee to add:
  -- the total is still the sum of the lines, priced here and nowhere else.
  update public.orders
  set subtotal = v_subtotal,
      total = v_subtotal,
      item_count = v_count
  where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;

-- ------------------------------------------------------------ staff inbox

-- Superseded by customer_message_threads below. Dropped rather than left
-- beside it: two aggregates over the same rows is two answers to the question
-- "what is unread", and the badge in AdminLayout can only read one of them.
drop view if exists public.order_message_threads;

-- One row per customer, with their orders folded in as jsonb so the inbox is
-- still a single round trip. security_invoker keeps the caller's RLS in force —
-- without it the view runs as its owner and hands every conversation in the
-- shop to the anon key.
create view public.customer_message_threads
with (security_invoker = on) as
with per_order as (
  select
    -- A phone is what a guest is called here. The fallback is unreachable
    -- today (chat needs an online order, and 0013 requires a number on one)
    -- and exists so a future channel without one becomes its own conversation
    -- rather than collapsing every phoneless order into a single thread.
    coalesce(o.contact_phone, o.id::text) as customer_key,
    o.id as order_id,
    o.order_number,
    o.contact_phone,
    o.customer_name,
    o.status,
    o.order_type,
    o.placed_at,
    public.chat_is_open(
      o.order_channel, o.approved_at, o.completed_at, o.cancelled_at
    ) as chat_open,
    count(*)::int as message_count,
    count(*) filter (
      where m.sender = 'customer' and not m.read_by_staff
    )::int as unread_count,
    max(m.created_at) as last_message_at,
    (
      select x.body from public.order_messages x
      where x.order_id = o.id order by x.created_at desc limit 1
    ) as last_body,
    (
      select x.sender from public.order_messages x
      where x.order_id = o.id order by x.created_at desc limit 1
    ) as last_sender
  from public.orders o
  join public.order_messages m on m.order_id = o.id
  group by o.id
)
select
  t.customer_key,
  -- The most recent order is the one that says what to call them and where to
  -- ring them: a name typed today beats the same person's typo from Tuesday.
  (array_agg(t.contact_phone order by t.placed_at desc))[1] as contact_phone,
  (array_agg(t.customer_name order by t.placed_at desc))[1] as customer_name,
  count(*)::int as order_count,
  sum(t.message_count)::int as message_count,
  sum(t.unread_count)::int as unread_count,
  max(t.last_message_at) as last_message_at,
  (array_agg(t.last_body order by t.last_message_at desc))[1] as last_message_body,
  (array_agg(t.last_sender order by t.last_message_at desc))[1] as last_message_sender,
  bool_or(t.chat_open) as chat_open,
  -- Where a reply lands: the newest order still inside its window. Null when
  -- every one of them has closed, which is what shuts the composer.
  (
    array_agg(t.order_id order by t.placed_at desc) filter (where t.chat_open)
  )[1] as reply_order_id,
  (
    array_agg(t.order_number order by t.placed_at desc) filter (where t.chat_open)
  )[1] as reply_order_number,
  -- What the client reads the thread and marks it read by. Small by
  -- construction: only orders that carry messages reach this view at all.
  array_agg(t.order_id) as order_ids,
  jsonb_agg(jsonb_build_object(
    'order_id', t.order_id,
    'order_number', t.order_number,
    'status', t.status,
    'order_type', t.order_type,
    'chat_open', t.chat_open,
    'placed_at', t.placed_at,
    'message_count', t.message_count
  ) order by t.placed_at) as orders
from per_order t
group by t.customer_key;

grant select on public.customer_message_threads to authenticated;

-- ------------------------------------------------------- guest, by device

-- The same projection get_order_messages returns, plus the order each message
-- belongs to so the app can rule one order off from the next. staff_id is
-- still absent and must stay absent: to the customer every reply is from
-- Pause Coffee.
--
-- Scoped to chat_is_open() exactly as the per-order RPC is, so a conversation
-- is readable for precisely as long as it exists and not one hour longer.
create or replace function public.get_device_messages(p_device_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if p_device_id is null then
    return '[]'::jsonb;
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', m.id,
      'sender', m.sender,
      'body', m.body,
      'created_at', m.created_at,
      'order_id', o.id,
      'order_number', o.order_number
    ) order by m.created_at)
    from public.order_messages m
    join public.orders o on o.id = m.order_id
    where o.device_id = p_device_id
      and public.chat_is_open(
        o.order_channel, o.approved_at, o.completed_at, o.cancelled_at
      )
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.get_device_messages(uuid) to anon, authenticated;

-- A message from the device rather than from a particular order. It attaches
-- to the newest order still open — the same one the staff inbox replies to, so
-- neither side has to explain which ticket a line belongs to.
--
-- Every rule stays in send_order_message: the throttle, the length cap, the
-- 200-message ceiling and the open-thread gate are enforced there once, and
-- this function only decides which order to hand it.
create or replace function public.send_device_message(
  p_device_id uuid,
  p_body text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  select o.id into v_order_id
  from public.orders o
  where o.device_id = p_device_id
    and public.chat_is_open(
      o.order_channel, o.approved_at, o.completed_at, o.cancelled_at
    )
  order by o.placed_at desc
  limit 1;

  if v_order_id is null then
    raise exception 'This conversation is closed.' using errcode = '42501';
  end if;

  return public.send_order_message(v_order_id, p_body);
end;
$$;

grant execute on function public.send_device_message(uuid, text) to anon, authenticated;

-- ------------------------------------------------------------ adoption

-- Binds an order to the device that is looking at it, but only one that has
-- never been bound. Two cases need this and neither is exotic: an order placed
-- before this file existed, whose conversation would otherwise read as empty
-- for the day it stays open, and a tracker link opened on a phone that has
-- cleared its storage or is not the one that ordered.
--
-- It hands out nothing new. The caller already holds the order's uuid, which
-- has been the whole of the guest's capability since 0003 — this only lets the
-- thread it already grants be found again after a refresh. An order somebody
-- else's device has claimed is never re-assigned, and a closed one is never
-- claimed at all, so a finished order cannot be adopted to reopen its history.
create or replace function public.claim_order_device(
  p_order_id uuid,
  p_device_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_order_id is null or p_device_id is null then
    return false;
  end if;

  update public.orders
  set device_id = p_device_id
  where id = p_order_id
    and device_id is null
    and public.chat_is_open(
      order_channel, approved_at, completed_at, cancelled_at
    );

  return found;
end;
$$;

grant execute on function public.claim_order_device(uuid, uuid) to anon, authenticated;

-- ---------------------------------------------------------------- retention
--
-- purge_online_data() reproduced from 0017 with one statement added: the
-- device that placed an order is forgotten when its conversation is, on the
-- same cutoff and in the same pass. Nothing else in the function changes, and
-- the hourly schedule 0017 created still points at this name.

create or replace function public.purge_online_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_cutoff timestamptz := v_now - public.online_retention();
  v_cleared integer := 0;
  v_messages integer := 0;
  v_receipts integer := 0;
  v_expired integer := 0;
  v_purged integer := 0;
  v_orphans integer := 0;
  v_sent integer := 0;
begin
  -- 1. Confirm. Anything that has actually left the object store leaves the
  --    queue with it. This is the only place a queue row is ever cleared.
  delete from public.storage_purge_queue q
  where not exists (
    select 1 from storage.objects o
    where o.bucket_id = q.bucket and o.name = q.path
  );
  get diagnostics v_cleared = row_count;

  -- 2. Conversations on orders that ended more than one retention period ago.
  --    Same window as chat_is_open(), so no thread is ever readable-but-empty.
  delete from public.order_messages m
  using public.orders o
  where o.id = m.order_id
    and coalesce(o.completed_at, o.cancelled_at) < v_cutoff;
  get diagnostics v_messages = row_count;

  -- 2b. And the device behind them. The order row is sales history and stays;
  --     the uuid that ties it to somebody's phone has nothing left to reopen,
  --     so it does not outlive the conversation it existed for.
  update public.orders
  set device_id = null
  where device_id is not null
    and coalesce(completed_at, cancelled_at) < v_cutoff;

  -- 3. Receipts on finished orders. The order, its lines and its payment
  --    reference all stay — that is the sales history. Only the image goes.
  with due as (
    select id, payment_proof_path
    from public.orders
    where order_channel = 'online'
      and payment_proof_path is not null
      and coalesce(completed_at, cancelled_at) < v_cutoff
    limit 500
  ),
  -- A data-modifying CTE runs to completion whether or not the outer query
  -- reads it, so the paths are condemned before the pointers are dropped.
  condemned as (
    insert into public.storage_purge_queue (bucket, path)
    select 'payment-proofs', payment_proof_path from due
    on conflict (bucket, path) do nothing
    returning 1
  )
  update public.orders o
  set payment_proof_path = null
  from due
  where o.id = due.id;
  get diagnostics v_receipts = row_count;

  -- 4. Orders nobody ever reviewed. Without this, a weekend where the shop
  --    never opened the admin app leaves receipts sitting indefinitely. The
  --    customer gets a real reason rather than a ticket that simply rots.
  update public.orders
  set status = 'rejected',
      rejected_at = v_now,
      rejection_reason = 'We did not get to this order in time. Message us and we will sort out a refund.'
  where status = 'awaiting_approval'
    and placed_at < v_cutoff;
  get diagnostics v_expired = row_count;

  if v_expired > 0 then
    insert into public.storage_purge_queue (bucket, path)
    select 'payment-proofs', payment_proof_path
    from public.orders
    where status = 'rejected'
      and rejected_at = v_now
      and payment_proof_path is not null
    on conflict (bucket, path) do nothing;
  end if;

  -- 5. Rejected orders, logged and then gone. Their receipts were condemned
  --    when the rejection happened (0015) or in step 4 above.
  with gone as (
    delete from public.orders
    where status = 'rejected'
      and rejected_at < v_cutoff
    returning order_number, rejected_at, rejected_by, rejection_reason
  )
  insert into public.rejected_order_log (order_number, rejected_at, rejected_by, reason)
  select order_number, rejected_at, rejected_by, rejection_reason from gone;
  get diagnostics v_purged = row_count;

  -- 6. Uploads that never became an order — someone picked a receipt and then
  --    closed the tab. Two hours is generous for a checkout still in progress.
  --    This step is also the safety net for every other one: an object whose
  --    order has gone but whose delete never landed reappears here next hour.
  insert into public.storage_purge_queue (bucket, path)
  select 'payment-proofs', o.name
  from storage.objects o
  where o.bucket_id = 'payment-proofs'
    and o.created_at < v_now - interval '2 hours'
    and not exists (
      select 1 from public.orders x where x.payment_proof_path = o.name
    )
  limit 500
  on conflict (bucket, path) do nothing;
  get diagnostics v_orphans = row_count;

  -- 7. Fire the actual deletions for everything condemned so far.
  v_sent := public.drain_storage_purge_queue();

  return jsonb_build_object(
    'ran_at', v_now,
    'queue_rows_cleared', v_cleared,
    'messages_deleted', v_messages,
    'receipts_condemned', v_receipts,
    'orders_auto_rejected', v_expired,
    'rejected_orders_purged', v_purged,
    'orphans_found', v_orphans,
    'delete_requests_sent', v_sent
  );
end;
$$;

revoke execute on function public.purge_online_data() from public, anon;

-- The hourly job from 0017 calls this function by name and is untouched; there
-- is nothing to reschedule.
