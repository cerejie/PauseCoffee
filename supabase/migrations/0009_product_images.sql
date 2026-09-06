-- Pause Coffee — product photography.
--
-- The photo is data, not an asset. Staff add and re-shoot items from the
-- masterfile screen, so a file committed to the repo would need a rebuild and
-- a redeploy per drink — the barista cannot do that.
--
-- The column holds the *object path* inside the bucket, never a full URL. The
-- project ref stays out of the rows, so a dump restored into another project
-- does not have to rewrite every product.

alter table public.products
  add column if not exists image_path text;

comment on column public.products.image_path is
  'Object path inside the public "menu-images" bucket. Nullable in the database '
  'because the 0004 seed predates photography; the admin form requires one, so '
  'every item saved from here on has a picture.';

-- ------------------------------------------------------------------- bucket

-- Public on purpose. The menu is already anon-readable (0003), so a signed URL
-- would buy nothing, and a public object is served through the CDN and cached
-- by the browser — which is what keeps a free tier's egress budget intact.
--
-- The size and mime limits live on the bucket, not only in the client, so a
-- hand-rolled request with the anon key cannot bypass them.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'menu-images',
  'menu-images',
  true,
  2097152, -- 2 MB. The browser downscales to ~100 KB before it ever gets here.
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------- rls

-- Mirrors the products table itself: everyone reads, only staff write. A
-- picture must not outlive the permissions of the row that points at it.

drop policy if exists "menu_images_public_read" on storage.objects;
create policy "menu_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'menu-images');

drop policy if exists "menu_images_staff_insert" on storage.objects;
create policy "menu_images_staff_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'menu-images' and public.is_staff());

drop policy if exists "menu_images_staff_update" on storage.objects;
create policy "menu_images_staff_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'menu-images' and public.is_staff())
  with check (bucket_id = 'menu-images' and public.is_staff());

drop policy if exists "menu_images_staff_delete" on storage.objects;
create policy "menu_images_staff_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'menu-images' and public.is_staff());
