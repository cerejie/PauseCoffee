-- Pause Coffee — keeping online ordering small.
--
-- An online order's footprint is almost entirely its receipt: the order row and
-- its lines come to roughly 600 bytes, a chat thread to a few kilobytes, and
-- the image to about 80 KB. So the image is what this file is really about.
--
-- Deleting a row from storage.objects does NOT free the bytes behind it — the
-- object stays in the store and keeps counting against the quota. Only a call
-- to the Storage API frees it, and SQL cannot make one synchronously. Hence the
-- shape here: the purge condemns paths into storage_purge_queue (0014), fires
-- asynchronous DELETEs through pg_net, and clears each queue row on a later
-- pass once the object has actually gone. Absence from storage.objects is the
-- only evidence of success this design trusts.
--
-- ===========================================================================
-- BEFORE THIS FILE WILL DO ANYTHING, three things must be set up by hand:
--
--   1. Extensions — Dashboard › Database › Extensions, enable `pg_cron` and
--      `pg_net`. This file asserts them and stops with a clear message if they
--      are missing; it will not create them, because the schema they land in
--      matters and the Dashboard is what gets it right.
--
--   2. Vault secrets — Dashboard › Project Settings › Vault, add two:
--        project_url        https://<your-ref>.supabase.co
--        service_role_key   <the service_role key from Project Settings › API>
--      The service key never enters this repo, the client bundle, or any row
--      the anon key can read. It is decrypted only inside the SECURITY DEFINER
--      function below.
--
--   3. Payment QR — upload the shop's GCash/bank QR to the EXISTING public
--      bucket at menu-images/shop/payment-qr.webp. Nothing here does that;
--      it is listed so the three manual steps sit together.
--
-- Without step 2 the job still runs, still deletes rows, and warns that the
-- images are piling up unqueued rather than failing silently.
-- ===========================================================================

-- Asserted, not created. Enabling these from the Dashboard puts them in the
-- schemas Supabase expects; a bare `create extension` here could land pg_cron
-- somewhere `cron.schedule` will not resolve. Fail loudly instead of guessing.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_net') then
    raise exception
      'pg_net is not enabled. Dashboard > Database > Extensions > enable pg_net, then run this file again.';
  end if;

  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception
      'pg_cron is not enabled. Dashboard > Database > Extensions > enable pg_cron, then run this file again.';
  end if;
end
$$;

-- ---------------------------------------------------------- rejection log

-- What survives a purged rejection. No customer data — a number, a time, who
-- said no and why. Roughly 50 bytes a row, which buys the ability to notice
-- "we rejected forty orders overnight" instead of seeing nothing at all.
create table if not exists public.rejected_order_log (
  id bigint generated always as identity primary key,
  order_number text not null,
  rejected_at timestamptz not null,
  -- No foreign key on purpose: the log must outlive the staff account that
  -- made the call, and 0007's delete_user() removes those for real.
  rejected_by uuid,
  reason text,
  purged_at timestamptz not null default now()
);

create index if not exists rejected_order_log_rejected_at_idx
  on public.rejected_order_log (rejected_at desc);

alter table public.rejected_order_log enable row level security;

drop policy if exists "rejected_order_log_staff_read" on public.rejected_order_log;
create policy "rejected_order_log_staff_read" on public.rejected_order_log
  for select to authenticated using (public.is_staff());

-- Written only by purge_online_data() below, which is SECURITY DEFINER. No
-- insert policy exists, so nothing else can forge an entry.

-- ------------------------------------------------------------- purge indexes

-- Each pass of the job below must be an index scan, not a table sweep. These
-- are partial so they stay tiny however large the order history grows.
create index if not exists orders_receipt_purge_idx
  on public.orders (coalesce(completed_at, cancelled_at))
  where order_channel = 'online' and payment_proof_path is not null;

create index if not exists orders_rejected_purge_idx
  on public.orders (rejected_at)
  where status = 'rejected';

-- ------------------------------------------------------------- the drain

create or replace function public.drain_storage_purge_queue(p_limit integer default 100)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_key text;
  v_row record;
  v_sent integer := 0;
begin
  select decrypted_secret into v_url
  from vault.decrypted_secrets where name = 'project_url';

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'service_role_key';

  if v_url is null or v_key is null then
    raise warning
      'storage purge: vault secrets project_url / service_role_key not set — % objects left queued',
      (select count(*) from public.storage_purge_queue);
    return 0;
  end if;

  for v_row in
    select bucket, path
    from public.storage_purge_queue
    -- A path that has survived five hourly passes is not going to delete on the
    -- sixth. It stays here, visible to a staff SELECT, rather than being
    -- retried forever in silence.
    where attempts < 5
    order by queued_at
    limit p_limit
  loop
    perform net.http_delete(
      url := rtrim(v_url, '/') || '/storage/v1/object/' || v_row.bucket || '/' || v_row.path,
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_key,
        'apikey', v_key
      )
    );

    -- The request is asynchronous: whether it succeeded is not knowable inside
    -- this transaction. So the row is not deleted here — the next pass removes
    -- it once the object has genuinely left storage.objects.
    update public.storage_purge_queue
    set attempts = attempts + 1,
        last_attempt_at = now()
    where bucket = v_row.bucket and path = v_row.path;

    v_sent := v_sent + 1;
  end loop;

  return v_sent;
