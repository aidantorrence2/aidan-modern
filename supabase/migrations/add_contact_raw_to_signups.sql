-- Store the raw contact value exactly as the user typed it, alongside the
-- normalized E.164 `contact`. Without this, a mis-normalized number can't be
-- recovered for review. Run in the Supabase SQL editor before deploying the
-- matching app/api/sign-up change.
alter table public.signups
  add column if not exists contact_raw text;
