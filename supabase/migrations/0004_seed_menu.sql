-- Menu seed — transcribed from the Pause Coffee printed menus
-- (Signature Coffee / House Blend, Matcha / Hojicha, Milk Based / Fruit Tea).
-- Idempotent: re-running refreshes prices without duplicating rows.

-- ------------------------------------------------------------- categories

insert into public.categories (slug, name, tagline, accent_color, has_temperature, has_sweetness, sort_order)
values
  ('signature-coffee', 'Signature Coffee', 'Savor the rich and unique taste of every cup.', '#8A4B2A', false, false, 1),
  ('house-blend',      'House Blend',      'Enjoy the sweet and creamy taste in every sip.', '#C97B32', true,  false, 2),
  ('matcha',           'Matcha',           'Ceremonial-grade, whisked to order.',            '#4E9A51', false, true,  3),
  ('hojicha',          'Hojicha',          'Roasted green tea, mellow and warming.',         '#A9856B', false, true,  4),
  ('milk-based',       'Milk Based',       'A perfect cup for every mood.',                  '#B07BC4', false, false, 5),
  ('fruit-tea',        'Fruit Tea Refresher', 'Real fruit flavors in every sip.',            '#2E9BB5', false, false, 6)
on conflict (slug) do update
  set name = excluded.name,
      tagline = excluded.tagline,
      accent_color = excluded.accent_color,
      has_temperature = excluded.has_temperature,
      has_sweetness = excluded.has_sweetness,
      sort_order = excluded.sort_order,
      is_active = true;

-- ----------------------------------------------------------------- addons

insert into public.addons (name, price, sort_order)
values
  ('Sauce / Syrup',            20, 1),
  ('Extra Shot',               20, 2),
  ('Oatmilk',                  40, 3),
  ('Vanilla Sweet Cream Foam', 20, 4),
  ('Seasalt Cream',            30, 5),
  ('Cold Whisk',               20, 6),
  ('Upsize to 16oz',           40, 7)
on conflict (name) do update
  set price = excluded.price,
      sort_order = excluded.sort_order,
      is_active = true;

-- Coffee gets the barista add-ons; matcha and hojicha get the whisk/upsize
-- pair printed on their own menu. Milk based and fruit tea have none.
insert into public.category_addons (category_id, addon_id)
select c.id, a.id
from public.categories c
join public.addons a on true
where (c.slug in ('signature-coffee', 'house-blend')
        and a.name in ('Sauce / Syrup', 'Extra Shot', 'Oatmilk',
                       'Vanilla Sweet Cream Foam', 'Seasalt Cream'))
   or (c.slug in ('matcha', 'hojicha')
        and a.name in ('Cold Whisk', 'Upsize to 16oz'))
on conflict do nothing;

-- --------------------------------------------------------------- products

-- One row per (product, size). Products are inserted first from the distinct
-- names, then every size row is upserted against them.
create temporary table _menu_seed (
  cat text,
  name text,
  description text,
  badge text,
  sort integer,
  size_label text,
  price numeric(10, 2),
  size_sort integer
);
-- No ON COMMIT DROP: pasted into the Supabase SQL editor each statement can
-- autocommit, which would drop the table before the inserts below ever run.
-- It is dropped explicitly at the end instead.

