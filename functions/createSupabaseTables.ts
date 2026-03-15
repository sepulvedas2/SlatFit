import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    console.log('[Setup] Iniciando configuração do Supabase...');

    // 1. Verificar e criar tabelas essenciais
    const tables = [
      {
        name: 'habits',
        rls: true,
        columns: `
          id uuid primary key default gen_random_uuid(),
          created_date timestamptz default now(),
          updated_date timestamptz default now(),
          created_by text,
          user_email text not null,
          name text not null,
          emoji text,
          category text,
          type text default 'binary',
          target_value numeric,
          target_unit text,
          ideal_time text,
          xp_per_completion integer default 10,
          is_native boolean default false,
          is_active boolean default true
        `
      },
      {
        name: 'habit_logs',
        rls: true,
        columns: `
          id uuid primary key default gen_random_uuid(),
          created_date timestamptz default now(),
          updated_date timestamptz default now(),
          created_by text,
          user_email text not null,
          habit_id uuid,
          habit_name text,
          log_date date not null,
          completed boolean default false,
          xp_earned integer default 0,
          completed_at timestamptz
        `
      },
      {
        name: 'daily_workouts',
        rls: true,
        columns: `
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
          exercises_done text[]
        `
      },
      {
        name: 'user_points',
        rls: true,
        columns: `
          id uuid primary key default gen_random_uuid(),
          created_date timestamptz default now(),
          updated_date timestamptz default now(),
          created_by text,
          user_email text not null unique,
          total_points integer default 0,
          level integer default 1,
          xp_current integer default 0,
          xp_next_level integer default 100,
          rank text default 'bronze',
          daily_streak integer default 0,
          longest_streak integer default 0,
          last_workout_date date,
          weekly_goal integer default 4,
          weekly_completed integer default 0,
          last_reset_week text
        `
      }
    ];

    const results = [];

    for (const table of tables) {
      console.log(`[Setup] Processando tabela: ${table.name}`);
      
      // Tentar criar a tabela (se já existir, vai dar erro que ignoramos)
      const createTableSQL = `CREATE TABLE IF NOT EXISTS ${table.name} (${table.columns});`;
      
      try {
        await supabase.rpc('exec_sql', { sql: createTableSQL });
        console.log(`[Setup] Tabela ${table.name} criada/verificada`);
      } catch (err) {
        console.log(`[Setup] Tabela ${table.name} já existe ou erro:`, err.message);
      }

      // Configurar RLS
      if (table.rls) {
        try {
          await supabase.rpc('exec_sql', { 
            sql: `ALTER TABLE ${table.name} ENABLE ROW LEVEL SECURITY;` 
          });
          
          // Política de leitura (usuário só vê seus próprios dados)
          await supabase.rpc('exec_sql', {
            sql: `
              DROP POLICY IF EXISTS "${table.name}_select_policy" ON ${table.name};
              CREATE POLICY "${table.name}_select_policy" ON ${table.name}
              FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
            `
          });

          // Política de inserção
          await supabase.rpc('exec_sql', {
            sql: `
              DROP POLICY IF EXISTS "${table.name}_insert_policy" ON ${table.name};
              CREATE POLICY "${table.name}_insert_policy" ON ${table.name}
              FOR INSERT WITH CHECK (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
            `
          });

          // Política de atualização
          await supabase.rpc('exec_sql', {
            sql: `
              DROP POLICY IF EXISTS "${table.name}_update_policy" ON ${table.name};
              CREATE POLICY "${table.name}_update_policy" ON ${table.name}
              FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
            `
          });

          // Política de deleção
          await supabase.rpc('exec_sql', {
            sql: `
              DROP POLICY IF EXISTS "${table.name}_delete_policy" ON ${table.name};
              CREATE POLICY "${table.name}_delete_policy" ON ${table.name}
              FOR DELETE USING (user_email = current_setting('request.jwt.claims', true)::json->>'sub');
            `
          });

          console.log(`[Setup] RLS configurado para ${table.name}`);
        } catch (err) {
          console.error(`[Setup] Erro ao configurar RLS para ${table.name}:`, err.message);
        }
      }

      results.push({ table: table.name, status: 'processed' });
    }

    console.log('[Setup] Configuração concluída com sucesso');
    
    return Response.json({
      success: true,
      message: 'Tabelas verificadas/criadas e RLS configurado',
      results
    });

  } catch (error) {
    console.error('[Setup] Erro fatal:', error);
    return Response.json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});