/**
 * updateXP — Sistema ÚNICO de XP do SlatFit
 * 
 * Fonte da verdade: tabela user_points (Supabase)
 * Campos: total_points, level, xp_current, xp_next_level, daily_streak, longest_streak, last_workout_date
 * 
 * Chamado por: Workouts (treino concluído), Habits (hábito concluído)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function calcXPNextLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function calcRank(level) {
  if (level >= 9) return 'diamond';
  if (level >= 7) return 'platinum';
  if (level >= 5) return 'gold';
  if (level >= 3) return 'silver';
  return 'bronze';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const xp_ganho = body.xp_ganho || body.points || 0;
    const tipo_acao = body.tipo_acao || body.action_type || 'generic';

    console.log(`[XP] ${user.email} +${xp_ganho} XP por: ${tipo_acao}`);

    // 1. Buscar registro atual de pontos
    const { data: rows, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_email', user.email)
      .limit(1);

    if (fetchError) {
      console.error('[XP] Erro ao buscar user_points:', fetchError.message);
      return Response.json({ error: fetchError.message }, { status: 400 });
    }

    const current = rows?.[0];
    const hoje = new Date().toISOString().split('T')[0];

    // 2. Calcular novos valores
    const totalAnterior = current?.total_points || 0;
    const novoTotal = totalAnterior + xp_ganho;

    let nivel = current?.level || 1;
    let xpAtual = current?.xp_current || 0;
    let xpProximo = current?.xp_next_level || calcXPNextLevel(nivel);

    xpAtual += xp_ganho;

    // Subida de nível
    const nivelUps = [];
    while (xpAtual >= xpProximo) {
      xpAtual -= xpProximo;
      nivel++;
      xpProximo = calcXPNextLevel(nivel);
      nivelUps.push(nivel);
      console.log(`[XP] ${user.email} SUBIU para nível ${nivel}!`);
    }

    // 3. Calcular streak
    const lastDate = current?.last_workout_date;
    const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let streak = current?.daily_streak || 0;

    if (lastDate !== hoje) {
      if (lastDate === ontem) streak++;
      else if (!lastDate || lastDate < ontem) streak = 1;
    }

    const longestStreak = Math.max(streak, current?.longest_streak || 0);

    // 4. Montar payload de update
    const updates = {
      total_points: novoTotal,
      level: nivel,
      xp_current: xpAtual,
      xp_next_level: xpProximo,
      rank: calcRank(nivel),
      daily_streak: streak,
      longest_streak: longestStreak,
      last_workout_date: hoje,
      updated_date: new Date().toISOString(),
    };

    if (tipo_acao === 'treino') updates.weekly_completed = (current?.weekly_completed || 0) + 1;

    // 5. Upsert (insert se não existe, update se existe)
    let result;
    if (!current) {
      const { data: inserted, error: insertError } = await supabase
        .from('user_points')
        .insert({ user_email: user.email, created_by: user.email, ...updates })
        .select()
        .single();

      if (insertError) {
        console.error('[XP] Erro ao criar user_points:', insertError.message);
        return Response.json({ error: insertError.message }, { status: 400 });
      }
      result = inserted;
    } else {
      const { data: updated, error: updateError } = await supabase
        .from('user_points')
        .update(updates)
        .eq('user_email', user.email)
        .select()
        .single();

      if (updateError) {
        console.error('[XP] Erro ao atualizar user_points:', updateError.message);
        return Response.json({ error: updateError.message }, { status: 400 });
      }
      result = updated;
    }

    console.log(`[XP] Salvo: total=${novoTotal} nivel=${nivel} xp=${xpAtual}/${xpProximo} streak=${streak}`);

    return Response.json({
      success: true,
      xp_ganho,
      tipo_acao,
      user_points: result,
      level_ups: nivelUps,
      novo_streak: streak,
    });

  } catch (error) {
    console.error('[XP] Erro fatal:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});