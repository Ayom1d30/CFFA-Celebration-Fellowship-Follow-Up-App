-- Repair: the 0004 seed inserted auth.users rows directly, leaving GoTrue's
-- string token columns as NULL. GoTrue scans those columns as strings, so any
-- attempt to sign in fails with "Database error querying schema".
-- This backfills empty strings for any affected rows and removes the test
-- identity added during debugging so seeded users stay uniform.
-- Apply AFTER 0004_seed_data.sql (idempotent).

update auth.users set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change = coalesce(email_change, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where confirmation_token is null
   or recovery_token is null
   or email_change is null
   or email_change_token_new is null
   or reauthentication_token is null;

delete from auth.identities
where user_id in (select id from public.users where email = 'coordinator@celebration.org');
