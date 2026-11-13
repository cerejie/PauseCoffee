-- Pause Coffee — a shop-wide discount the owner can switch on and off.
--
-- One discount, on every drink, set from the admin's Settings → Discount tab.
-- Either a percentage off or a fixed number of pesos off EACH CUP. It applies
-- to the drink's size price only; add-ons are charged in full.
--
-- The menu shows the old price struck through, but the screen is not where the
-- discount happens. The client never sends a price (0002), so place_order
-- reads these columns and discounts every line itself. A customer whose cart
-- still says ₱135 after the shop switched the discount off is charged ₱150 —
-- the database is the price list, the screen is only a preview of it.
--
-- The arithmetic here is mirrored, rounding included, by
-- src/utils/discount.utils.ts. Change one, change the other.

-- ------------------------------------------------------------ settings

alter table public.app_settings
  add column if not exists discount_enabled boolean not null default false,
  add column if not exists discount_type text not null default 'percent',
  add column if not exists discount_value numeric(10, 2) not null default 0;

alter table public.app_settings
  drop constraint if exists app_settings_discount_type_check;
alter table public.app_settings
  add constraint app_settings_discount_type_check
  check (discount_type in ('percent', 'amount'));

-- A percentage is out of a hundred; an amount is anything not negative (an
-- amount bigger than a drink simply makes that drink free, never negative).
alter table public.app_settings
  drop constraint if exists app_settings_discount_value_check;
alter table public.app_settings
  add constraint app_settings_discount_value_check
  check (
    discount_value >= 0
    and (discount_type = 'amount' or discount_value <= 100)
  );

comment on column public.app_settings.discount_type is
  '''percent'' = discount_value percent off each drink; ''amount'' = discount_value '
  'pesos off each drink. Add-ons are never discounted.';

-- ---------------------------------------------------------- order record

-- What the discount was worth on this order. subtotal stays the undiscounted
-- sum, so total = subtotal - discount_total and a receipt can show both.
alter table public.orders
  add column if not exists discount_total numeric(10, 2) not null default 0;

-- The size's price before the discount. unit_price is what was charged. Null
-- on rows placed before this migration, where the two were the same thing.
alter table public.order_items
  add column if not exists list_price numeric(10, 2);

-- ------------------------------------------------------- discounted_price

-- The one place the rule is written down in SQL. Immutable so it can be read
-- as a formula: given a price and a discount, the answer never changes.
create or replace function public.discounted_price(
  p_price numeric,
  p_type text,
  p_value numeric
)
returns numeric
language sql
immutable
as $$
  select case
    when p_value is null or p_value <= 0 then p_price
    when p_type = 'percent' then
      greatest(round(p_price * (100 - least(p_value, 100)) / 100, 2), 0)
    when p_type = 'amount' then
      greatest(p_price - p_value, 0)
    else p_price
  end;
$$;

-- ------------------------------------------------------------ place_order
--
-- Reproduced from 0020 with one change: each line's size price is discounted
-- from the settings row before it is charged. Everything else — the channel
-- rules, the receipt checks, the device id — is exactly as 0020 left it.

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

  -- The discount, read once per order so every line gets the same one.
  v_discount_type text := 'percent';
  v_discount_value numeric(10, 2) := 0;
  v_unit_price numeric(10, 2);

  v_subtotal numeric(10, 2) := 0;
  v_discount_total numeric(10, 2) := 0;
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

  -- ------------------------------------------------------------ discount

  -- Switched off, or the settings row missing, means no discount: prices fall
  -- back to the list rather than the order failing.
  select s.discount_type, s.discount_value
  into v_discount_type, v_discount_value
  from public.app_settings s
  where s.id and s.discount_enabled;

  if not found then
    v_discount_value := 0;
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

    -- The drink is discounted, the add-ons are not.
    v_unit_price := public.discounted_price(v_size.price, v_discount_type, v_discount_value);
    v_line_total := (v_unit_price + v_addons_total) * v_qty;

    insert into public.order_items (
      order_id, product_id, product_name, size_label, temperature, sweetness,
      unit_price, list_price, addons, addons_total, quantity, line_total, notes,
      sort_order
    )
    values (
      v_order.id, v_product.id, v_product.name, v_size.label, v_temp, v_sweetness,
      v_unit_price, v_size.price, v_addons, v_addons_total, v_qty, v_line_total,
      nullif(trim(coalesce(v_item ->> 'notes', '')), ''), v_index
    );

    v_subtotal := v_subtotal + (v_size.price + v_addons_total) * v_qty;
    v_discount_total := v_discount_total + (v_size.price - v_unit_price) * v_qty;
    v_count := v_count + v_qty;
  end loop;

  -- Delivery is arranged and settled with the rider, so there is no fee to add.
  -- subtotal is before the discount; total is what the customer pays.
  update public.orders
  set subtotal = v_subtotal,
      discount_total = v_discount_total,
      total = v_subtotal - v_discount_total,
      item_count = v_count
  where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

grant execute on function public.place_order(jsonb) to anon, authenticated;
