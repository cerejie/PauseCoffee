-- Pause Coffee — name the superadmin.
--
-- Separate from 0007 because Postgres will not let a transaction use an enum
-- value it added itself, and 'superadmin' is added in 0007. Run 0007, let it
-- commit, then run this. Pasting both into one SQL-editor tab will fail with
-- "unsafe use of new value of enum type".
--
-- EDIT THE ADDRESS BELOW before running: it must be the account that owns the
-- software (the developer), not the shop's. It has to exist already — sign in
-- once at /admin/login, or sign up and let the trigger create the row.

do $$
declare
  -- ▼▼▼ the one line to change ▼▼▼
  v_email constant text := 'cerejie@gmail.com';
  v_count integer;
begin
  update public.profiles
  set role = 'superadmin',
      status = 'approved'
  where lower(email) = lower(v_email);

  get diagnostics v_count = row_count;

  if v_count = 0 then
    raise exception
      'No profile found for %. Check the address, or sign that account in once so 0007''s trigger creates its row.',
      v_email;
  end if;
end
$$;
