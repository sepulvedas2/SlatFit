import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { userChallengeId, challengeMeta } = await req.json();
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

    const completedDays = Array.isArray(userChallenge.completed_days) ? [...userChallenge.completed_days] : [];
    if (completedDays.includes(today)) {
      return Response.json({ error: 'Desafio já concluído hoje' }, { status: 400 });
    }

    const lastCompleted = completedDays[completedDays.length - 1] || null;
    const nextStreak = lastCompleted === yesterday ? (userChallenge.streak_count || 0) + 1 : 1;
    const progressCurrent = (userChallenge.progress_current || 0) + 1;
    const progressTotal = userChallenge.progress_total || challengeMeta?.durationDays || 1;
    const completed = progressCurrent >= progressTotal;

    completedDays.push(today);

    const baseXp = challengeMeta?.dailyXp || 10;
    let xpGain = Math.round(baseXp * getStreakMultiplier(nextStreak));
    if ([3, 7, 14, 30].includes(nextStreak)) xpGain += getStreakBonus(nextStreak);
    if (completed) xpGain += challengeMeta?.xpReward || Math.round(progressTotal * baseXp * 0.5);

    await supabase
      .from('user_challenges')
      .update({
        completed_days: completedDays,
        progress_current: progressCurrent,
        progress_total: progressTotal,
        current_day: Math.min(progressCurrent + 1, progressTotal),
        status: completed ? 'completed' : 'active',
        points_earned: (userChallenge.points_earned || 0) + xpGain,
        streak_count: nextStreak,
        completed_at: completed ? new Date().toISOString() : null,
        updated_date: new Date().toISOString(),
      })
      .eq('id', userChallengeId);

    const { data: pointsRows } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_email', user.email)
      .limit(1);

    const currentPoints = pointsRows?.[0];
    if (currentPoints) {
      const nextLevelXp = currentPoints.xp_next_level || 100;
      const rawXp = (currentPoints.xp_current || 0) + xpGain;
      const leveledUp = rawXp >= nextLevelXp;
      await supabase
        .from('user_points')
        .update({
          total_points: (currentPoints.total_points || 0) + xpGain,
          xp_current: leveledUp ? rawXp - nextLevelXp : rawXp,
          level: leveledUp ? (currentPoints.level || 1) + 1 : (currentPoints.level || 1),
          xp_next_level: leveledUp ? Math.round(nextLevelXp * 1.5) : nextLevelXp,
          daily_streak: nextStreak,
          longest_streak: Math.max(currentPoints.longest_streak || 0, nextStreak),
          updated_date: new Date().toISOString(),
        })
        .eq('id', currentPoints.id);
    } else {
      await supabase
        .from('user_points')
        .insert({
          user_email: user.email,
          total_points: xpGain,
          level: 1,
          xp_current: xpGain,
          xp_next_level: 100,
          daily_streak: nextStreak,
          longest_streak: nextStreak,
        });
    }

    return Response.json({ success: true, xpGain, progressCurrent, progressTotal, completed, streakCount: nextStreak });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});