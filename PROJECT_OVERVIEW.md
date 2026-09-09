# Pause Coffee — Full Project Brief

A single-bundle ordering PWA for one coffee shop in Davao City, Philippines.
Three audiences share one React app and one Supabase project:

| Audience | Where | Auth |
|---|---|---|
| Walk-in customer (in-store, pay at counter) | `/` | anonymous |
| Online customer (pre-paid, delivery or pickup) | `/<shop-chosen-slug>` | anonymous |
| Shop staff / owner / developer | `/admin` | Supabase email+password |

Supabase is the **only** backend — no server of our own, no edge functions. All
business rules that matter live in Postgres (RPCs, triggers, constraints, RLS);
the React app is a client that is never trusted with money or with other
people's data.

---

## 1. Stack and tooling

**Runtime / build**
- React 19 + TypeScript 5.8, Vite 7, `yarn` only
- `vite-plugin-pwa` (Workbox) — `registerType: "autoUpdate"`, full app-shell
  precache (globs js/css/html/svg/png/ico/woff2, 5 MB cap), `navigateFallback`
  to `/index.html`, and **`runtimeCaching: []`** on purpose: Supabase calls must
  never come from a stale service-worker cache; React Query owns that caching.
- Manual rollup chunks: `antd`, `supabase`, `leaflet` split out of the entry
  chunk (leaflet is only pulled in by the online delivery form).
- Deployed on Vercel; `vercel.json` is a single SPA rewrite so deep links work.

**Libraries**

| Concern | Choice | Notes |
|---|---|---|
| UI kit | Ant Design v5 (+ `@ant-design/v5-patch-for-react-19`) | every control is antd; nothing hand-rolled |
| Server state | TanStack Query v5 | `staleTime` 60s, `gcTime` 5m, `retry: 1`, no refetch-on-focus |
| Client state | Zustand v5 | screen state only; never server data |
| Styling | vanilla-extract (`*.css.ts`) + `@vanilla-extract/dynamic` | zero-runtime CSS-in-JS, typed tokens |
| Routing | react-router-dom v7 (`createBrowserRouter`) | |
| Backend | `@supabase/supabase-js` v2 | one shared client, anon key only |
| Maps | Leaflet + react-leaflet | delivery pin, OSM tiles, Nominatim reverse geocode |
| Dates | dayjs (+ `relativeTime`) | |
| Lint | ESLint 9 flat config + typescript-eslint | `any` is banned by rule |

**Deliberate non-dependencies:** no form library (antd `Form` only), no CSS
framework, no chart library, no audio assets (chimes are synthesised with
WebAudio), no state-sync library (realtime is raw Supabase channels).

---

## 2. Route map

```
/                       CustomerLayout  → MenuView          (in-store menu)
/cart                                   → CartView          (name, dine-in/take-out)
/order/:orderId                         → OrderTrackerView  (shared by BOTH channels)

/admin/login                            → AdminLoginView    (outside the guard)
/admin/confirm                          → AdminConfirmEmailView (outside the guard)
/admin            AdminGuard → AdminLayout
  /admin/queue                          → OrderQueueView    (barista board)
  /admin/online                         → OnlineOrdersView  (payment approval inbox)
  /admin/messages                       → MessagesView      (customer chat inbox)
  /admin/orders                         → OrderHistoryView  (paged, searchable)
  /admin/masterfile                     → MasterfileView    (admin+ only)
  /admin/settings                       → SettingsView      (admin+; Users tab superadmin-only)

/:onlineSlug      OnlineGuard → OnlineLayout
  /:onlineSlug                          → OnlineMenuView
  /:onlineSlug/cart                     → OnlineCartView
*                                       → NotFoundView
```

The online app's first path segment is **configurable by the shop owner** from
Settings (`app_settings.online_slug`, default `order-online`). Because React
Router ranks literal segments above dynamic ones, `/:onlineSlug` is the
lowest-priority match — and the database refuses to store a slug that would
collide with a real route (`admin`, `cart`, `order`, `api`, `assets`, `auth`,
`login`, `static`, `confirm`, `sw`, `manifest`). `OnlineGuard` reads the
settings row and 404s any segment that is not the current slug.

`adminViewRoutes` is plain data (`IRoute[]` with key / path / label /
description / icon / role / Component): the router, the desktop sider and the
mobile tab bar all read that one array, so a new admin screen is one entry
rather than three edits.

---

## 3. Feature inventory

### Customer app (`/`) — anonymous, pay at the counter
- Menu grouped two levels: a fixed **menu group** (Drinks / Food) → admin-managed
  **categories** (Coffee, Matcha, Milk-based, …) → products → priced sizes.
