-- Public profile avatar for Ranking Top 10 and in-app display.
-- Consent timestamp is required before avatar_url is set by the app.

alter table if exists public.user_profiles
  add column if not exists avatar_url text;

alter table if exists public.user_profiles
  add column if not exists avatar_public_consent_at timestamptz;
