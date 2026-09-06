-- Pause Coffee — admin sign-up and account access control.
--
-- Anyone can now create an admin account from /admin/login, but a fresh account
-- is `pending` and can do nothing at all: is_staff() — the predicate behind
-- every write policy in 0003 — from here on requires an *approved* profile. A
-- superadmin approves, revokes or deletes accounts from the Users screen.
--
-- Roles:
--   superadmin  the developer. The only role that can manage accounts.
--   admin       the shop. Full run of the app; cannot touch accounts.
--   staff       legacy. Nothing grants it any more; the value stays because
--               dropping an enum value would rewrite public.profiles.
--
-- !! RUN THIS FILE AND LET IT COMMIT BEFORE RUNNING 0008 !!
-- Postgres refuses to *use* an enum value in the same transaction that added
-- it, and 0008 is the statement that stamps the first 'superadmin'. For the
-- same reason every role test below is written against `role::text`, which
-- compares text and needs no enum literal.

-- ------------------------------------------------------------------- roles

alter type public.user_role add value if not exists 'superadmin';

do $$
begin
  create type public.access_status as enum ('pending', 'approved', 'revoked');
exception
  when duplicate_object then null;
end
$$;

-- ---------------------------------------------------------------- profiles

-- Added nullable and backfilled rather than added with a default: a default of
-- 'pending' would stamp every existing staff member as pending, and a default
-- of 'approved' would wave through every future sign-up. Nullable-then-fill is
-- also what makes re-running this file safe.
alter table public.profiles
  add column if not exists status public.access_status;

-- Everyone who already had a profile was created by hand, so they stay in.
update public.profiles set status = 'approved' where status is null;

alter table public.profiles alter column status set default 'pending';
alter table public.profiles alter column status set not null;

-- Denormalised from auth.users. The anon client cannot read the auth schema and
-- the Users screen has to show who is asking for access; the trigger below is
-- what keeps this column honest.
alter table public.profiles
  add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and p.email is distinct from u.email;

create index if not exists profiles_status_idx on public.profiles (status);

-- ----------------------------------------------------------- signup trigger

-- supabase.auth.signUp() only writes auth.users. Without this the new account
-- would have no profile row at all, and the Users screen would have nothing to
-- approve. Runs on email changes too, so the denormalised address cannot drift.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    ),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email,
        -- Never overwrite a name a superadmin is already looking at; only fill
        -- one that was never captured.
        full_name = case
          when coalesce(profiles.full_name, '') = '' then excluded.full_name
          else profiles.full_name
        end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_new_auth_user();

-- ------------------------------------------------------------- predicates

-- The one change that makes sign-up safe: a pending or revoked profile is no
-- longer staff, so it fails every policy in 0003 that reads this.
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
      and p.role::text in ('superadmin', 'admin')
  );
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.status = 'approved'
      and p.role::text = 'superadmin'
  );
$$;

grant execute on function public.is_superadmin() to anon, authenticated;

-- --------------------------------------------------------------------- rls

-- Read narrowed from is_admin() to is_superadmin(): an admin runs the shop, it
-- has no reason to read the other accounts' names and email addresses.
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_superadmin());

-- Dropped and not replaced. Both writes a superadmin can make now go through
-- the RPCs below, which can enforce "not yourself, not another superadmin" —
-- rules a USING clause has no way to express.
drop policy if exists "profiles_admin_write" on public.profiles;

-- ------------------------------------------------------------- management

create or replace function public.set_access_status(
  p_user_id uuid,
  p_status public.access_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  if not public.is_superadmin() then
    raise exception 'Only a superadmin can change account access.'
      using errcode = '42501';
  end if;

  -- A superadmin locking itself out would leave the install with no way back in.
  if p_user_id = auth.uid() then
    raise exception 'You cannot change your own access.'
      using errcode = '42501';
  end if;

  select role::text into v_role from public.profiles where id = p_user_id;

  if v_role is null then
    raise exception 'That account no longer exists.'
      using errcode = 'P0002';
  end if;

  if v_role = 'superadmin' then
    raise exception 'A superadmin account cannot be changed here.'
      using errcode = '42501';
  end if;

  update public.profiles
  set status = p_status,
      -- Approval is the grant, and there is exactly one role to grant, so the
      -- role is not a second decision anyone has to remember to make.
      role = case
        when p_status = 'approved' then 'admin'::public.user_role
        else role
      end
  where id = p_user_id;
end;
$$;

-- Hard delete. The profile row goes with it through the existing
-- `references auth.users (id) on delete cascade`.
create or replace function public.delete_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_role text;
begin
  if not public.is_superadmin() then
    raise exception 'Only a superadmin can delete an account.'
      using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'You cannot delete your own account.'
      using errcode = '42501';
  end if;

  select role::text into v_role from public.profiles where id = p_user_id;

  if v_role = 'superadmin' then
    raise exception 'A superadmin account cannot be deleted here.'
      using errcode = '42501';
  end if;

  delete from auth.users where id = p_user_id;
end;
$$;

-- New functions are executable by PUBLIC unless told otherwise. Both of these
-- would fail their own is_superadmin() check, but there is no reason to let the
-- anon key reach them at all.
revoke execute on function public.set_access_status(uuid, public.access_status)
  from public, anon;
revoke execute on function public.delete_user(uuid) from public, anon;

grant execute on function public.set_access_status(uuid, public.access_status)
  to authenticated;
grant execute on function public.delete_user(uuid) to authenticated;
