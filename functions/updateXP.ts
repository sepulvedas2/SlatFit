import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function calcXPProximoNivel(nivel) {
  return Math.floor(100 * Math.pow(1.5, nivel - 1));
}

function getWeekKey() {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  return start.toISOString().split('T')[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { xp_ganho, tipo_acao, metadata = {} } = await req.json();
    if (!xp_ganho || xp_ganho <= 0) {
      return Response.json({ error: 'xp_ganho inválido' }, { status: 400 });
    }

    console.log(`[XP] ${user.email} ganhou ${xp_ganho} XP por ${tipo_acao}`);

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let currentProgress = progress;
    if (!currentProgress) {
      const { data: newProgress, error: createError } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          user_email: user.email,
          total_xp: 0,
          nivel: 1,
          xp_atual: 0,
          xp_para_proximo_nivel: 100,
          streak_dias: 0,
          longest_streak: 0,
          weekly_goal: 4,
          weekly_completed: 0,
          last_reset_week: getWeekKey(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('[XP] Erro ao criar progresso:', createError);
        return Response.json({ error: createError.message }, { status: 400 });
      }
      currentProgress = newProgress;
    }

    const hoje = new Date().toISOString().split('T')[0];
    const weekKey = getWeekKey();
    const lastActivity = currentProgress.last_activity_date;
    const streakBase = currentProgress.streak_dias || 0;
    let novoStreak = streakBase;

    if (lastActivity !== hoje) {
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastActivity === ontem) novoStreak += 1;
      else novoStreak = 1;
    }

    let weeklyCompleted = currentProgress.weekly_completed || 0;
    if ((currentProgress.last_reset_week || weekKey) !== weekKey) {
      weeklyCompleted = 0;
    }
    if (tipo_acao === 'treino') {
      weeklyCompleted += 1;
    }

    const novoTotalXP = (currentProgress.total_xp || 0) + xp_ganho;
    let novoXPAtual = (currentProgress.xp_atual || 0) + xp_ganho;
    let novoNivel = currentProgress.nivel || 1;
    let xpProximoNivel = currentProgress.xp_para_proximo_nivel || currentProgress.xp_proximo_nivel || 100;
    const levelUps = [];

    while (novoXPAtual >= xpProximoNivel) {
      novoXPAtual -= xpProximoNivel;
      novoNivel += 1;
      xpProximoNivel = calcXPProximoNivel(novoNivel);
      levelUps.push(novoNivel);
    }

    const updates = {
      user_email: user.email,
      total_xp: novoTotalXP,
      nivel: novoNivel,
      xp_atual: novoXPAtual,
      xp_para_proximo_nivel: xpProximoNivel,
      streak_dias: novoStreak,
      longest_streak: Math.max(novoStreak, currentProgress.longest_streak || 0),
      last_activity_date: hoje,
      weekly_goal: currentProgress.weekly_goal || 4,
      weekly_completed: weeklyCompleted,
      last_reset_week: weekKey,
      total_treinos: tipo_acao === 'treino' ? (currentProgress.total_treinos || 0) + 1 : (currentProgress.total_treinos || 0),
      total_missoes: tipo_acao === 'missao' ? (currentProgress.total_missoes || 0) + 1 : (currentProgress.total_missoes || 0),
      total_desafios: tipo_acao === 'desafio' ? (currentProgress.total_desafios || 0) + 1 : (currentProgress.total_desafios || 0),
      updated_at: new Date().toISOString()
    };

    const { data: updated, error: updateError } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('[XP] Erro ao atualizar progresso:', updateError);
      return Response.json({ error: updateError.message }, { status: 400 });
    }

    await supabase.from('xp_events').insert({
      user_id: user.id,
      user_email: user.email,
      tipo_acao,
      xp_ganho,
      total_xp_apos: novoTotalXP,
      metadata,
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      xp_ganho,
      tipo_acao,
      progress: updated,
      level_ups: levelUps,
      novo_streak: novoStreak
    });
  } catch (error) {
    console.error('[XP] Erro fatal:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});