-- Pause Coffee — core schema.
-- Menu is public read-only data; orders are written by guests through a single
-- RPC (0002) so no client ever inserts a price it chose itself.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- enums

create type public.order_status as enum (
  'pending',
  'preparing',
  'ready',
  'completed',
  'cancelled'
);

create type public.order_type as enum ('dine_in', 'take_out');

create type public.beverage_temperature as enum ('iced', 'hot');

create type public.user_role as enum ('admin', 'staff');

-- ---------------------------------------------------------------- staff

-- One row per authenticated staff member. Auth itself stays in auth.users;
-- this table only answers "is this uid allowed in the admin app".
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'staff',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- menu

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  -- Drives the category's accent in the menu UI (matcha green, amber, ...).
  accent_color text not null default '#E9A13B',
  -- Category-level defaults the product options drawer offers.
  has_temperature boolean not null default true,
  has_sweetness boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name text not null,
  description text,
  -- Small marketing flag rendered as a pill on the card ("Bestseller").
  badge text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);

-- A product is priced per size. The menu's "12oz / 16oz" columns are two rows.
create table public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  price numeric(10, 2) not null check (price >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  unique (product_id, label)
);

create index product_sizes_product_id_idx on public.product_sizes (product_id);

create table public.addons (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  price numeric(10, 2) not null check (price >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true
);

-- Which add-ons a category offers. Upsize belongs to matcha, seasalt cream to
-- coffee — a flat global list would offer nonsense combinations.
create table public.category_addons (
  category_id uuid not null references public.categories (id) on delete cascade,
  addon_id uuid not null references public.addons (id) on delete cascade,
  primary key (category_id, addon_id)
);

-- ---------------------------------------------------------------- orders

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  -- Human-facing claim code shown on the cup and the queue board.
  order_number text not null unique,
  customer_name text not null check (char_length(trim(customer_name)) between 1 and 60),
  order_type public.order_type not null default 'take_out',
  status public.order_status not null default 'pending',
  notes text,
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  item_count integer not null default 0,
  placed_at timestamptz not null default now(),
  -- Stamped as the barista advances the ticket; drives queue wait times.
  accepted_at timestamptz,
  ready_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancel_reason text
);

create index orders_status_placed_at_idx on public.orders (status, placed_at desc);
create index orders_placed_at_idx on public.orders (placed_at desc);

-- Line items denormalize name/size/price on purpose: an order receipt must not
-- change when the menu is re-priced tomorrow.
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  size_label text not null,
  temperature public.beverage_temperature,
  sweetness text,
  unit_price numeric(10, 2) not null,
  addons jsonb not null default '[]'::jsonb,
  addons_total numeric(10, 2) not null default 0,
  quantity integer not null check (quantity between 1 and 50),
  line_total numeric(10, 2) not null,
  notes text,
  sort_order integer not null default 0
);

create index order_items_order_id_idx on public.order_items (order_id);
