-- Pause Coffee — placing, approving and reading an online order.
--
-- place_order stays the one security boundary it always was: the client sends
-- ids and quantities and the server prices every line. Online adds a second
-- boundary of the same kind — the client sends the *path* of a receipt it
-- uploaded, and the server checks that the object is really there, that it
-- belongs to no other order, and that it is not already condemned. A payload
-- naming a receipt that does not exist is refused before an order row is cut.

-- ------------------------------------------------------------- place_order

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
    contact_phone, delivery_address, delivery_landmark, delivery_lat, delivery_lng
  )
  values (
    public.next_order_number(), left(v_name, 60), v_type, left(v_notes, 400), v_status,
    v_channel, v_method, left(v_reference, 60), v_proof,
    v_phone, left(v_address, 240), left(v_landmark, 120), v_lat, v_lng
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

-- ------------------------------------------------------ review_online_order

-- Approve or reject. The two writes are one function because they are one
-- decision, and because both have to be refused for anything that is not still
-- awaiting a decision — a second click on Approve must not re-stamp a ticket
-- the barista has already started.
create or replace function public.review_online_order(
  p_order_id uuid,
  p_approve boolean,
  p_reason text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if not public.is_staff() then
    raise exception 'Only staff can review an online order.'
      using errcode = '42501';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;

  if not found then
    raise exception 'Order not found.' using errcode = 'no_data_found';
  end if;

  if v_order.order_channel <> 'online' then
    raise exception 'Only an online order needs approving.'
      using errcode = 'check_violation';
  end if;

  if v_order.status <> 'awaiting_approval' then
    raise exception 'That order has already been reviewed.'
      using errcode = 'check_violation';
  end if;

  if p_approve then
    -- queued_at is stamped now, not left at placed_at: the ticket joins the
    -- board where it was approved, rather than jumping ahead of every walk-in
    -- that arrived while it was waiting to be looked at.
    update public.orders
    set status = 'pending',
        approved_at = now(),
        approved_by = auth.uid(),
        queued_at = now()
    where id = p_order_id
    returning * into v_order;
  else
    -- The image is condemned here and deleted for real by the admin client in
    -- the same click (it holds a session, and the bucket's delete policy is
    -- what that click uses). This queue row is the fallback for when that call
    -- does not land; 0017 clears it once the object has actually gone.
    perform public.queue_storage_purge('payment-proofs', v_order.payment_proof_path);

    update public.orders
    set status = 'rejected',
        rejected_at = now(),
        rejected_by = auth.uid(),
        rejection_reason = nullif(trim(coalesce(p_reason, '')), '')
    where id = p_order_id
    returning * into v_order;
  end if;

  return v_order;
end;
$$;

revoke execute on function public.review_online_order(uuid, boolean, text) from public, anon;
grant execute on function public.review_online_order(uuid, boolean, text) to authenticated;

-- --------------------------------------------------------------- get_order

-- The tracker's read path, widened for online. It still returns exactly one
-- order to whoever already holds its uuid, and still nothing beyond that
-- customer's own business — note that payment_proof_path is deliberately
-- absent: the receipt is readable only through a staff-signed URL.
create or replace function public.get_order(p_order_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', o.id,
    'order_number', o.order_number,
    'customer_name', o.customer_name,
    'order_type', o.order_type,
    'order_channel', o.order_channel,
    'status', o.status,
    'notes', o.notes,
    'subtotal', o.subtotal,
    'total', o.total,
    'item_count', o.item_count,
    'placed_at', o.placed_at,
    'accepted_at', o.accepted_at,
    'ready_at', o.ready_at,
    'completed_at', o.completed_at,
    'cancelled_at', o.cancelled_at,
    'cancel_reason', o.cancel_reason,
    'payment_method', o.payment_method,
    'payment_reference', o.payment_reference,
    'contact_phone', o.contact_phone,
    'delivery_address', o.delivery_address,
    'delivery_landmark', o.delivery_landmark,
    'delivery_lat', o.delivery_lat,
    'delivery_lng', o.delivery_lng,
    'approved_at', o.approved_at,
    'rejected_at', o.rejected_at,
    'rejection_reason', o.rejection_reason,
    -- Computed here so the client cannot open a composer the server would then
    -- refuse to accept from. The same predicate guards both chat RPCs in 0016.
    'chat_open', public.chat_is_open(
      o.order_channel, o.approved_at, o.completed_at, o.cancelled_at
    ),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id,
        'product_name', i.product_name,
        'size_label', i.size_label,
        'temperature', i.temperature,
        'sweetness', i.sweetness,
        'unit_price', i.unit_price,
        'addons', i.addons,
        'addons_total', i.addons_total,
        'quantity', i.quantity,
        'line_total', i.line_total,
        'notes', i.notes
      ) order by i.sort_order)
      from public.order_items i where i.order_id = o.id
    ), '[]'::jsonb),
    -- Counted against queued_at, so an approved online order sits where it
    -- actually joined the queue rather than where it was submitted.
    'queue_position', (
      select count(*)
      from public.orders q
      where q.status in ('pending', 'preparing')
        and q.queued_at < o.queued_at
    )
  )
  from public.orders o
  where o.id = p_order_id;
$$;

grant execute on function public.get_order(uuid) to anon, authenticated;
