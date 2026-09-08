-- Pause Coffee — receipts for online payments.
--
-- Unlike "menu-images" (0009) this bucket is PRIVATE. A receipt carries a name,
-- an account number, a reference and an amount; making it public would put
-- every customer's payment slip behind a guessable CDN URL. Staff read it
-- through a short-lived signed URL instead, which they can mint because they
-- hold a real session.
--
-- The anon key may PUT a file here and do nothing else. It cannot list, read,
-- overwrite or delete — so a receipt, once uploaded, cannot be swapped for a
-- different image after a human has approved the order behind it.

-- ------------------------------------------------------------------ bucket

-- The limits live on the bucket, not only in the client, so a hand-rolled
-- request with the anon key cannot bypass them. The browser downscales to
-- ~80 KB before the upload ever happens (utils/image.utils.ts).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880, -- 5 MB
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- --------------------------------------------------------------------- rls

-- Insert only, and only under proofs/. The customer is anonymous, so there is
-- no owner to scope this to — the narrow prefix plus "no select" is what keeps
-- one guest from reaching another guest's receipt.
drop policy if exists "payment_proofs_guest_insert" on storage.objects;
create policy "payment_proofs_guest_insert" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = 'proofs'
  );

-- Staff read to verify the payment before approving, via createSignedUrl().
drop policy if exists "payment_proofs_staff_read" on storage.objects;
create policy "payment_proofs_staff_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'payment-proofs' and public.is_staff());

-- Staff delete is what lets a rejection free the image immediately, in the same
-- click, rather than waiting for the hourly job in 0017.
drop policy if exists "payment_proofs_staff_delete" on storage.objects;
create policy "payment_proofs_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'payment-proofs' and public.is_staff());

-- Deliberately no UPDATE policy for anyone. A receipt is evidence; replacing
-- its bytes while leaving the row that points at it untouched is exactly the
-- edit nobody should be able to make.

-- ------------------------------------------------------------ purge queue

-- Deleting a row from storage.objects does NOT free the bytes behind it — the
-- object stays in the store and keeps counting against the quota. Freeing it
-- takes a real call to the Storage API, which SQL cannot make synchronously.
-- So the SQL side records what should die here, and 0017's hourly job fires the
-- HTTP deletes and clears the rows whose objects have actually gone.
create table if not exists public.storage_purge_queue (
  bucket text not null,
  path text not null,
  queued_at timestamptz not null default now(),
  -- Bounded retry. A path that cannot be deleted after five hourly passes stays
  -- here, visible, instead of being retried forever in silence.
  attempts smallint not null default 0,
  last_attempt_at timestamptz,
  primary key (bucket, path)
);

alter table public.storage_purge_queue enable row level security;

-- Readable by staff so a stuck row can be seen from a SQL console; written only
-- by the SECURITY DEFINER functions below and in 0017.
drop policy if exists "storage_purge_queue_staff_read" on public.storage_purge_queue;
create policy "storage_purge_queue_staff_read" on public.storage_purge_queue
  for select to authenticated using (public.is_staff());

create or replace function public.queue_storage_purge(p_bucket text, p_path text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.storage_purge_queue (bucket, path)
  select p_bucket, p_path
  where p_path is not null and p_path <> ''
  on conflict (bucket, path) do nothing;
$$;

revoke execute on function public.queue_storage_purge(text, text) from public, anon;