- Group tabs, a sticky category rail with scroll-spy, and a search that filters
  products *within* the current group and drops sections that end up empty.
- Product options **bottom sheet** (antd Drawer): size, temperature, sweetness
  (5g / 9g, matcha only), category-scoped add-ons, quantity, per-line notes.
  Drag-to-dismiss with both a distance and a velocity threshold.
- Cart persisted to `localStorage` (zustand `persist`, versioned with a
  migration). Identical configurations merge and bump quantity; editing a line
  can collapse it onto an existing one.
- Checkout: name + dine-in/take-out + notes → `place_order` RPC → tracker.
- **Tracker** (`/order/:orderId`): claim code (`PC-MMDD-NNN`), three-stage
  progress (Received → Preparing → Ready), queue position, itemised receipt,
  live status push, and the chat panel for online orders.

### Online app (`/<slug>`) — anonymous, pre-paid
Everything above, plus:
- **Storefront gate**: an on/off kill switch and an optional daily trading
  window (Asia/Manila), both answered by the *database*, not the browser clock.
- **Payment**: the shop's QR image plus GCash / bank-transfer account details
  rendered from `app_settings`; the customer uploads a receipt screenshot
  (browser-side downscale to WebP, ~80 KB) and optionally a reference number.
  A pending upload survives a refresh via `localStorage`.
- **Delivery pin**: a Leaflet map hard-bounded to Davao City — it cannot pan,
  zoom or drop a pin outside the box; one silent geolocation attempt on open;
  a debounced Nominatim reverse geocode fills a free-text address the customer
  may overwrite (a rider needs "blue gate beside the sari-sari store").
- Fulfilment is **Delivery or Pickup** (never dine-in); the word "take out"
  becomes "Pickup" for this audience off the same enum value.
- The order lands in `awaiting_approval` — invisible to the barista until a
  human has verified the payment.
- **Chat with the shop**, scoped to approved online orders inside the retention
  window.

### Admin app (`/admin`)
- **Order queue board** — three columns (Received / Preparing / Ready), one tap
  advances a ticket, cancel behind a confirm, a stat row (waiting / brewing /
  ready / cups), search by claim code or name, live chime and toast on arrival.
- **Online orders inbox** — cards showing the receipt behind a short-lived
  signed URL; approve or reject with canned or free-text reasons. Approving
  stamps `queued_at = now()` so the ticket joins the board where it was
  approved rather than jumping ahead of every walk-in that arrived while it
  waited.
- **Messages** — Messenger-style inbox: one row per *customer* (grouped by
  phone), not per order; unread badge; unanswered threads float to the top;
  a reply goes to whichever of that person's orders is still open.
- **Order history** — paged, searchable, status-filterable table.
- **Masterfile** — categories (accent colour, sweetness flag, sort), the sizes
  masterfile, products (photo upload, badge, description, per-size prices and
  hot/iced/both), add-ons and which categories offer them. Hard delete is
  guarded by `RESTRICT` foreign keys with a message that explains what to clear
  out first.
- **Settings** — online slug plus the shareable link, trading hours, the kill
  switch, shop phone, payment QR and account details, and (superadmin only) the
  **Users** tab: approve / revoke / delete admin accounts.
- **Sign-up flow** — anyone can request an account; it is `pending` and grants
  nothing until a superadmin approves it. Email confirmation uses a custom
  template that redeems `{{ .TokenHash }}` at `/admin/confirm`, drops the
  session it opens, and hands the visitor back to login.
- Three distinct **synthesised chimes** (WebAudio, no audio files): a rising
  pair for a new ticket, a falling pair for a payment awaiting approval, a
  single soft note for a customer message.

---

## 4. Data model (Postgres / Supabase)

**Menu**
`categories` (slug, accent_color, has_sweetness, menu_group, sort, is_active)
→ `products` (name, description, badge, image_path, sort, is_active)
→ `product_sizes` (label, price, `serve_temperature` hot|iced|both|null, size_id).
Plus `sizes` (the size masterfile), `addons`, and `category_addons` — the join
that means coffee gets syrups and matcha gets the cold whisk, so the drawer can
never offer a nonsense combination.

