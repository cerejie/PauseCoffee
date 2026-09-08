-- Pause Coffee — shop settings the owner can change without a deploy.
--
-- Two things pushed this out of constants and into a table: the payment QR and
-- account numbers are the shop's own money details, which change without a
-- developer being around, and "are we taking online orders right now" is a
-- decision made at 6am with a phone, not from a code editor.
--
-- ONE ROW, ever. The `id boolean primary key check (id)` trick means the only
-- value the key can take is true, so a second row is impossible rather than
-- merely discouraged — no query in the app has to wonder which row it wants.
--
-- !! NOTHING SECRET GOES IN THIS TABLE !!
-- Every column is readable with the anon key, because the online checkout has
-- to render the QR, the account details and the contact number to a customer
-- who is not signed in. An account NUMBER is meant to be shown to whoever is
-- paying; an API key, a password or a service token is not, and must never be
-- added here.

create table if not exists public.app_settings (
  id boolean primary key default true check (id),

  -- ------------------------------------------------------------- shop state

  -- The kill switch. Off means the online app stops taking orders, and the
  -- trigger below refuses them at the database rather than the button merely
  -- being hidden.
  online_ordering_enabled boolean not null default true,
  -- Optional daily window, in Asia/Manila. Both null means "no schedule" and
  -- the switch above is the only thing that decides.
  online_open_time time,
  online_close_time time,
  -- Shown on the online checkout so a customer can ring the shop. Free text,
  -- not the PH-mobile format the customer's own number is held to: a shop may
  -- well publish a landline.
  shop_contact_phone text,

  -- The first path segment the online app answers on, so the shop can hand out
  -- a link it likes the look of: /order-online, /online-orders, whatever. The
  -- router matches it at runtime against a dynamic segment, which is why the
  -- two constraints below are load-bearing rather than cosmetic — a slug that
  -- collides with a real route would silently break the customer's link.
  online_slug text not null default 'order-online',

  -- ---------------------------------------------------------------- payment

  -- Object path in the public "menu-images" bucket, same convention as
  -- products.image_path (0009): the row stores the path, never a URL.
  payment_qr_path text,

  gcash_enabled boolean not null default true,
  gcash_account_name text,
  gcash_account_number text,

  bank_transfer_enabled boolean not null default false,
  bank_name text,
  bank_account_name text,
  bank_account_number text,

  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null,

  -- Lowercase kebab, nothing exotic: it goes in a URL that gets typed off a
  -- printed sign and read aloud over a counter.
  constraint app_settings_online_slug_format check (
    online_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    and char_length(online_slug) between 3 and 40
  ),

  -- Every static path the app already answers on. React Router ranks a literal
  -- segment above a dynamic one, so a slug of 'cart' would never match and the
  -- online link would 404 with nothing to explain why. Refused here instead.
  constraint app_settings_online_slug_reserved check (
    online_slug not in (
      'admin', 'cart', 'order', 'api', 'assets', 'auth',
      'login', 'static', 'confirm', 'sw', 'manifest'
    )
  )
);

comment on table public.app_settings is
  'Single-row shop configuration, readable by the anon key because the online '
  'checkout renders it to signed-out customers. Never store a secret here.';

-- The row the whole app reads. Created here so nothing downstream has to cope
-- with its absence.
insert into public.app_settings (id) values (true) on conflict (id) do nothing;

-- --------------------------------------------------------------------- rls

alter table public.app_settings enable row level security;

-- Public, like the menu. The customer has to see the QR they are about to pay.
drop policy if exists "app_settings_public_read" on public.app_settings;
create policy "app_settings_public_read" on public.app_settings
  for select to anon, authenticated using (true);

-- The shop's own bank details and trading hours are the shop's call, so this is
-- is_admin() rather than is_superadmin(). No insert or delete policy exists:
-- the single row is created above and must stay exactly one row.
drop policy if exists "app_settings_admin_write" on public.app_settings;
create policy "app_settings_admin_write" on public.app_settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ------------------------------------------------------- the trading window

-- Whether the shop is taking online orders at this moment. Exposed to the
-- client so the online app can say "we are closed" before someone builds a
-- cart, and used by the trigger below so saying it is not the only defence.
create or replace function public.online_ordering_open()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select s.online_ordering_enabled
    and (
      -- No schedule set: the switch alone decides.
      s.online_open_time is null
      or s.online_close_time is null
      or case
           when s.online_open_time <= s.online_close_time then
             ((now() at time zone 'Asia/Manila')::time)
               between s.online_open_time and s.online_close_time
           -- A window that wraps past midnight (open 22:00, close 02:00).
           else
             ((now() at time zone 'Asia/Manila')::time) >= s.online_open_time
             or ((now() at time zone 'Asia/Manila')::time) <= s.online_close_time
         end
    )
  from public.app_settings s
  where s.id;
$$;

grant execute on function public.online_ordering_open() to anon, authenticated;

-- Enforced as a trigger rather than by editing place_order, so the rule covers
-- every path that could ever insert an order — and so 0015's function, which is
-- long and carefully ordered, does not have to be restated to add one check.
create or replace function public.enforce_online_ordering_window()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Fails OPEN if the settings row has somehow gone: a configuration accident
  -- should not silently stop the shop from taking money.
  if new.order_channel = 'online'
     and not coalesce(public.online_ordering_open(), true) then
    raise exception 'Online ordering is closed right now. Please try again later.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_online_window on public.orders;
create trigger orders_online_window
  before insert on public.orders
  for each row
  execute function public.enforce_online_ordering_window();

-- ------------------------------------------------------------- stamp writer

-- updated_at/updated_by are stamped here rather than trusted from the client,
-- for the same reason the order timestamps are (0002).
create or replace function public.stamp_app_settings()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists app_settings_stamp on public.app_settings;
create trigger app_settings_stamp
  before update on public.app_settings
  for each row
  execute function public.stamp_app_settings();
