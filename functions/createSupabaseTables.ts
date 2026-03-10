// =====================================================================
// SQL PARA CRIAR TODAS AS TABELAS NO SUPABASE
// Execute no: Supabase Dashboard → SQL Editor → New Query
// =====================================================================

/*

-- CAMPOS PADRÃO (adicionados automaticamente pelo backend): id, created_date, updated_date, created_by

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  height NUMERIC,
  current_weight NUMERIC,
  target_weight NUMERIC,
  goal TEXT,
  activity_level TEXT,
  gender TEXT,
  age NUMERIC,
  body_type TEXT,
  daily_calorie_target NUMERIC,
  protein_target NUMERIC,
  carbs_target NUMERIC,
  fats_target NUMERIC,
  theme_preference TEXT DEFAULT 'default',
  fitness_level TEXT DEFAULT 'Iniciante',
  dietary_restrictions JSONB,
  training_frequency NUMERIC,
  ai_tone_preference TEXT DEFAULT 'motivacional',
  city TEXT
);

CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  food_name TEXT,
  meal_type TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  portion_size TEXT,
  image_url TEXT,
  log_date DATE
);

CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  name TEXT,
  category TEXT,
  difficulty TEXT,
  target_gender TEXT,
  duration_minutes NUMERIC,
  calories_burned NUMERIC,
  exercises JSONB,
  description TEXT,
  equipment_needed JSONB
);

CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  workout_id TEXT,
  workout_name TEXT,
  completed_date DATE,
  duration_minutes NUMERIC,
  calories_burned NUMERIC,
  notes TEXT,
  rating NUMERIC
);

CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  name TEXT,
  meal_type TEXT,
  goal_type TEXT,
  calories NUMERIC,
  protein NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  ingredients JSONB,
  instructions JSONB,
  prep_time_minutes NUMERIC,
  image_url TEXT,
  dietary_tags JSONB
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  plan TEXT DEFAULT 'free_trial',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  auto_renew BOOLEAN DEFAULT TRUE
);

CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  achievement_type TEXT,
  unlocked_date DATE,
  title TEXT,
  description TEXT
);

CREATE TABLE daily_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  check_in_date DATE,
  energy_level NUMERIC,
  mood TEXT,
  sleep_quality NUMERIC,
  pain_areas JSONB,
  notes TEXT,
  ai_recommendation TEXT
);

CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  title TEXT,
  description TEXT,
  type TEXT,
  duration_days NUMERIC,
  points_reward NUMERIC,
  difficulty TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE
);

CREATE TABLE user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  challenge_id TEXT,
  challenge_title TEXT,
  start_date DATE,
  current_day NUMERIC DEFAULT 1,
  total_days NUMERIC,
  completed_days JSONB,
  status TEXT DEFAULT 'active',
  points_earned NUMERIC DEFAULT 0
);

CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  total_points NUMERIC DEFAULT 0,
  level NUMERIC DEFAULT 1,
  xp_current NUMERIC DEFAULT 0,
  xp_next_level NUMERIC DEFAULT 100,
  rank TEXT DEFAULT 'bronze',
  daily_streak NUMERIC DEFAULT 0,
  longest_streak NUMERIC DEFAULT 0,
  last_workout_date DATE,
  weekly_goal NUMERIC DEFAULT 4,
  weekly_completed NUMERIC DEFAULT 0,
  last_reset_week TEXT
);

CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  photo_url TEXT,
  photo_date DATE,
  weight NUMERIC,
  measurements JSONB,
  notes TEXT,
  ai_analysis TEXT
);

CREATE TABLE motivational_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  entry_date DATE,
  title TEXT,
  content TEXT,
  mood TEXT,
  wins JSONB,
  ai_encouragement TEXT
);

CREATE TABLE iago_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  messages JSONB,
  context_snapshot JSONB,
  last_message_date TIMESTAMPTZ
);

CREATE TABLE nutrition_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  log_date DATE,
  water_intake_ml NUMERIC DEFAULT 0,
  water_goal_ml NUMERIC DEFAULT 2000,
  water_goal_reached BOOLEAN DEFAULT FALSE,
  energy_level NUMERIC,
  mood TEXT,
  had_breakfast BOOLEAN DEFAULT FALSE,
  had_lunch BOOLEAN DEFAULT FALSE,
  had_dinner BOOLEAN DEFAULT FALSE,
  ate_mindfully BOOLEAN DEFAULT FALSE,
  slept_well BOOLEAN DEFAULT FALSE,
  consistency_score NUMERIC DEFAULT 0,
  notes TEXT
);

CREATE TABLE agenda_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  task_date DATE,
  task_time TEXT,
  task_description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  category TEXT DEFAULT 'personal'
);

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  name TEXT,
  description TEXT,
  image_url TEXT,
  reps_suggestion TEXT,
  duration_seconds NUMERIC,
  difficulty TEXT DEFAULT 'intermediario',
  category TEXT DEFAULT 'cardio'
);

CREATE TABLE weekly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  week_number NUMERIC,
  week_start_date DATE,
  days_completed JSONB,
  progress_percentage NUMERIC DEFAULT 0,
  current_week BOOLEAN DEFAULT FALSE
);

CREATE TABLE daily_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  week_number NUMERIC,
  day_of_week TEXT,
  muscle_group TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  exercises_done JSONB
);

CREATE TABLE custom_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  nome_treino TEXT,
  dia_semana TEXT,
  observacoes TEXT,
  source TEXT DEFAULT 'manual'
);

CREATE TABLE custom_workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  custom_workout_id TEXT,
  exercise_name TEXT,
  series TEXT,
  repeticoes TEXT,
  carga TEXT,
  ordem NUMERIC,
  observacoes TEXT
);

CREATE TABLE pr_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  exercise_name TEXT,
  peso_kg NUMERIC,
  repeticoes NUMERIC,
  notes TEXT,
  data_pr DATE,
  weight_kg NUMERIC,
  reps NUMERIC,
  pr_date DATE
);

CREATE TABLE training_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  fitness_level TEXT,
  training_frequency NUMERIC,
  preferred_days JSONB,
  equipment_available JSONB,
  focus_areas JSONB
);

CREATE TABLE ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  feedback_type TEXT,
  content TEXT,
  rating NUMERIC,
  context JSONB
);

CREATE TABLE learning_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  title TEXT,
  content TEXT,
  category TEXT,
  tags JSONB,
  is_premium BOOLEAN DEFAULT FALSE,
  image_url TEXT
);

CREATE TABLE running_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  activity_type TEXT,
  activity_date TIMESTAMPTZ,
  distance_km NUMERIC,
  duration_seconds NUMERIC,
  pace_avg TEXT,
  speed_avg NUMERIC,
  calories_burned NUMERIC,
  goal_distance NUMERIC,
  goal_pace TEXT,
  route_data JSONB,
  is_personal_record BOOLEAN DEFAULT FALSE,
  notes TEXT
);

CREATE TABLE running_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  challenge_type TEXT,
  title TEXT,
  description TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  reward_points NUMERIC DEFAULT 0
);

CREATE TABLE city_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  user_name TEXT,
  city TEXT,
  total_distance_km NUMERIC DEFAULT 0,
  total_runs NUMERIC DEFAULT 0,
  total_time_seconds NUMERIC DEFAULT 0,
  best_pace TEXT,
  longest_run_km NUMERIC DEFAULT 0,
  week_distance_km NUMERIC DEFAULT 0,
  month_distance_km NUMERIC DEFAULT 0,
  points NUMERIC DEFAULT 0,
  last_activity_date TIMESTAMPTZ
);

CREATE TABLE city_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  city TEXT,
  challenge_title TEXT,
  challenge_type TEXT,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  reward_description TEXT,
  participants JSONB
);

CREATE TABLE saved_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  route_name TEXT,
  distance_km NUMERIC,
  times_completed NUMERIC DEFAULT 0,
  best_time_seconds NUMERIC,
  best_pace TEXT,
  activity_ids JSONB,
  route_data JSONB
);

CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  name TEXT,
  emoji TEXT,
  category TEXT,
  xp_per_completion NUMERIC DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  target_days JSONB
);

CREATE TABLE habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  user_email TEXT,
  habit_id TEXT,
  habit_name TEXT,
  log_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  xp_earned NUMERIC DEFAULT 0,
  completed_at TIMESTAMPTZ
);

*/

// Este arquivo é apenas documentação do SQL.
// Execute o SQL acima no: Supabase Dashboard → SQL Editor → New Query

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  return Response.json({ 
    message: "Este endpoint é apenas para documentação. Execute o SQL no Supabase Dashboard.",
    url: "https://supabase.com/dashboard"
  });
});