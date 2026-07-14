-- Optional: denormalized XP snapshot on the completed plan day.
-- Ledger of record remains user_points (via awardXP / completePlanDay).
-- Safe to apply later; completePlanDay does not require this column.

alter table public.daily_workouts
  add column if not exists xp_earned integer;
