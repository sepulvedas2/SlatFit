-- Per-user daily AI usage counter, used by SlatFit BE to enforce a daily quota
-- on AI operations (POST /ai/:operation). Written only by the service role.

create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- The backend uses the service-role key (bypasses RLS). Enable RLS with no
-- policies so end-user JWTs can never read or tamper with usage counters.
alter table public.ai_usage enable row level security;
