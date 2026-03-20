import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";

import UserResumoCard from "@/components/progress/UserResumoCard";
import DesafiosAtivosCard from "@/components/progress/DesafiosAtivosCard";
import ExplorarDesafiosCard from "@/components/progress/ExplorarDesafiosCard";
import DesafioDoDiaCard from "@/components/progress/DesafioDoDiaCard";
import RankingModal from "@/components/progress/RankingModal";
import { challengeCatalog, challengeList, challengeMap } from "@/components/progress/challengeCatalog";

export default function Progresso() {
  const [user, setUser] = useState(null);
  const [xpFeedback, setXpFeedback] = useState(null);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [completionToast, setCompletionToast] = useState(null);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: userPoints } = useQuery({
    queryKey: ["userPoints", user?.email],
    queryFn: async () => {
      const rows = await db.UserPoints.filter({ user_email: user.email });
      return rows[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: rankingSnapshot } = useQuery({
    queryKey: ["rankingSnapshot", user?.email],
    queryFn: async () => {
      const rows = await db.UserPoints.list('-created_date', 100);
      const leaderboard = rows
        .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
        .map((row, index) => ({
          ...row,
          posicao: index + 1,
          total_xp: row.total_points || 0,
          nivel: row.level || 1,
          user_name: row.user_email || 'Usuário',
        }));
      const currentUser = leaderboard.find((row) => row.user_email === user.email) || null;
      return {
        currentRank: currentUser?.posicao || null,
        currentXp: currentUser?.total_xp || 0,
        currentLevel: currentUser?.nivel || 1,
        leaderboard: leaderboard.slice(0, 10),
      };
    },
    enabled: !!user?.email,
  });

  const { data: activeChallenges = [] } = useQuery({
    queryKey: ["userChallenges", user?.email],
    queryFn: async () => {
      try {
        return await db.UserChallenge.filter({ user_email: user.email });
      } catch (error) {
        console.error("[Progresso] erro ao buscar desafios ativos:", error);
        return [];
      }
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const activeChallengeIds = useMemo(() => new Set(activeChallenges.filter((challenge) => challenge.status === "active").map((challenge) => challenge.challenge_id)), [activeChallenges]);

  const activeCards = useMemo(() => {
    return activeChallenges
      .map((challenge) => {
        const definition = challengeMap[challenge.challenge_id];
        const progressCurrent = challenge.progress_current || (challenge.completed_days || []).length || 0;
        const progressTotal = challenge.progress_total || challenge.total_days || definition?.durationDays || 1;
        const completedToday = Array.isArray(challenge.completed_days) ? challenge.completed_days.includes(today) : false;
        return {
          ...challenge,
          title: challenge.challenge_title || definition?.title,
          description: definition?.description || "Desafio diário em andamento.",
          progressText: `${progressCurrent}/${progressTotal} dias`,
          progressPercent: Math.min(100, Math.round((progressCurrent / progressTotal) * 100)),
          completedToday,
          streakCount: challenge.streak_count || 0,
          duration_days: definition?.durationDays || challenge.total_days || 1,
          xp_per_day: definition?.dailyXp || 10,
          difficulty: definition?.difficulty || 'Fácil',
          challengeMeta: definition,
        };
      })
      .filter((challenge) => challenge.status === "active")
      .slice(0, 3);
  }, [activeChallenges, today]);

  const dailyChallenge = useMemo(() => {
    const notCompleted = activeCards.find((challenge) => !challenge.completedToday);
    return notCompleted || activeCards[0] || null;
  }, [activeCards]);

  const activateChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      if (activeCards.length >= 3) throw new Error("Você já possui 3 desafios ativos.");
      await db.UserChallenge.create({
        user_email: user.email,
        user_id: user.id,
        challenge_id: challenge.id,
        progress_current: 0,
        progress_total: challenge.durationDays,
        challenge_title: challenge.title,
        start_date: today,
        started_at: new Date().toISOString(),
        current_day: 1,
        total_days: challenge.durationDays,
        completed_days: [],
        status: "active",
        points_earned: 0,
        streak_count: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallenges"] });
    },
  });

  const completeTodayMutation = useMutation({
    mutationFn: async (challenge) => {
      const todayDone = Array.isArray(challenge.completed_days) ? challenge.completed_days : [];
      if (todayDone.includes(today)) throw new Error('Desafio já concluído hoje');

      const nextProgress = (challenge.progress_current || 0) + 1;
      const nextStreak = (challenge.streak_count || 0) + 1;
      const progressTotal = challenge.progress_total || challenge.total_days || challenge.challengeMeta?.durationDays || 1;
      const completed = nextProgress >= progressTotal;
      let xpGain = challenge.xp_per_day || 10;
      if (nextStreak >= 14) xpGain = Math.round(xpGain * 1.5);
      else if (nextStreak >= 7) xpGain = Math.round(xpGain * 1.2);
      else if (nextStreak >= 3) xpGain = Math.round(xpGain * 1.1);
      if (nextStreak === 3) xpGain += 20;
      if (nextStreak === 7) xpGain += 50;
      if (nextStreak === 14) xpGain += 120;
      if (nextStreak === 30) xpGain += 300;
      if (completed) xpGain += challenge.challengeMeta?.xpReward || 0;

      await db.UserChallenge.update(challenge.id, {
        progress_current: nextProgress,
        completed_days: [...todayDone, today],
        streak_count: nextStreak,
        points_earned: (challenge.points_earned || 0) + xpGain,
        status: completed ? 'completed' : 'active',
        completed_at: completed ? new Date().toISOString() : null,
      });

      if (userPoints?.id) {
        const nextLevelXp = userPoints.xp_next_level || 100;
        const rawXp = (userPoints.xp_current || 0) + xpGain;
        const leveledUp = rawXp >= nextLevelXp;
        await db.UserPoints.update(userPoints.id, {
          total_points: (userPoints.total_points || 0) + xpGain,
          xp_current: leveledUp ? rawXp - nextLevelXp : rawXp,
          level: leveledUp ? (userPoints.level || 1) + 1 : (userPoints.level || 1),
          xp_next_level: leveledUp ? Math.round(nextLevelXp * 1.5) : nextLevelXp,
          daily_streak: nextStreak,
          longest_streak: Math.max(userPoints.longest_streak || 0, nextStreak),
        });
      }

      return { xpGain, completed };
    },
    onMutate: async (challenge) => {
      await queryClient.cancelQueries({ queryKey: ["userChallenges", user?.email] });
      await queryClient.cancelQueries({ queryKey: ["userPoints", user?.email] });
      await queryClient.cancelQueries({ queryKey: ["rankingSnapshot", user?.email] });

      const previousChallenges = queryClient.getQueryData(["userChallenges", user?.email]);
      const previousPoints = queryClient.getQueryData(["userPoints", user?.email]);
      const previousRanking = queryClient.getQueryData(["rankingSnapshot", user?.email]);
      const optimisticXp = challenge.xp_per_day || 10;

      setXpFeedback(optimisticXp);
      setTimeout(() => setXpFeedback(null), 1400);

      queryClient.setQueryData(["userChallenges", user?.email], (old = []) =>
        old.map((item) => item.id === challenge.id ? {
          ...item,
          progress_current: (item.progress_current || 0) + 1,
          completed_days: [...(item.completed_days || []), today],
          streak_count: (item.streak_count || 0) + 1,
          points_earned: (item.points_earned || 0) + optimisticXp,
        } : item)
      );

      queryClient.setQueryData(["userPoints", user?.email], (old) => old ? {
        ...old,
        total_points: (old.total_points || 0) + optimisticXp,
        xp_current: (old.xp_current || 0) + optimisticXp,
      } : old);

      queryClient.setQueryData(["rankingSnapshot", user?.email], (old) => old ? {
        ...old,
        currentXp: (old.currentXp || 0) + optimisticXp,
        leaderboard: (old.leaderboard || []).map((entry) => entry.user_email === user?.email ? { ...entry, total_xp: (entry.total_xp || 0) + optimisticXp, total_points: (entry.total_points || 0) + optimisticXp } : entry),
      } : old);

      return { previousChallenges, previousPoints, previousRanking };
    },
    onError: (_error, _challenge, context) => {
      if (context?.previousChallenges) queryClient.setQueryData(["userChallenges", user?.email], context.previousChallenges);
      if (context?.previousPoints) queryClient.setQueryData(["userPoints", user?.email], context.previousPoints);
      if (context?.previousRanking) queryClient.setQueryData(["rankingSnapshot", user?.email], context.previousRanking);
    },
    onSuccess: (result) => {
      if (result?.completed) {
        setCompletionToast(`🎉 Desafio concluído • +${result.xpGain} XP`);
        setTimeout(() => setCompletionToast(null), 2400);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
      queryClient.invalidateQueries({ queryKey: ["rankingSnapshot"] });
    },
  });

  const groupedCategories = useMemo(() => {
    return challengeList.reduce((acc, challenge) => {
      if (!acc[challenge.category]) acc[challenge.category] = [];
      acc[challenge.category].push(challenge);
      return acc;
    }, {});
  }, []);

  const streakValue = userPoints?.daily_streak || 0;

  return (
    <div className="min-h-screen pb-28 pt-6">
      <div className="mx-auto max-w-lg px-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Gamificação</p>
          <h1 className="mt-2 text-3xl font-black text-white">Progresso</h1>
          <p className="mt-2 text-sm text-white/55">Escolha desafios, conclua hoje e avance no ranking com XP real.</p>
        </div>

        <AnimatePresence>
          {xpFeedback && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-2xl border border-[#CEF17B]/30 bg-[#CEF17B]/15 px-4 py-3 text-sm font-bold text-[#CEF17B]">
              +{xpFeedback} XP
            </motion.div>
          )}
          {completionToast && (
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12 }} className="fixed left-1/2 top-40 z-50 -translate-x-1/2 rounded-2xl border border-[#CEF17B]/30 bg-[#0F1C1B] px-4 py-3 text-sm font-bold text-white">
              {completionToast}
            </motion.div>
          )}
        </AnimatePresence>

        <UserResumoCard
          xp={userPoints?.total_points || 0}
          level={userPoints?.level || 1}
          ranking={rankingSnapshot?.currentRank || null}
          streak={streakValue}
          onOpenRanking={() => setRankingOpen(true)}
        />

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80">
          <span className="text-lg">{streakValue >= 14 ? '🔥🔥🔥' : streakValue >= 7 ? '🔥🔥' : '🔥'}</span>
          <span>Streak ativa: {streakValue} dia(s)</span>
        </div>

        <DesafioDoDiaCard challenge={dailyChallenge} onComplete={(challenge) => completeTodayMutation.mutate(challenge)} isSaving={completeTodayMutation.isPending} />
        <DesafiosAtivosCard challenges={activeCards} onCompleteToday={(challenge) => completeTodayMutation.mutate(challenge)} isSaving={completeTodayMutation.isPending} />
        <ExplorarDesafiosCard categories={groupedCategories} activeIds={activeChallengeIds} onActivate={(challenge) => activateChallengeMutation.mutate(challenge)} isSaving={activateChallengeMutation.isPending} />
      </div>

      <RankingModal open={rankingOpen} onClose={() => setRankingOpen(false)} currentXp={rankingSnapshot?.currentXp || userPoints?.total_points || 0} currentRank={rankingSnapshot?.currentRank || null} leaderboard={rankingSnapshot?.leaderboard || []} />
    </div>
  );
}