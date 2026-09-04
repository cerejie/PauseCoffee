-- Order placement. The RPC is the security boundary: the client sends only
-- *what* it wants (ids and quantities) and the server prices it from the menu
-- tables, so a tampered payload cannot buy a 250-peso latte for 1 peso.

-- ------------------------------------------------- daily claim-code sequence

create table public.order_counters (
  business_day date primary key,
  last_number integer not null default 0
);

create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'Asia/Manila')::date;
  v_seq integer;
begin
  -- One statement, so two simultaneous checkouts serialize on the row lock
  -- instead of racing to the same claim code.
  insert into public.order_counters (business_day, last_number)
  values (v_day, 1)
  on conflict (business_day)
    do update set last_number = public.order_counters.last_number + 1
  returning last_number into v_seq;

  return 'PC-' || to_char(v_day, 'MMDD') || '-' || lpad(v_seq::text, 3, '0');
end;
$$;

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

  insert into public.orders (order_number, customer_name, order_type, notes)
  values (public.next_order_number(), left(v_name, 60), v_type, left(v_notes, 400))
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

-- --------------------------------------------------- queue status transition

-- Advancing a ticket has to stamp the matching timestamp; leaving that to the
-- client means the queue's wait times drift the moment someone patches a row.
create or replace function public.set_order_status(
  p_order_id uuid,
  p_status public.order_status,
  p_reason text default null
)
returns public.orders
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order public.orders;
begin
  update public.orders
  set status = p_status,
      accepted_at  = case when p_status = 'preparing' then coalesce(accepted_at, now()) else accepted_at end,
      ready_at     = case when p_status = 'ready' then coalesce(ready_at, now()) else ready_at end,
      completed_at = case when p_status = 'completed' then now() else completed_at end,
      cancelled_at = case when p_status = 'cancelled' then now() else cancelled_at end,
      cancel_reason = case when p_status = 'cancelled' then nullif(trim(coalesce(p_reason, '')), '') else cancel_reason end
  where id = p_order_id
  returning * into v_order;

  if not found then
    raise exception 'Order not found.' using errcode = 'no_data_found';
  end if;

  return v_order;
end;
$$;

grant execute on function public.set_order_status(uuid, public.order_status, text) to authenticated;

-- --------------------------------------------------- guest order lookup

-- The tracker screen's read path. Anonymous users have no select policy on
-- orders (see 0003), so holding the uuid is the whole capability — this returns
-- one order plus its lines and nothing else.
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
    -- How many tickets are ahead of this one in the queue.
    'queue_position', (
      select count(*)
      from public.orders q
      where q.status in ('pending', 'preparing')
        and q.placed_at < o.placed_at
    )
  )
  from public.orders o
  where o.id = p_order_id;
$$;

grant execute on function public.get_order(uuid) to anon, authenticated;