**Orders**
`orders` — order_number, customer_name, order_type, status, subtotal / total /
item_count, `placed_at` / `queued_at` / accepted_at / ready_at / completed_at /
cancelled_at / approved_at / rejected_at, plus the online columns:
`order_channel`, `payment_method`, `payment_reference`, `payment_proof_path`,
`contact_phone`, `delivery_address` / `landmark` / `lat` / `lng`, `device_id`.
`order_items` — **denormalised on purpose**: product_name, size_label,
temperature, sweetness, unit_price, addons (jsonb), quantity, line_total. A
receipt must not change when the menu is re-priced tomorrow.
`order_counters` — one row per business day, driving the daily claim code.
`order_messages` — sender (customer|staff), staff_id (never shown to the
customer), body, read_by_staff.
`app_settings` — **one row, enforced** by `id boolean primary key check (id)`.
`profiles` — staff identity: role, access status, denormalised email.
`storage_purge_queue` — object paths condemned for deletion.

**Enums**
`order_status` (awaiting_approval, pending, preparing, ready, completed,
cancelled, rejected) · `order_type` (dine_in, take_out, delivery) ·
`order_channel` (in_store, online) · `payment_method` (gcash, bank_transfer) ·
`message_sender` · `beverage_temperature` · `serve_temperature` ·
`menu_group` (drinks, food) · `user_role` (superadmin, admin, staff-legacy) ·
`access_status` (pending, approved, revoked).

**Storage buckets**
- `menu-images` — **public**, 2 MB, webp/jpeg/png. Product photos and the shop's
  payment QR. Rows store the *object path*, never a URL, so a dump can be
  restored into another project without rewriting every product.
- `payment-proofs` — **private**, 5 MB. The anon key may `INSERT` under
  `proofs/` and nothing else — no list, read, overwrite or delete — so a receipt
  cannot be swapped after a human has approved the order behind it. Staff read
  through a 300-second signed URL and may delete.

---

## 5. Server-side logic (the parts that matter)

**`place_order(payload jsonb)` — SECURITY DEFINER, the security boundary.**
The client sends ids and quantities; the server reads every peso from
`product_sizes` and `addons` itself, prices only add-ons the drink's category
actually offers, silently drops options the category does not support (so a
stale cart still checks out sanely), and caps 40 lines / 50 units per line.
**The client never sends a price.** For an online order it additionally proves
the named receipt object really exists, belongs to no other order, and is not
already condemned — before an order row is cut.

**`get_order(uuid)` — the guests' only read path.** Anonymous users have *no*
select policy on `orders`; holding the uuid is the entire capability. It returns
one order, its lines and its queue position — and deliberately never
`payment_proof_path`.

**`set_order_status`** stamps the accepted / ready / completed / cancelled
timestamps server-side, so queue wait times cannot drift.

**`review_online_order(id, approve, reason)`** — approve and reject are one
function because they are one decision; both are refused for anything not still
`awaiting_approval`, so a second click cannot re-stamp a ticket the barista has
already started.

**`next_order_number()`** — a single upsert-returning statement, so two
simultaneous checkouts serialise on a row lock instead of racing to the same
claim code.

**Chat RPCs** — `get_device_messages`, `send_device_message`,
`claim_order_device`, all gated on `chat_is_open()`.

**Triggers**
- `orders_broadcast_status` → `realtime.send()` to topic `order:<uuid>`.
- `orders_online_window` → refuses an online insert outside trading hours,
  evaluated in Asia/Manila. It **fails open** if the settings row is missing: a
  configuration accident must not silently stop the shop taking money.
- `app_settings_stamp` → updated_at / updated_by from `auth.uid()`.

**RLS shape**
- Menu tables: public read of active rows; staff write.
- `orders` / `order_items` / `order_messages`: staff read and write; **guests
  have no policy at all** and reach their own data only through SECURITY
  DEFINER RPCs keyed on a uuid they already hold.
- `is_staff()` requires an **approved** profile; `is_admin()` gates pricing and
  shop settings; account management is superadmin-only through RPCs, because
  "not yourself, not another superadmin" is a rule a policy cannot express.
- The `customer_message_threads` view is `security_invoker = on` — without it
  the view would run as its owner and hand every conversation in the shop to
  the anon key.