insert into _menu_seed values
  -- ---------------- Signature Coffee — 16oz cold only
  ('signature-coffee', 'Spanish Cold Brew',       'Slow-steeped cold brew, condensed milk',    'Bestseller', 1,  '16oz', 150, 1),
  ('signature-coffee', 'Biscoff Cream Latte',     'Caramelised biscuit cream over espresso',   null,         2,  '16oz', 150, 1),
  ('signature-coffee', 'Pause Signature Latte',   'Our house pull, rich and rounded',          'Signature',  3,  '16oz', 150, 1),
  ('signature-coffee', 'Seasalt Latte',           'Espresso under a salted cream cap',         null,         4,  '16oz', 150, 1),
  ('signature-coffee', 'Caradamia Latte',         'Caramel and macadamia, silky finish',       null,         5,  '16oz', 140, 1),
  ('signature-coffee', 'Caramel Toffeenut Latte', 'Buttery toffee nut, caramel drizzle',       null,         6,  '16oz', 150, 1),
  ('signature-coffee', 'Cinnamon Dulce Latte',    'Warm cinnamon, sweet dulce',                null,         7,  '16oz', 140, 1),
  ('signature-coffee', 'Spanish Oat Blend',       'Spanish latte built on oatmilk',            null,         8,  '16oz', 150, 1),
  ('signature-coffee', 'Dirty Matcha',            'Ceremonial matcha with an espresso pour',   null,         9,  '16oz', 150, 1),
  ('signature-coffee', 'Macadamia Latte',         'Toasted macadamia, creamy body',            null,         10, '16oz', 140, 1),
  ('signature-coffee', 'Pistachio Latte',         'Roasted pistachio, smooth espresso',        null,         11, '16oz', 140, 1),
  ('signature-coffee', 'White Mocha Hazelnut',    'White chocolate and hazelnut',              null,         12, '16oz', 140, 1),
  ('signature-coffee', 'Almond Blanc',            'Almond and white chocolate',                null,         13, '16oz', 140, 1),

  -- ---------------- House Blend — iced or hot, 12oz / 16oz
  ('house-blend', 'Americano',         'Espresso and water, clean and bright',  null,         1,  '12oz', 110, 1),
  ('house-blend', 'Americano',         'Espresso and water, clean and bright',  null,         1,  '16oz', 120, 2),
  ('house-blend', 'Cafe Latte',        'Espresso and steamed milk',             null,         2,  '12oz', 110, 1),
  ('house-blend', 'Cafe Latte',        'Espresso and steamed milk',             null,         2,  '16oz', 130, 2),
  ('house-blend', 'Mocha Latte',       'Dark chocolate and espresso',           null,         3,  '12oz', 120, 1),
  ('house-blend', 'Mocha Latte',       'Dark chocolate and espresso',           null,         3,  '16oz', 140, 2),
  ('house-blend', 'Hazelnut Latte',    'Toasted hazelnut, creamy milk',         null,         4,  '12oz', 120, 1),
  ('house-blend', 'Hazelnut Latte',    'Toasted hazelnut, creamy milk',         null,         4,  '16oz', 140, 2),
  ('house-blend', 'Caramel Latte',     'Golden caramel over espresso',          null,         5,  '12oz', 120, 1),
  ('house-blend', 'Caramel Latte',     'Golden caramel over espresso',          null,         5,  '16oz', 140, 2),
  ('house-blend', 'Vanilla Latte',     'Madagascar vanilla, soft finish',       null,         6,  '12oz', 120, 1),
  ('house-blend', 'Vanilla Latte',     'Madagascar vanilla, soft finish',       null,         6,  '16oz', 140, 2),
  ('house-blend', 'Salted Caramel',    'Caramel with a salted edge',            null,         7,  '12oz', 120, 1),
  ('house-blend', 'Salted Caramel',    'Caramel with a salted edge',            null,         7,  '16oz', 140, 2),
  ('house-blend', 'Spanish Latte',     'Condensed milk, full-bodied espresso',  'Bestseller', 8,  '12oz', 140, 1),
  ('house-blend', 'Spanish Latte',     'Condensed milk, full-bodied espresso',  'Bestseller', 8,  '16oz', 150, 2),
  ('house-blend', 'White Mocha',       'White chocolate, velvety milk',         null,         9,  '12oz', 140, 1),
  ('house-blend', 'White Mocha',       'White chocolate, velvety milk',         null,         9,  '16oz', 150, 2),
  ('house-blend', 'Caramel Macchiato', 'Vanilla milk, espresso, caramel',       null,         10, '12oz', 150, 1),
  ('house-blend', 'Caramel Macchiato', 'Vanilla milk, espresso, caramel',       null,         10, '16oz', 160, 2),
  ('house-blend', 'Toffeenut Latte',   'Buttery toffee nut',                    null,         11, '12oz', 120, 1),
  ('house-blend', 'Toffeenut Latte',   'Buttery toffee nut',                    null,         11, '16oz', 140, 2),
  ('house-blend', 'Almond Latte',      'Roasted almond, mellow espresso',       null,         12, '12oz', 120, 1),
  ('house-blend', 'Almond Latte',      'Roasted almond, mellow espresso',       null,         12, '16oz', 140, 2),

  -- ---------------- Matcha — 12oz
  ('matcha', 'Classic Matcha',          'Earthy matcha, silky milk',         'Bestseller', 1, '12oz', 210, 1),
  ('matcha', 'Matcha Biscoff',          'Earthy matcha, caramel Biscoff',    null,         2, '12oz', 250, 1),
  ('matcha', 'Strawberry Cloud Matcha', 'Creamy strawberry, vibrant matcha', null,         3, '12oz', 220, 1),
  ('matcha', 'Seasalt Matcha',          'Smooth matcha, salted foam',        null,         4, '12oz', 230, 1),
  ('matcha', 'Matcha Pistachio',        'Creamy pistachio, earthy matcha',   null,         5, '12oz', 270, 1),
  ('matcha', 'Ube Cloud Matcha',        'Creamy ube, earthy matcha',         null,         6, '12oz', 240, 1),

  -- ---------------- Hojicha — 12oz
  ('hojicha', 'Medium Roast',    'Mellow, well-balanced, chocolate-y', null, 1, '12oz', 150, 1),
  ('hojicha', 'Dark Roast',      'Earthy roast, subtle sweetness',     null, 2, '12oz', 160, 1),
  ('hojicha', 'Seasalt Hojicha', 'Balanced roast, creamy salted top',  null, 3, '12oz', 150, 1),

  -- ---------------- Milk Based — 16oz / 22oz
  ('milk-based', 'Strawberry Milk',   'Sweet strawberry, fresh milk',    null, 1,  '16oz', 120, 1),
  ('milk-based', 'Strawberry Milk',   'Sweet strawberry, fresh milk',    null, 1,  '22oz', 130, 2),
  ('milk-based', 'Blueberry Milk',    'Ripe blueberry, fresh milk',      null, 2,  '16oz', 120, 1),
  ('milk-based', 'Blueberry Milk',    'Ripe blueberry, fresh milk',      null, 2,  '22oz', 130, 2),
  ('milk-based', 'Biscoff Milk',      'Caramelised biscuit, fresh milk', null, 3,  '16oz', 120, 1),
  ('milk-based', 'Biscoff Milk',      'Caramelised biscuit, fresh milk', null, 3,  '22oz', 140, 2),
  ('milk-based', 'Choco Berry',       'Chocolate meets mixed berry',     null, 4,  '16oz', 110, 1),
  ('milk-based', 'Choco Berry',       'Chocolate meets mixed berry',     null, 4,  '22oz', 120, 2),
  ('milk-based', 'Cocoa Milk',        'Rich cocoa, creamy milk',         null, 5,  '16oz', 110, 1),
  ('milk-based', 'Cocoa Milk',        'Rich cocoa, creamy milk',         null, 5,  '22oz', 120, 2),
  ('milk-based', 'Dark Chocolate',    'Deep dark chocolate',             null, 6,  '16oz', 110, 1),
  ('milk-based', 'Dark Chocolate',    'Deep dark chocolate',             null, 6,  '22oz', 120, 2),
  ('milk-based', 'Pistachio Milk',    'Roasted pistachio, fresh milk',   null, 7,  '16oz', 120, 1),
  ('milk-based', 'Pistachio Milk',    'Roasted pistachio, fresh milk',   null, 7,  '22oz', 130, 2),
  ('milk-based', 'Choco Pistachio',   'Chocolate and roasted pistachio', null, 8,  '16oz', 130, 1),
  ('milk-based', 'Choco Pistachio',   'Chocolate and roasted pistachio', null, 8,  '22oz', 140, 2),
  ('milk-based', 'Oreo Milk',         'Cookies and cream, blended',      null, 9,  '16oz', 120, 1),
  ('milk-based', 'Oreo Milk',         'Cookies and cream, blended',      null, 9,  '22oz', 140, 2),
  ('milk-based', 'Ube Cloud',         'Creamy ube over cold milk',       null, 10, '16oz', 110, 1),
  ('milk-based', 'Ube Cloud',         'Creamy ube over cold milk',       null, 10, '22oz', 120, 2),
  ('milk-based', 'Pure Matcha Latte', 'Straight matcha, no espresso',    null, 11, '16oz', 140, 1),
  ('milk-based', 'Pure Matcha Latte', 'Straight matcha, no espresso',    null, 11, '22oz', 160, 2),
  ('milk-based', 'Strawberry Cocoa',  'Strawberry folded into cocoa',    null, 12, '16oz', 130, 1),

  -- ---------------- Fruit Tea Refresher — 16oz
  ('fruit-tea', 'Mixed Berry Tea',          'Berry medley over iced tea',       null, 1, '16oz', 110, 1),
  ('fruit-tea', 'Passionfruit Tea',         'Tart passionfruit, bright finish', null, 2, '16oz', 110, 1),
  ('fruit-tea', 'Mixed Berries Lychee Tea', 'Berries with sweet lychee',        null, 3, '16oz', 120, 1),
  ('fruit-tea', 'Yuzu Passion',             'Yuzu citrus and passionfruit',     null, 4, '16oz', 120, 1),
  ('fruit-tea', 'Strawberry Lychee Tea',    'Strawberry and lychee',            null, 5, '16oz', 120, 1);

-- Products, one per distinct (category, name).
insert into public.products (category_id, name, description, badge, sort_order)
select distinct on (c.id, m.name)
  c.id, m.name, m.description, m.badge, m.sort
from _menu_seed m
join public.categories c on c.slug = m.cat
where not exists (
  select 1 from public.products p where p.category_id = c.id and p.name = m.name
)
order by c.id, m.name, m.size_sort;

-- Then every size row, keyed to the product just created.
insert into public.product_sizes (product_id, label, price, sort_order)
select p.id, m.size_label, m.price, m.size_sort
from _menu_seed m
join public.categories c on c.slug = m.cat
join public.products p on p.category_id = c.id and p.name = m.name
on conflict (product_id, label) do update
  set price = excluded.price,
      sort_order = excluded.sort_order,
      is_active = true;

drop table _menu_seed;