end;
$$;

revoke execute on function public.drain_storage_purge_queue(integer) from public, anon;

-- --------------------------------------------------------------- the purge

create or replace function public.purge_online_data()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_cutoff timestamptz := v_now - public.online_retention();
  v_cleared integer := 0;
  v_messages integer := 0;
  v_receipts integer := 0;
  v_expired integer := 0;
  v_purged integer := 0;
  v_orphans integer := 0;
  v_sent integer := 0;
begin
  -- 1. Confirm. Anything that has actually left the object store leaves the
  --    queue with it. This is the only place a queue row is ever cleared.
  delete from public.storage_purge_queue q
  where not exists (
    select 1 from storage.objects o
    where o.bucket_id = q.bucket and o.name = q.path
  );
  get diagnostics v_cleared = row_count;

  -- 2. Conversations on orders that ended more than one retention period ago.
  --    Same window as chat_is_open(), so no thread is ever readable-but-empty.
  delete from public.order_messages m
  using public.orders o
  where o.id = m.order_id
    and coalesce(o.completed_at, o.cancelled_at) < v_cutoff;
  get diagnostics v_messages = row_count;

  -- 3. Receipts on finished orders. The order, its lines and its payment
  --    reference all stay — that is the sales history. Only the image goes.
  with due as (
    select id, payment_proof_path
    from public.orders
    where order_channel = 'online'
      and payment_proof_path is not null
      and coalesce(completed_at, cancelled_at) < v_cutoff
    limit 500
  ),
  -- A data-modifying CTE runs to completion whether or not the outer query
  -- reads it, so the paths are condemned before the pointers are dropped.
  condemned as (
    insert into public.storage_purge_queue (bucket, path)
    select 'payment-proofs', payment_proof_path from due
    on conflict (bucket, path) do nothing
    returning 1
  )
  update public.orders o
  set payment_proof_path = null
  from due
  where o.id = due.id;
  get diagnostics v_receipts = row_count;

  -- 4. Orders nobody ever reviewed. Without this, a weekend where the shop
  --    never opened the admin app leaves receipts sitting indefinitely. The
  --    customer gets a real reason rather than a ticket that simply rots.
  update public.orders
  set status = 'rejected',
      rejected_at = v_now,
      rejection_reason = 'We did not get to this order in time. Message us and we will sort out a refund.'
  where status = 'awaiting_approval'
    and placed_at < v_cutoff;
  get diagnostics v_expired = row_count;

  if v_expired > 0 then
    insert into public.storage_purge_queue (bucket, path)
    select 'payment-proofs', payment_proof_path
    from public.orders
    where status = 'rejected'
      and rejected_at = v_now
      and payment_proof_path is not null
    on conflict (bucket, path) do nothing;
  end if;

  -- 5. Rejected orders, logged and then gone. Their receipts were condemned
  --    when the rejection happened (0015) or in step 4 above.
  with gone as (
    delete from public.orders
    where status = 'rejected'
      and rejected_at < v_cutoff
    returning order_number, rejected_at, rejected_by, rejection_reason
  )
  insert into public.rejected_order_log (order_number, rejected_at, rejected_by, reason)
  select order_number, rejected_at, rejected_by, rejection_reason from gone;
  get diagnostics v_purged = row_count;

  -- 6. Uploads that never became an order — someone picked a receipt and then
  --    closed the tab. Two hours is generous for a checkout still in progress.
  --    This step is also the safety net for every other one: an object whose
  --    order has gone but whose delete never landed reappears here next hour.
  insert into public.storage_purge_queue (bucket, path)
  select 'payment-proofs', o.name
  from storage.objects o
  where o.bucket_id = 'payment-proofs'
    and o.created_at < v_now - interval '2 hours'
    and not exists (
      select 1 from public.orders x where x.payment_proof_path = o.name
    )
  limit 500
  on conflict (bucket, path) do nothing;
  get diagnostics v_orphans = row_count;

  -- 7. Fire the actual deletions for everything condemned so far.
  v_sent := public.drain_storage_purge_queue();

  return jsonb_build_object(
    'ran_at', v_now,
    'queue_rows_cleared', v_cleared,
    'messages_deleted', v_messages,
    'receipts_condemned', v_receipts,
    'orders_auto_rejected', v_expired,
    'rejected_orders_purged', v_purged,
    'orphans_found', v_orphans,
    'delete_requests_sent', v_sent
  );
end;
$$;

revoke execute on function public.purge_online_data() from public, anon;

-- ------------------------------------------------------------- the schedule

-- Hourly, off the hour so it does not land with every other cron on the box.
-- Every step is capped at 500 rows, so a backlog drains over several passes
-- instead of holding locks through one long one.
do $$
begin
  perform cron.unschedule('purge-online-data');
exception
  when others then null; -- not scheduled yet; nothing to replace
end
$$;

select cron.schedule(
  'purge-online-data',
  '17 * * * *',
  $job$ select public.purge_online_data() $job$
);
