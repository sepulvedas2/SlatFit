begin;

alter table if exists public.subscriptions
  add column if not exists billing_plan text,
  add column if not exists has_paid_access boolean not null default false,
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_status text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists latest_invoice_id text,
  add column if not exists latest_payment_intent_id text,
  add column if not exists paid_at timestamptz,
  add column if not exists canceled_at timestamptz,
  add column if not exists refund_requested_at timestamptz,
  add column if not exists refunded_at timestamptz,
  add column if not exists stripe_refund_id text,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.subscriptions
  drop constraint if exists subscriptions_billing_plan_check;

alter table if exists public.subscriptions
  add constraint subscriptions_billing_plan_check
  check (billing_plan is null or billing_plan in ('monthly', 'semester', 'annual'));

create unique index if not exists subscriptions_stripe_customer_id_key
  on public.subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists subscriptions_stripe_subscription_id_key
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists subscriptions_latest_payment_intent_id_idx
  on public.subscriptions (latest_payment_intent_id)
  where latest_payment_intent_id is not null;

create table if not exists public.stripe_events (
  event_id text primary key,
  event_type text not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.stripe_events enable row level security;

commit;
