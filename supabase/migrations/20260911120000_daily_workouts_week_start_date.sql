do $$
begin
  if to_regclass('public.daily_workouts') is not null then
    execute 'alter table public.daily_workouts add column if not exists week_start_date date';

    execute '
      update public.daily_workouts
      set week_start_date = date_trunc(''week'', completed_date::date)::date
      where week_start_date is null
        and completed_date is not null
    ';

    execute '
      create index if not exists daily_workouts_user_week_day_week_start_idx
      on public.daily_workouts (user_id, week_number, day_of_week, week_start_date)
    ';
  end if;
end $$;
