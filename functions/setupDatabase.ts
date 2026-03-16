import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    console.log('[Database Setup] Iniciando configuração completa do banco...');

    const setupResults = [];

    // 1. USER_PROGRESS - Sistema de XP e Níveis
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_progress (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            user_email text not null unique,
            total_xp integer default 0,
            nivel integer default 1,
            xp_atual integer default 0,
            xp_proximo_nivel integer default 100,
            streak_dias integer default 0,
            longest_streak integer default 0,
            last_activity_date date,
            total_treinos integer default 0,
            total_missoes integer default 0,
            total_desafios integer default 0
          );

          ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "user_progress_all" ON user_progress;
          CREATE POLICY "user_progress_all" ON user_progress
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'user_progress', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'user_progress', status: 'ERROR', error: err.message });
    }

    // 2. RANKING
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS ranking (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            user_email text not null unique,
            user_name text,
            total_xp integer default 0,
            nivel integer default 1,
            posicao integer,
            foto_perfil text
          );

          ALTER TABLE ranking ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "ranking_select" ON ranking;
          CREATE POLICY "ranking_select" ON ranking FOR SELECT USING (true);

          DROP POLICY IF EXISTS "ranking_insert_update" ON ranking;
          CREATE POLICY "ranking_insert_update" ON ranking
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'ranking', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'ranking', status: 'ERROR', error: err.message });
    }

    // 3. HABITS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS habits (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            created_by text,
            user_email text not null,
            user_id text,
            name text not null,
            emoji text,
            category text,
            color text,
            type text default 'binary',
            target_value numeric,
            frequency integer,
            target_unit text,
            notes text,
            ideal_time text,
            preferred_time text,
            created_at timestamptz default now(),
            xp_per_completion integer default 10,
            is_native boolean default false,
            is_active boolean default true
          );

          ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id text;
          ALTER TABLE habits ADD COLUMN IF NOT EXISTS color text;
          ALTER TABLE habits ADD COLUMN IF NOT EXISTS frequency integer;
          ALTER TABLE habits ADD COLUMN IF NOT EXISTS notes text;
          ALTER TABLE habits ADD COLUMN IF NOT EXISTS preferred_time text;
          ALTER TABLE habits ADD COLUMN IF NOT EXISTS created_at timestamptz default now();
          ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "habits_all" ON habits;
          CREATE POLICY "habits_all" ON habits
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'habits', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'habits', status: 'ERROR', error: err.message });
    }

    // 4. HABIT_LOGS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS habit_logs (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            created_by text,
            user_email text not null,
            user_id text,
            habit_id uuid,
            habit_name text,
            date date,
            log_date date not null,
            completed boolean default false,
            xp_earned integer default 0,
            completed_at timestamptz
          );

          ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS user_id text;
          ALTER TABLE habit_logs ADD COLUMN IF NOT EXISTS date date;
          ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "habit_logs_all" ON habit_logs;
          CREATE POLICY "habit_logs_all" ON habit_logs
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'habit_logs', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'habit_logs', status: 'ERROR', error: err.message });
    }

    // 5. WORKOUTS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS workouts (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            created_by text,
            name text not null,
            category text,
            difficulty text,
            target_gender text,
            duration_minutes integer,
            calories_burned integer,
            exercises jsonb,
            description text,
            equipment_needed text[]
          );

          ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "workouts_select" ON workouts;
          CREATE POLICY "workouts_select" ON workouts FOR SELECT USING (true);
        `
      });
      setupResults.push({ table: 'workouts', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'workouts', status: 'ERROR', error: err.message });
    }

    // 6. WORKOUT_LOGS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS workout_logs (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            created_by text,
            user_email text not null,
            workout_id text,
            workout_name text,
            completed_date date,
            duration_minutes integer,
            calories_burned integer,
            notes text,
            rating integer,
            xp_earned integer default 50
          );

          ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "workout_logs_all" ON workout_logs;
          CREATE POLICY "workout_logs_all" ON workout_logs
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'workout_logs', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'workout_logs', status: 'ERROR', error: err.message });
    }

    // 7. DAILY_WORKOUTS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS daily_workouts (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            created_by text,
            user_email text not null,
            week_number integer,
            day_of_week text,
            muscle_group text,
            completed boolean default false,
            completed_date date,
            exercises_done text[],
            xp_earned integer default 50
          );

          ALTER TABLE daily_workouts ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "daily_workouts_all" ON daily_workouts;
          CREATE POLICY "daily_workouts_all" ON daily_workouts
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'daily_workouts', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'daily_workouts', status: 'ERROR', error: err.message });
    }

    // 8. MISSIONS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS missions (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            nome_missao text not null,
            descricao text,
            xp_recompensa integer default 20,
            tipo text,
            is_active boolean default true
          );

          ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "missions_select" ON missions;
          CREATE POLICY "missions_select" ON missions FOR SELECT USING (true);
        `
      });
      setupResults.push({ table: 'missions', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'missions', status: 'ERROR', error: err.message });
    }

    // 9. MISSIONS_PROGRESS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS missions_progress (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            user_email text not null,
            mission_id uuid,
            concluido boolean default false,
            data_conclusao date,
            xp_ganho integer default 0
          );

          ALTER TABLE missions_progress ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "missions_progress_all" ON missions_progress;
          CREATE POLICY "missions_progress_all" ON missions_progress
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'missions_progress', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'missions_progress', status: 'ERROR', error: err.message });
    }

    // 10. CHALLENGES
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS challenges (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            nome_desafio text not null,
            descricao text,
            xp_recompensa integer default 100,
            duracao_dias integer,
            is_active boolean default true
          );

          ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "challenges_select" ON challenges;
          CREATE POLICY "challenges_select" ON challenges FOR SELECT USING (true);
        `
      });
      setupResults.push({ table: 'challenges', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'challenges', status: 'ERROR', error: err.message });
    }

    // 11. USER_CHALLENGES
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_challenges (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            user_email text not null,
            challenge_id uuid,
            challenge_title text,
            start_date date,
            current_day integer default 1,
            total_days integer,
            completed_days date[],
            status text default 'active',
            points_earned integer default 0
          );

          ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "user_challenges_all" ON user_challenges;
          CREATE POLICY "user_challenges_all" ON user_challenges
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'user_challenges', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'user_challenges', status: 'ERROR', error: err.message });
    }

    // 12. DAILY_METRICS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS daily_metrics (
            id uuid primary key default gen_random_uuid(),
            created_date timestamptz default now(),
            updated_date timestamptz default now(),
            user_email text not null,
            user_id text,
            metric_date date not null,
            energia integer default 0,
            foco integer default 0,
            humor integer default 0,
            sono integer default 0
          );

          ALTER TABLE daily_metrics ADD COLUMN IF NOT EXISTS user_id text;
          ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

          DROP POLICY IF EXISTS "daily_metrics_all" ON daily_metrics;
          CREATE POLICY "daily_metrics_all" ON daily_metrics
          FOR ALL USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
        `
      });
      setupResults.push({ table: 'daily_metrics', status: 'OK' });
    } catch (err) {
      setupResults.push({ table: 'daily_metrics', status: 'ERROR', error: err.message });
    }

    console.log('[Database Setup] Configuração concluída');

    return Response.json({
      success: true,
      message: 'Banco de dados configurado com sucesso',
      results: setupResults
    });

  } catch (error) {
    console.error('[Database Setup] Erro fatal:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});