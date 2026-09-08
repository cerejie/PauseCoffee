-- Pause Coffee — hot or iced moves from the category to the price row.
--
-- `categories.has_temperature` was one switch for a whole menu section, which
-- could not say that a 16oz Spanish Latte is iced-only while the 12oz beside it
-- goes both ways. The question now belongs to `product_sizes`, alongside the
-- price it is set with, and the options drawer reads it from the size the
-- customer has chosen.
--
-- `categories.has_temperature` is deliberately left in place: dropping it would
-- take data no longer readable anywhere else, and nothing reads it after this.
-- `has_sweetness` stays a category-level question and is untouched.



do $$
begin
  if not exists (select 1 from pg_type where typname = 'serve_temperature') then
    create type public.serve_temperature as enum ('hot', 'iced', 'both');
  end if;
end
$$;

-- Null means the tier is not a drink and no temperature is ever asked for or
-- stamped on the receipt. The default is 'both' so a price row written without
-- an opinion — the menu seed in 0004 — behaves as it always did; the item form
-- sends an explicit null for food.
alter table public.product_sizes
  add column if not exists serve_temperature public.serve_temperature default 'both';

-- Every existing row took that default. The categories that were not asking the
-- question have it cleared again, so nothing on the menu starts offering a
-- choice it did not offer yesterday.
update public.product_sizes ps
set serve_temperature = null
from public.products p
join public.categories c on c.id = p.category_id
where p.id = ps.product_id
  and not c.has_temperature
  and ps.serve_temperature is not null;

-- ------------------------------------------------------------- place_order
--
-- Reprinted from 0002 with one change: the temperature on a line is decided by
-- the size row rather than by the category.

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

    -- Options that are not on offer are dropped rather than rejected, so a
    -- stale cart still checks out with a sane line. Temperature is settled by
    -- the size: a hot-only tier is stamped hot whatever the client sent, and
    -- only a 'both' tier takes the customer's pick.
    v_temp := case
      when v_size.serve_temperature = 'both'
        then (v_item ->> 'temperature')::public.beverage_temperature
      when v_size.serve_temperature is null then null
      else v_size.serve_temperature::text::public.beverage_temperature
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