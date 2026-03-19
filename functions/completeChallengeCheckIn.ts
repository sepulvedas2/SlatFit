import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function getDifficultyXp(challenge) {
  if (challenge?.xp_per_day) return challenge.xp_per_day;
  if (challenge?.difficulty === 'hard') return 40;
  if (challenge?.difficulty === 'medium') return 20;
  return 10;
}

function getStreakBonus(streak) {
  if (streak >= 30) return 300;
  if (streak >= 14) return 120;
  if (streak >= 7) return 50;
  if (streak >= 3) return 20;
  return 0;
}

function getStreakMultiplier(streak) {
  if (streak >= 14) return 1.5;
  if (streak >= 7) return 1.2;
  if (streak >= 3) return 1.1;
  return 1;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { userChallengeId } = await req.json();
    if (!userChallengeId) return Response.json({ error: 'userChallengeId é obrigatório' }, { status: 400 });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const { data: userChallenge, error: userChallengeError } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('id', userChallengeId)
      .eq('user_email', user.email)
      .single();

    if (userChallengeError || !userChallenge) {
      return Response.json({ error: 'Desafio não encontrado' }, { status: 404 });
    }

    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', userChallenge.challenge_id)
      .single();

    if (challengeError || !challenge) {
      return Response.json({ error: 'Definição do desafio não encontrada' }, { status: 404 });
    }

    const completedDays = Array.isArray(userChallenge.completed_days) ? [...userChallenge.completed_days] : [];
    if (completedDays.includes(today)) {
      return Response.json({ error: 'Desafio já concluído hoje' }, { status: 400 });
    }

    const lastCompleted = completedDays[completedDays.length - 1] || null;
    const nextStreak = lastCompleted === yesterday ? (userChallenge.streak_count || 0) + 1 : 1;
    const progressCurrent = (userChallenge.progress_current || completedDays.length || 0) + 1;
    const progressTotal = userChallenge.progress_total || userChallenge.total_days || challenge.duration_days || 1;
    const isCompleted = progressCurrent >= progressTotal;

    completedDays.push(today);

    const baseXp = getDifficultyXp(challenge);
    const xpMultiplier = getStreakMultiplier(nextStreak);
    let xpGain = Math.round(baseXp * xpMultiplier);
    const streakBonus = getStreakBonus(nextStreak);
    if ([3, 7, 14, 30].includes(nextStreak)) xpGain += streakBonus;
    if (isCompleted) xpGain += challenge.xp_completion_bonus || Math.round(progressTotal * baseXp * 0.5);

    await supabase
      .from('user_challenges')
      .update({
        completed_days: completedDays,
        progress_current: progressCurrent,
        progress_total: progressTotal,
        current_day: Math.min(progressCurrent + 1, progressTotal),
        status: isCompleted ? 'completed' : 'active',
        points_earned: (userChallenge.points_earned || 0) + xpGain,
        streak_count: nextStreak,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_date: new Date().toISOString(),
      })
      .eq('id', userChallengeId);

    const { data: streakRow } = await supabase
      .from('user_streak')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentStreak = streakRow?.last_checkin_date === yesterday ? (streakRow.current_streak || 0) + 1 : 1;
    const longestStreak = Math.max(streakRow?.longest_streak || 0, currentStreak);

    if (streakRow) {
      await supabase
        .from('user_streak')
        .update({ current_streak: currentStreak, longest_streak: longestStreak, last_checkin_date: today })
        .eq('user_id', user.id);
    } else {
      await supabase
        .from('user_streak')
        .insert({ user_id: user.id, current_streak: currentStreak, longest_streak: longestStreak, last_checkin_date: today });
    }

    await supabase
      .from('user_xp_log')
      .insert({
        user_id: user.id,
        xp_gained: xpGain,
        source: isCompleted ? 'bonus' : 'challenge',
        reference_id: challenge.id,
        created_at: new Date().toISOString(),
      });

    await base44.functions.invoke('updateXP', { xp_ganho: xpGain, tipo_acao: 'desafio' });

    return Response.json({
      success: true,
      xpGain,
      streakCount: nextStreak,
      progressCurrent,
      progressTotal,
      completed: isCompleted,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});