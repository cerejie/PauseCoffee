# Pause Coffee

An ordering PWA for Pause Coffee. Customers browse the menu, build a cart, and
send an order straight to the counter; staff work it off a live queue board.

React 19 · TypeScript · Vite 7 · Ant Design v5 · TanStack Query v5 · Zustand ·
vanilla-extract · Supabase · `vite-plugin-pwa`.

## Two apps, one bundle

| Route | Who | What |
|---|---|---|
| `/` | anyone | The menu — six categories, per-drink size/temperature/sweetness/add-ons |
| `/cart` | anyone | Cart, name, dine-in or take-out, **Proceed to order** |
| `/order/:orderId` | anyone with the link | Live tracker: claim code, progress, receipt |
| `/admin/login` | staff | Supabase email + password |
| `/admin/queue` | staff | Live board — Received → Preparing → Ready, one tap per stage |
| `/admin/orders` | staff | Every order, searchable and filterable |
| `/admin/menu` | admin only | Drinks, size tiers, prices, add-ons |

Customers are anonymous. Placing an order returns a uuid that this device keeps;
that uuid is the only key to the tracker, and there is no way to enumerate
other people's orders.

## Setup

```bash
yarn install
cp .env.example .env       # fill in your Supabase URL + anon key
yarn dev
```

### Supabase

Run the migrations in order — `supabase db push`, or paste each file into the
SQL editor:

| File | What it does |
|---|---|
| `0001_schema.sql` | Tables and enums |
| `0002_functions.sql` | `place_order`, `get_order`, `set_order_status`, daily claim codes |
| `0003_rls.sql` | Row level security, and adds `orders` to the realtime publication |
| `0004_seed_menu.sql` | The full printed menu — 50 drinks, every price, all add-ons |
| `0005_order_broadcast.sql` | Trigger that pushes status changes to the customer's tracker |

Then in the dashboard:

1. **Database → Replication** — confirm `orders` is in the `supabase_realtime`
   publication (0003 adds it; the toggle should already be on).
2. **Authentication → Users** — create a staff account.
3. Give it a staff row, or it can sign in but not get past the guard:

   ```sql
   insert into public.profiles (id, full_name, role)
   values ('<the auth user uuid>', 'Ejie', 'admin');
   ```

   `admin` also unlocks the Menu screen; `staff` gets the queue and history only.

## Commands

```bash
yarn dev          # dev server
yarn build:main   # vite build — the gate for "does it build"
yarn build        # tsc -b && vite build
yarn lint
```

## How pricing is protected

The client never sends a price. `place_order(payload jsonb)` takes size ids,
quantities and add-on ids, then reads every peso from `product_sizes` and
`addons` itself — and it only prices add-ons that the drink's category actually
offers. A tampered cart cannot buy a ₱250 matcha for ₱1, and a stale cart
checks out at today's prices rather than yesterday's.

## Live updates

Two different mechanisms, because the two audiences have different rights:

- **Admin board** — `postgres_changes` on `public.orders`. Staff have a select
  policy, so Realtime (which honours RLS) delivers the events. A new ticket
  chimes and toasts.
- **Customer tracker** — a trigger calls `realtime.send()` to the public topic
  `order:<uuid>`. Guests have *no* select policy on `orders`, so row-change
  events would never reach them; the broadcast carries only the status, and the
  app re-reads the detail through `get_order`. A 10s poll backs it up if the
  socket drops.

## Conventions

Inherited from `dcwd_apps-csms-bca2` — see `CLAUDE.md`.

- `pages/` are shells. They own no query and no state.
- Data lives in `hook/data/<feature>/<name>.<kind>.hook.ts`; Supabase calls live
  in `services/data/<domain>/<name>.services.ts` and nowhere else.
- Screen state (filters, searches, drafts, modal open/close) is Zustand, keyed
  through `useModal(key)` / `usePagination(key)`. Form values are antd `Form`.
- All styling is vanilla-extract under `src/styles/<area>/*.css.ts`, never
  colocated with a component, never an inline colour. Tokens come from
  `styles/common/vars.css.ts`; the raw palette has one home in
  `constants/brand.constants.ts`.
