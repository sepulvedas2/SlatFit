-- Move private app ownership from copied email values to Supabase auth user ids.
-- `user_email` is kept nullable for one compatibility release; RLS and new writes
-- should use `user_id`.

begin;

alter table if exists public.user_profiles
  add column if not exists email text;

do $$
begin
  if to_regclass('public.user_profiles') is not null then
    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_profiles'
        and column_name = 'user_id'
    ) then
      alter table public.user_profiles add column user_id uuid;
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'user_profiles'
        and column_name = 'user_id'
        and udt_name <> 'uuid'
    ) then
      alter table public.user_profiles
        alter column user_id type uuid
        using case
          when user_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then user_id::uuid
          else null
        end;
    end if;
  end if;
end $$;

update public.user_profiles p
set email = coalesce(p.email, u.email),
    user_id = coalesce(p.user_id, u.id)
from auth.users u
where p.id::text = u.id::text;

create unique index if not exists user_profiles_email_key
  on public.user_profiles (lower(email))
  where email is not null;

do $$
declare
  tbl text;
  owned_tables text[] := array[
    'food_logs',
    'workout_logs',
    'meal_plans',
    'subscriptions',
    'achievements',
    'daily_check_ins',
    'user_challenges',
    'user_points',
    'progress_photos',
    'motivational_journals',
    'iago_conversations',
    'nutrition_data',
    'agenda_tasks',
    'weekly_progress',
    'daily_workouts',
    'custom_workouts',
    'pr_records',
    'training_profiles',
    'ai_feedback',
    'running_activities',
    'saved_routes',
    'habits',
    'habit_logs',
    'daily_metrics',
    'user_progress',
    'missions_progress',
    'ranking'
  ];
  bad_count bigint;
begin
  foreach tbl in array owned_tables loop
    if to_regclass(format('public.%I', tbl)) is null then
      continue;
    end if;

    if not exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = tbl
        and column_name = 'user_id'
    ) then
      execute format('alter table public.%I add column user_id uuid', tbl);
    elsif exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = tbl
        and column_name = 'user_id'
        and udt_name <> 'uuid'
    ) then
      execute format(
        'alter table public.%I alter column user_id type uuid using case when user_id ~* %L then user_id::uuid else null end',
        tbl,
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      );
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = tbl
        and column_name = 'user_email'
    ) then
      execute format(
        'update public.%1$I t set user_id = p.id::uuid
         from public.user_profiles p
         where t.user_id is null
           and t.user_email is not null
           and p.email is not null
           and lower(t.user_email) = lower(p.email)
           and p.id::text ~* %2$L',
        tbl,
        '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      );

      execute format(
        'update public.%1$I t set user_id = u.id
         from auth.users u
         where t.user_id is null
           and t.user_email is not null
           and u.email is not null
           and lower(t.user_email) = lower(u.email)',
        tbl
      );

      execute format('alter table public.%I alter column user_email drop not null', tbl);

      execute format('select count(*) from public.%I where user_id is null', tbl) into bad_count;

      if bad_count > 0 then
        raise notice '%.% row(s) still have no auth user_id owner', tbl, bad_count;
      else
        execute format('alter table public.%I alter column user_id set not null', tbl);
      end if;
    end if;

    execute format('create index if not exists %I on public.%I (user_id)', tbl || '_user_id_idx', tbl);

    begin
      execute format(
        'alter table public.%I add constraint %I foreign key (user_id) references auth.users(id) on delete cascade',
        tbl,
        tbl || '_user_id_fkey'
      );
    exception
      when duplicate_object then null;
      when invalid_table_definition then null;
      when foreign_key_violation then
        raise notice 'Skipping %.user_id foreign key because unmatched rows remain', tbl;
    end;
  end loop;
end $$;

do $$
begin
  if to_regclass('public.user_progress') is not null then
    create unique index if not exists user_progress_user_id_key on public.user_progress (user_id);
  end if;
  if to_regclass('public.user_points') is not null then
    create unique index if not exists user_points_user_id_key on public.user_points (user_id);
  end if;
  if to_regclass('public.ranking') is not null then
    create unique index if not exists ranking_user_id_key on public.ranking (user_id);
  end if;
end $$;

alter table if exists public.user_profiles enable row level security;
drop policy if exists "user_profiles_all" on public.user_profiles;
create policy "user_profiles_all" on public.user_profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare
  tbl text;
  owned_tables text[] := array[
    'food_logs',
    'workout_logs',
    'meal_plans',
    'subscriptions',
    'achievements',
    'daily_check_ins',
    'user_challenges',
    'user_points',
    'progress_photos',
    'motivational_journals',
    'iago_conversations',
    'nutrition_data',
    'agenda_tasks',
    'weekly_progress',
    'daily_workouts',
    'custom_workouts',
    'pr_records',
    'training_profiles',
    'ai_feedback',
    'running_activities',
    'saved_routes',
    'habits',
    'habit_logs',
    'daily_metrics',
    'user_progress',
    'missions_progress'
  ];
  policy_name text;
begin
  foreach tbl in array owned_tables loop
    if to_regclass(format('public.%I', tbl)) is null then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', tbl);

    for policy_name in
      select policyname from pg_policies where schemaname = 'public' and tablename = tbl
    loop
      execute format('drop policy if exists %I on public.%I', policy_name, tbl);
    end loop;

    execute format(
      'create policy %I on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      tbl || '_owner_all',
      tbl
    );
  end loop;
end $$;

alter table if exists public.ranking enable row level security;
drop policy if exists "ranking_select" on public.ranking;
drop policy if exists "ranking_insert_update" on public.ranking;
drop policy if exists "ranking_owner_all" on public.ranking;
create policy "ranking_select" on public.ranking for select using (true);
create policy "ranking_owner_all" on public.ranking
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
