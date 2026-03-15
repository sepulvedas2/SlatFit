import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Calcula XP necessário para o próximo nível
function calcXPProximoNivel(nivel) {
  return Math.floor(100 * Math.pow(1.5, nivel - 1));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { xp_ganho, tipo_acao } = await req.json();
    const userId = user.id || user.email;

    console.log(`[XP] ${user.email} ganhou ${xp_ganho} XP por ${tipo_acao}`);

    // 1. Buscar progresso atual centralizado
    const { data: progress, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_email', user.email)
      .single();

    let currentProgress;
    
    if (fetchError || !progress) {
      // Criar registro inicial
      const { data: newProgress, error: createError } = await supabase
        .from('user_points')
        .insert({
          user_email: user.email,
          total_points: 0,
          level: 1,
          xp_current: 0,
          xp_next_level: 100,
          daily_streak: 0,
          longest_streak: 0,
          weekly_goal: 4,
          updated_date: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('[XP] Erro ao criar progresso:', createError);
        return Response.json({ error: createError.message }, { status: 400 });
      }
      currentProgress = newProgress;
    } else {
      currentProgress = progress;
    }

    // 2. Calcular novo XP
    const novoTotalXP = (currentProgress.total_points || 0) + xp_ganho;
    let novoXPAtual = (currentProgress.xp_current || 0) + xp_ganho;
    let novoNivel = currentProgress.level || 1;
    let xpProximoNivel = currentProgress.xp_next_level || 100;

    // 3. Verificar subida de nível
    const nivelUps = [];
    while (novoXPAtual >= xpProximoNivel) {
      novoXPAtual -= xpProximoNivel;
      novoNivel++;
      xpProximoNivel = calcXPProximoNivel(novoNivel);
      nivelUps.push(novoNivel);
      console.log(`[XP] ${user.email} subiu para nível ${novoNivel}!`);
    }

    // 4. Atualizar streak
    const hoje = new Date().toISOString().split('T')[0];
    const lastActivity = currentProgress.last_workout_date;
    let novoStreak = currentProgress.daily_streak || 0;

    if (lastActivity !== hoje) {
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (lastActivity === ontem) {
        novoStreak++;
      } else if (!lastActivity || lastActivity < ontem) {
        novoStreak = 1;
      }
    }

    // 5. Atualizar contadores
    const updates = {
      total_points: novoTotalXP,
      level: novoNivel,
      xp_current: novoXPAtual,
      xp_next_level: xpProximoNivel,
      daily_streak: novoStreak,
      longest_streak: Math.max(novoStreak, currentProgress.longest_streak || 0),
      last_workout_date: hoje,
      updated_date: new Date().toISOString()
    };

    // 6. Atualizar no banco
    const { data: updated, error: updateError } = await supabase
      .from('user_points')
      .update(updates)
      .eq('user_email', user.email)
      .select()
      .single();

    if (updateError) {
      console.error('[XP] Erro ao atualizar progresso:', updateError);
      return Response.json({ error: updateError.message }, { status: 400 });
    }

    return Response.json({
      success: true,
      xp_ganho,
      tipo_acao,
      progress: {
        ...updated,
        user_id: userId,
        total_xp: updated?.total_points || 0,
        nivel: updated?.level || 1,
        xp_atual: updated?.xp_current || 0,
        xp_para_proximo_nivel: updated?.xp_next_level || 100,
        xp_proximo_nivel: updated?.xp_next_level || 100,
        streak_dias: updated?.daily_streak || 0,
        last_activity_date: updated?.last_workout_date || null,
      },
      level_ups: nivelUps,
      novo_streak: novoStreak
    });

  } catch (error) {
    console.error('[XP] Erro fatal:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});