-- Pause Coffee — masterfile management.
--
-- Two levels above a product: a fixed `menu_group` (drinks / food) and the
-- admin-managed categories underneath it. Sizes stop being free text typed per
-- product and become a masterfile the admin picks from.
--
-- `product_sizes.label` deliberately stays. It is what place_order (0002)
-- stamps onto the receipt and what the seed (0004) upserts on, so `size_id`
-- sits beside it as the link to the masterfile rather than replacing it.

-- --------------------------------------------------------------- menu group

do $$
begin
  create type public.menu_group as enum ('drinks', 'food');
exception
  when duplicate_object then null;
end
$$;

-- Everything that exists today is a drink; food arrives later.
alter table public.categories
  add column if not exists menu_group public.menu_group not null default 'drinks';

-- -------------------------------------------------------------------- sizes

create table if not exists public.sizes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  -- Null means "offered to every group". 12oz belongs to drinks; a food size
  -- like "Sharing" would be pinned to food.
  menu_group public.menu_group,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed the masterfile from the labels already priced against products, so an
-- existing menu keeps working without anyone retyping "16oz".
insert into public.sizes (name, menu_group, sort_order)
select ps.label, 'drinks', min(ps.sort_order)
from public.product_sizes ps
group by ps.label
on conflict (name) do nothing;

alter table public.product_sizes
  add column if not exists size_id uuid references public.sizes (id) on delete set null;

update public.product_sizes ps
set size_id = s.id
from public.sizes s
where s.name = ps.label
  and ps.size_id is distinct from s.id;

create index if not exists product_sizes_size_id_idx on public.product_sizes (size_id);

-- ---------------------------------------------------------------------- rls

alter table public.sizes enable row level security;

-- Mirrors categories: the menu is public read-only, staff are the only writers.
drop policy if exists "sizes_public_read" on public.sizes;
create policy "sizes_public_read" on public.sizes
  for select to anon, authenticated using (is_active);

drop policy if exists "sizes_staff_all" on public.sizes;
create policy "sizes_staff_all" on public.sizes
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
