-- Pause Coffee — guards for hard delete.
--
-- The masterfile screens gain a real delete alongside the on/off switch, and
-- two of the existing foreign keys are the wrong shape for that:
--
--   * products.category_id cascaded. Deleting one category would have silently
--     taken every drink under it — the single most expensive mis-click in the
--     admin app.
--   * product_sizes.size_id nulled. Deleting a size would have left every
--     product priced against it with a label and no masterfile row behind it,
--     so the item form would open on a blank size picker.
--
-- Both become RESTRICT: the database refuses, and the screen explains what to
-- clear out first. Nothing else about the relationships changes.
--
-- Deliberately left alone: order_items.product_id stays ON DELETE SET NULL, so
-- deleting a drink never touches a receipt that already went out — the line
-- keeps its own copy of the name, size and price (0001).

alter table public.products
  drop constraint if exists products_category_id_fkey;

alter table public.products
  add constraint products_category_id_fkey
  foreign key (category_id) references public.categories (id) on delete restrict;

alter table public.product_sizes
  drop constraint if exists product_sizes_size_id_fkey;

alter table public.product_sizes
  add constraint product_sizes_size_id_fkey
  foreign key (size_id) references public.sizes (id) on delete restrict;
