# CLAUDE.md

Guidance for Claude Code when working in this repo.

## Project

**Pause Coffee** — an ordering PWA for a coffee shop. Two audiences in one
bundle: an anonymous customer app at `/` and a staff app at `/admin`. React 19 +
TypeScript + Vite 7, Ant Design v5, TanStack Query v5, Zustand, vanilla-extract,
Supabase (the only backend), `vite-plugin-pwa`.

Conventions are inherited from `dcwd_apps-csms-bca2` — when something here and
something there disagree, that repo's shape wins.

## Commands — yarn only

```bash
yarn dev
yarn build:main   # vite build — the real gate for a change
yarn build        # tsc -b && vite build; currently clean, keep it that way
yarn lint
```

## Layer flow (unidirectional)

```
pages/<Area>/<Name>View.tsx          shell only — title, tabs, one component
  → components/<feature>/<kind>/<PascalCase>.tsx
  → hook/data/<feature>/<name>.<kind>.hook.ts     React Query + orchestration
  → services/data/<domain>/<name>.services.ts     Supabase calls only
  → models/data/<domain>/<name>.{request,response}.ts + enums/
```

Supporting layers: `store/data/<feature>/<name>.store.ts` (Zustand),
`styles/<area>/<name>.css.ts` (vanilla-extract, **never** colocated),
`keys/{query,table,modal,storage}.keys.ts`, `routes/`, `utils/`, `constants/`.

No path aliases — every import is a deep relative path. Follow suit.

## Where things are

| Need | Path |
|---|---|
| The customer menu screen | `pages/Customer/MenuView.tsx` + `hook/data/menu/menu.list.hook.ts` |
| The options drawer (size / temp / sweetness / add-ons) | `components/menu/modal/ProductOptions*.tsx` + `hook/data/menu/product.options.hook.ts` |
| Cart contents and arithmetic | `store/data/cart/cart.store.ts` + `hook/data/cart/cart.hook.ts` |
| Checkout / "Proceed to order" | `hook/data/order/order.form.hook.ts` |
| The customer tracker | `hook/data/order/order.status.hook.ts` |
| The barista queue board | `pages/Admin/OrderQueueView.tsx` + `hook/data/admin/queue.list.hook.ts` |
| Realtime + the new-order chime | `hook/data/admin/queue.realtime.hook.ts` — mounted **once**, by `AdminLayout` |
| Auth / who is staff | `hook/account/session.hook.ts` + `components/common/guard/AdminGuard.tsx` |
| Colours, fonts, radii, shadows | `styles/common/vars.css.ts` (contract) ← `constants/brand.constants.ts` (values) |
| Schema, RLS, RPCs, menu seed | `supabase/migrations/` |

## Rules that are load-bearing here

- **The client never sends a price.** `place_order` re-prices every line from
  `product_sizes` / `addons` server-side. If you add an option that costs money,
  it is priced in that function, not in the cart.
- **Guests have no select policy on `orders`.** The tracker reads through the
  `get_order` RPC and listens on a `realtime.send()` broadcast topic. Do not
  "fix" this by adding a permissive select policy — it would expose every
  customer's name and order to anyone with the anon key.
- **Realtime is mounted once.** `useQueueRealtimeHook` lives in `AdminLayout`;
  `useOrderQueueHook` shares its query key. A second subscription means a double
  chime and a double toast.
- **Screen state is Zustand, form values are antd `Form`.** Filters, searches,
  the options draft, modal open/close — all stores, keyed via `useModal(key)` /
  `usePagination(key)` with the key declared in `src/keys/`. A throwaway
  `useState` is fine only in a leaf nothing else can read.
- **Never hardcode a colour, font or spacing** in a component. Tokens come from
  `styles/common/vars.css.ts`; a per-category accent is assigned locally with
  `useAccentVars`. Anything rendered through a portal (antd `Drawer`, `Modal`)
  is outside the root that carries the contract and must re-assign it — see
  `ProductOptionsDrawer`.
- **antd for every control.** Never hand-roll a table, form, drawer, select,
  modal or notification. `CardTable`, `StatusTag`, `TwoLineCell`, `EmptyState`,
  `BrandLoader`, `ConfirmationModal` already exist in `components/common/` —
  extend one with a prop before forking a copy.
- **Migrations are proposed, never run.** Write the SQL, hand it over, let the
  user apply it.
- **No `any`.** `unknown` plus narrowing; `as unknown as T` only at the Supabase
  boundary, where the generated types do not exist yet.

## Menu data

The seed in `0004_seed_menu.sql` is transcribed from the printed menus in
`Menu/` (Coffee, Matcha, MilkBased). If a price changes, change it there **and**
in the shop's admin screen — the migration is idempotent and re-running it
resets prices to whatever the file says.

## Commits

After **every** change, propose a commit title and message — even when the user
has not asked to commit. Proposing is the job; running `git commit` still waits
for the user to ask.

Title is one line, `Prefix: subject`. Prefixes: `Feature`, `BugFix`, `ReDesign`,
`Migration`, `Refactor`, `Chore`. A change that spans two joins them with `&`.

The description is a summary and nothing more — bullets only, **8 words maximum
per bullet**, one bullet per thing that changed. No prose, no rationale, no
file lists.

```
BugFix & ReDesign: Product card and options drawer

- Menu grid now two columns on mobile
- Product card turns portrait below 640px
- Options hero shows whole drink, uncropped
- Bottom sheet closes on swipe down
```
