-- Pause Coffee — the shop delivers inside Davao City and nowhere else.
--
-- The map already refuses to pan, zoom or pin outside the city, but a map is a
-- widget and a widget is not a rule. This is the rule: an order row whose pin
-- falls outside Davao cannot be stored, whoever sent it and however they sent
-- it. Same box as src/constants/map.constants.ts — change one and change both.
--
-- Deliberately a box rather than the city's real outline. A polygon would want
-- PostGIS and a boundary file to maintain, and would then refuse the occasional
-- genuine address sitting a few metres the wrong side of a line drawn by
-- somebody else. The box is generous on purpose: Marilog and Paquibato in the
-- north-west, Toril and Sirawan in the south, the gulf on the east.
--
-- Requires 0013 (the delivery columns) to have been applied.


alter table public.orders drop constraint if exists orders_delivery_area_check;
alter table public.orders add constraint orders_delivery_area_check check (
  delivery_lat is null
  or delivery_lng is null
  or (
    delivery_lat between 6.93 and 7.45
    and delivery_lng between 125.24 and 125.80
  )
);


comment on constraint orders_delivery_area_check on public.orders is
  'Delivery pins must fall inside Davao City. Mirrors davaoBounds in '
  'src/constants/map.constants.ts; if the shop ever delivers further, both '
  'move together.';
