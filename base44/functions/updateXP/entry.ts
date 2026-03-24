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
    
    console.log(`[XP] ${user.email} ganhou ${xp_ganho} XP por ${tipo_acao}`);

    // 1. Buscar progresso atual
    const { data: progress, error: fetchError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_email', user.email)
      .single();

    let currentProgress;
    
    if (fetchError || !progress) {
      // Criar registro inicial
      const { data: newProgress, error: createError } = await supabase
        .from('user_progress')
        .insert({
          user_email: user.email,
          total_xp: 0,
          nivel: 1,
          xp_atual: 0,
          xp_proximo_nivel: 100,
          streak_dias: 0,
          weekly_goal: 4,
          weekly_completed: 0
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
    const novoTotalXP = currentProgress.total_xp + xp_ganho;
    let novoXPAtual = currentProgress.xp_atual + xp_ganho;
    let novoNivel = currentProgress.nivel;
    let xpProximoNivel = currentProgress.xp_proximo_nivel;

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
    const lastActivity = currentProgress.last_activity_date;
    let novoStreak = currentProgress.streak_dias;

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
      total_xp: novoTotalXP,
      nivel: novoNivel,
      xp_atual: novoXPAtual,
      xp_proximo_nivel: xpProximoNivel,
      streak_dias: novoStreak,
      longest_streak: Math.max(novoStreak, currentProgress.longest_streak || 0),
      last_activity_date: hoje,
      updated_date: new Date().toISOString()
    };

    if (tipo_acao === 'treino') updates.total_treinos = (currentProgress.total_treinos || 0) + 1;
    if (tipo_acao === 'missao') updates.total_missoes = (currentProgress.total_missoes || 0) + 1;
    if (tipo_acao === 'desafio') updates.total_desafios = (currentProgress.total_desafios || 0) + 1;

    // 6. Atualizar no banco
    const { data: updated, error: updateError } = await supabase
      .from('user_progress')
      .update(updates)
      .eq('user_email', user.email)
      .select()
      .single();

    if (updateError) {
      console.error('[XP] Erro ao atualizar progresso:', updateError);
      return Response.json({ error: updateError.message }, { status: 400 });
    }

    // 7. Atualizar ranking
    try {
      const { data: rankingEntry } = await supabase
        .from('ranking')
        .select('*')
        .eq('user_email', user.email)
        .single();

      if (rankingEntry) {
        await supabase
          .from('ranking')
          .update({
            total_xp: novoTotalXP,
            nivel: novoNivel,
            updated_date: new Date().toISOString()
          })
          .eq('user_email', user.email);
      } else {
        await supabase
          .from('ranking')
          .insert({
            user_email: user.email,
            user_name: user.full_name || user.email,
            total_xp: novoTotalXP,
            nivel: novoNivel
          });
      }

      // Recalcular posições
      const { data: allRankings } = await supabase
        .from('ranking')
        .select('user_email, total_xp')
        .order('total_xp', { ascending: false });

      if (allRankings) {
        for (let i = 0; i < allRankings.length; i++) {
          await supabase
            .from('ranking')
            .update({ posicao: i + 1 })
            .eq('user_email', allRankings[i].user_email);
        }
      }

      console.log('[XP] Ranking atualizado');
    } catch (rankError) {
      console.error('[XP] Erro ao atualizar ranking:', rankError);
    }

    return Response.json({
      success: true,
      xp_ganho,
      tipo_acao,
      progress: updated,
      level_ups: nivelUps,
      novo_streak: novoStreak
    });

  } catch (error) {
    console.error('[XP] Erro fatal:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});