**Retention (`purge_online_data()`, pg_cron + pg_net, hourly)**
A 24-hour window declared once by `online_retention()` and read by everything
that needs it, so a thread can never outlive the messages it displays. Deleting
a `storage.objects` row does not free the bytes, so the job condemns paths into
a queue, fires asynchronous DELETEs at the Storage API through `pg_net`, and
clears queue rows on a later pass once the object has genuinely gone — absence
from `storage.objects` is the only evidence of success it trusts. It also purges
chat threads, nulls the `device_id` behind them (the order row survives as sales
history; the pointer to somebody's phone does not), and auto-rejects orders
nobody reviewed in time with a real explanation and a refund offer.

**Migration discipline:** 20 numbered files, heavily commented with *why*.
Enum-value additions are split into their own file (0007, 0012) because Postgres
refuses to use a new enum value in the transaction that added it. Migrations are
proposed to the user and applied by hand — never run by the tooling.

---

## 6. Realtime architecture

Two mechanisms, because the two audiences have different rights:

- **Admin** — `postgres_changes` on `public.orders` *and* `public.order_messages`,
  which works because staff hold select policies. **One channel, mounted once**
  by `AdminLayout` (`useQueueRealtimeHook`), invalidating three query keys. A
  second subscription would mean a double chime and a double toast.
- **Customer** — Realtime honours RLS, so row-change events would never reach a
  guest. A trigger broadcasts instead to the public topic `order:<uuid>`,
  carrying only `{id, status, ready_at}` and never the customer's name. The chat
  trigger publishes to that same topic, so a reply arrives down a channel the
  tracker already holds. Both payloads are treated as *hints*: the client
  re-reads through the RPC, which stays the only path to detail.
- Polls exist purely as dropped-socket backstops (10s tracker, 45s queue, 60s
  inbox), and the tracker's poll stops at a terminal status.
- First-load suppression: `useFreshRows` records the first set of ids silently,
  so the board does not chime once per waiting ticket on a cold start.

---

## 7. Frontend architecture

**Unidirectional layer flow, strictly enforced:**

```
pages/<Area>/<Name>View.tsx        shell only — title, tabs, one component
  → components/<feature>/<kind>/<PascalCase>.tsx
  → hook/data/<feature>/<name>.<kind>.hook.ts    React Query + orchestration
  → services/data/<domain>/<name>.services.ts    Supabase calls only
  → models/data/<domain>/<name>.{request,response}.ts + enums/
```

Supporting layers: `store/data/<feature>/*.store.ts`, `styles/<area>/*.css.ts`
(**never** colocated with a component), `keys/{query,table,modal,storage}.keys.ts`,
`routes/`, `utils/`, `constants/`, `layouts/`.

**No path aliases** — every import is a deep relative path.

**Pages own nothing.** No query, no state. Components render; hooks decide;
services talk to Supabase; only `utils/supabase.utils.ts` imports the client.

**Hook kinds:** `.list.hook` (query + pagination + filters), `.form.hook` (antd
`Form.useForm` + `useModal` + `useMutation` + notification toasts + invalidate
on success), `.realtime.hook`, `.status.hook`, plus `hook/common/` primitives
(`useModal`, `usePagination`, `useBrandVars`, `useAccentVars`,
`useSheetSwipeHook`, `useStickyHeaderHook`).

**State split, stated as a rule:** *screen state is Zustand, form values are
antd `Form`.* Filters, searches, the options draft and modal open/close all live
in stores keyed via `useModal(key)` / `usePagination(key)`, with the key
declared in `src/keys/`. A throwaway `useState` is allowed only in a leaf
nothing else can read.

**The keyed-registry pattern.** `useModalStore` and `usePaginationStore` are one
store each holding a `Record<string, …>` keyed by caller — not a store per
modal. Both hooks read through a *selector*, so opening one modal does not
re-render every other consumer, and both memoise a stable fallback so an inline
default literal cannot re-fire dependent effects.

**Store reset on sign-out.** `store/common/reset.store.ts` wraps zustand's
`create`, captures each store's initial state, and `resetAllStores()` restores
them all. Two stores deliberately sit **outside** the wrapper: the session store
(it would fight the sign-out flow that is clearing it) and the cart (an admin
signing out on a shared counter tablet must not wipe a customer's cart).

**Reused primitives** (`components/common/`): `CardTable`, `StatusTag`,
`TwoLineCell`, `RowActions`, `EmptyState`, `BrandLoader`, `ConfirmationModal`,
`FormModal`, `ProductImage`, `ChatThread`, `ChatComposer`, `BrandMark`. The rule
is: extend one with a prop before forking a copy.

---

## 8. Styling system

- **A style contract of CSS vars.** `styles/common/vars.css.ts` declares every
  token with `createVar()`; `useBrandVars` assigns them **once** on the app root
  with `assignInlineVars`. Raw hex codes live in exactly one file,
  `constants/brand.constants.ts`, and nothing else in the app may write one.
- **Portals must re-assign.** An antd `Drawer` or `Modal` renders outside the
  root that carries the contract, so those components re-assign it locally (see
  `ProductOptionsDrawer`, `FormModal`).
- **Per-category accents are computed, not hand-picked per rule.**
  `useAccentVars` takes a category's hex and derives four values: the fill, a
  14% tint, ink darkened only as far as WCAG 4.5:1 against the surface demands,
  and the foreground for text laid over the fill. `utils/color.utils.ts`
  implements relative luminance, contrast ratio, channel mixing and `readableOn`.
- The palette is deliberately accessibility-tuned: the status-pill colours and
  the muted text colour carry comments recording the contrast ratios they were
  raised from.
- antd is restyled through theme tokens plus a global sheet rather than wrapped
  in custom components. Theme config lives in `hook/app/app.hook.ts`.
- Motion respects `prefers-reduced-motion` — every scripted scroll routes its
  behaviour through `utils/motion.utils.ts`, and list stagger is capped at ten
  items so a long menu's last card does not wait 1.5s to appear.
- `useStickyHeaderHook` measures the real header with a `ResizeObserver` and
  publishes its height as a var, because the header grows with
  `env(safe-area-inset-top)` on a notched phone and a hardcoded offset would
  slide the category rail behind it.

---

## 9. Load-bearing product rules

1. **The client never sends a price.** If an option costs money it is priced in
   `place_order`, not in the cart.
2. **Guests have no select policy on `orders`.** A permissive one would expose
   every customer's name and order to anyone holding the anon key.
3. **Realtime is mounted once**, in `AdminLayout`.
4. **An online order cannot reach the barista** until a human approves the
   payment; `awaiting_approval` is not a queue status.
5. **Delivery is Davao City only**, enforced twice: the map cannot pin outside
   the box, and a check constraint on `orders` mirrors the same box. A widget is
   not a rule.
6. **`rejected` ≠ `cancelled`.** Rejected means never accepted; cancelled means
   a real order was stopped after acceptance. Different words, different
   colours, different code paths.
7. **A conversation belongs to a person, not a ticket** — staff group by
   normalised `+639XXXXXXXXX` phone; the guest groups by a self-minted
   `device_id` uuid in `localStorage`. Holding the id *is* the permission,
   exactly as holding an order uuid is. It is never rendered, logged or put in a
   URL, and it is deleted along with the conversation.
8. **Staff identity is never shown to the customer** — every reply comes from
   "Pause Coffee"; `staff_id` is recorded for internal accountability only.
9. **Images are compressed in the browser** (canvas → WebP) because Supabase
   image transformation is a paid feature: menu photos 800px/0.82, receipts
   1400px/0.86 (staff must read an amount and a reference off them), QR codes
   1200px/0.95 (lossy artefacts in the finder patterns stop a phone locking on).
10. **No `any`.** `unknown` plus narrowing; `as unknown as T` only at the
    Supabase boundary, where generated types do not exist yet.

---

## 10. Ops and workflow

- `yarn dev` · `yarn build:main` (vite build — the real gate) · `yarn build`
  (`tsc -b && vite build`, currently clean) · `yarn lint`.
- Env: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` only. The service-role
  key never enters the repo, the bundle, or any anon-readable row — it lives in
  Supabase Vault and is decrypted only inside a SECURITY DEFINER function.
- Manual dashboard setup: enable `pg_cron` and `pg_net`; add `project_url` and
  `service_role_key` to Vault; upload the payment QR; turn on email confirmation
  and paste the custom template; set Site URL plus the redirect allow-list.
- Commit convention: `Prefix: Subject` (`Feature`, `BugFix`, `ReDesign`,
  `Migration`, `Refactor`, `Chore`, two joined with `&`); the body is bullets
  only, max 8 words per bullet, no prose and no file lists.
- Code style: every non-obvious decision carries a `///` or `--` comment
  explaining *why*, including what was rejected and what would break if it
  changed. The codebase reads as an argument, not only an implementation.

---

## 11. Known gaps / natural next moves

- No automated tests at all (no vitest, no Playwright) and no CI.
- No Supabase generated types — responses are cast at the boundary.
- No sales analytics or reporting beyond the raw order-history table.
- No push notifications; the PWA is installable but silent when closed.
- No loyalty, customer accounts, saved addresses, or reorder-from-history.
- No inventory or stock tracking; items are toggled on and off by hand.
- Cash on delivery is not supported — online orders are pre-paid only.
- Delivery has no rider assignment, fee, ETA or distance calculation.
- Payment verification is entirely manual eyeballing of a receipt image.
- One shop only — no multi-branch or multi-tenant concept anywhere.
- `menu_group` is a two-value enum (`drinks`, `food`); a third needs a migration.
- English only, no i18n; a single light theme, no dark mode.
