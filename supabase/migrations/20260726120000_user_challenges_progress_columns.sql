-- Optional progress columns for user_challenges.
-- Runtime currently persists via completed_days + total_days; these are additive.

alter table if exists public.user_challenges
  add column if not exists progress_current integer default 0;

alter table if exists public.user_challenges
  add column if not exists progress_total integer;

alter table if exists public.user_challenges
  add column if not exists streak_count integer default 0;

alter table if exists public.user_challenges
  add column if not exists started_at timestamptz;

alter table if exists public.user_challenges
  add column if not exists completed_at timestamptz;

update public.user_challenges
set progress_total = coalesce(progress_total, total_days, 1)
where progress_total is null;
