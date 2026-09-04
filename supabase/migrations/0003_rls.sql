-- Row level security.
--
-- Guests are anonymous: they read the active menu, place an order through the
-- RPC, and then poll one order by its uuid (the uuid is the capability — it is
-- only ever handed back to the device that placed it). Everything else needs a
-- staff row in public.profiles.

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_sizes  enable row level security;
alter table public.addons         enable row level security;
alter table public.category_addons enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;
alter table public.order_counters enable row level security;

-- Helper — kept SECURITY DEFINER so the staff policies do not recurse into
-- profiles' own RLS.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid());
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
  );
$$;

grant execute on function public.is_staff() to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------- profiles

create policy "profiles_self_read" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_admin_write" on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------------------- menu

-- Public, read-only, active rows only.
create policy "categories_public_read" on public.categories
  for select to anon, authenticated using (is_active);

create policy "products_public_read" on public.products
  for select to anon, authenticated using (is_active);

create policy "product_sizes_public_read" on public.product_sizes
  for select to anon, authenticated using (is_active);

create policy "addons_public_read" on public.addons
  for select to anon, authenticated using (is_active);

create policy "category_addons_public_read" on public.category_addons
  for select to anon, authenticated using (true);

-- Staff see everything including deactivated rows, and are the only writers.
create policy "categories_staff_all" on public.categories
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "products_staff_all" on public.products
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "product_sizes_staff_all" on public.product_sizes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "addons_staff_all" on public.addons
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "category_addons_staff_all" on public.category_addons
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ------------------------------------------------------------------ orders

-- Guests get NO select policy here on purpose. A `using (true)` policy would
-- let anon list every ticket in the shop, names and all; instead the tracker
-- screen calls public.get_order(uuid), which is SECURITY DEFINER and returns a
-- single order only when the caller already holds its uuid.
create policy "orders_staff_read" on public.orders
  for select to authenticated using (public.is_staff());

create policy "order_items_staff_read" on public.order_items
  for select to authenticated using (public.is_staff());

create policy "orders_staff_write" on public.orders
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

create policy "orders_admin_delete" on public.orders
  for delete to authenticated using (public.is_admin());

create policy "order_items_staff_write" on public.order_items
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- No anon INSERT/UPDATE policy anywhere: placing an order goes through
-- public.place_order (SECURITY DEFINER), which prices the lines itself.

-- order_counters is written only by next_order_number() (SECURITY DEFINER);
-- RLS is on with no policy, so nothing else can touch it.

-- ---------------------------------------------------------------- realtime

-- The queue board listens on postgres_changes for orders.
alter publication supabase_realtime add table public.orders;
