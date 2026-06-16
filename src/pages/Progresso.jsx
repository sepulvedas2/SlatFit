import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/components/supabaseApi";

import UserResumoCard from "@/components/progress/UserResumoCard";
import DesafiosAtivosCard from "@/components/progress/DesafiosAtivosCard";
import ExplorarDesafiosCard from "@/components/progress/ExplorarDesafiosCard";
import DesafioDoDiaCard from "@/components/progress/DesafioDoDiaCard";
import RankingModal from "@/components/progress/RankingModal";
import { challengeCatalog, challengeList, challengeMap } from "@/components/progress/challengeCatalog";

export default function Progresso() {
  const { user } = useAuth();
  const [xpFeedback, setXpFeedback] = useState(null);
  const [rankingOpen, setRankingOpen] = useState(false);
  const [completionToast, setCompletionToast] = useState(null);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: userPoints } = useQuery({
    queryKey: ["userPoints", user?.id],
    queryFn: async () => {
      const rows = await db.UserPoints.filter({ user_id: user.id });
      return rows[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: rankingSnapshot } = useQuery({
    queryKey: ["rankingSnapshot", user?.id],
    queryFn: async () => {
      const response = await api.functions.invoke("getRankingSnapshot", {});
      return response.data;
    },
    enabled: !!user?.id,
  });

  const { data: activeChallenges = [] } = useQuery({
    queryKey: ["userChallenges", user?.id],
    queryFn: async () => {
      try {
        return await db.UserChallenge.filter({ user_id: user.id });
      } catch (error) {
        console.error("[Progresso] erro ao buscar desafios ativos:", error);
        return [];
      }
    },
    enabled: !!user?.id,
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
      if (activeCards.length >= 2) throw new Error("Você só pode ter 2 desafios ativos. Conclua um para ativar outro.");
      await db.UserChallenge.create({
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
      toast.success("Desafio ativado com sucesso.");
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível ativar o desafio.");
    },
  });

  const completeTodayMutation = useMutation({
    mutationFn: async (challenge) => {
      const response = await api.functions.invoke("completeChallengeCheckIn", {
        userChallengeId: challenge.id,
        challengeMeta: challenge.challengeMeta,
      });
      return response.data;
    },
    onMutate: async (challenge) => {
      await queryClient.cancelQueries({ queryKey: ["userChallenges", user?.id] });
      await queryClient.cancelQueries({ queryKey: ["userPoints", user?.id] });
      await queryClient.cancelQueries({ queryKey: ["rankingSnapshot", user?.id] });

      const previousChallenges = queryClient.getQueryData(["userChallenges", user?.id]);
      const previousPoints = queryClient.getQueryData(["userPoints", user?.id]);
      const previousRanking = queryClient.getQueryData(["rankingSnapshot", user?.id]);
      const optimisticXp = challenge.xp_per_day || 10;

      setXpFeedback(optimisticXp);
      setTimeout(() => setXpFeedback(null), 1400);

      queryClient.setQueryData(["userChallenges", user?.id], (old = []) =>
        old.map((item) => item.id === challenge.id ? {
          ...item,
          progress_current: (item.progress_current || 0) + 1,
          completed_days: [...(item.completed_days || []), today],
          streak_count: (item.streak_count || 0) + 1,
          points_earned: (item.points_earned || 0) + optimisticXp,
        } : item)
      );

      queryClient.setQueryData(["userPoints", user?.id], (old) => old ? {
        ...old,
        total_points: (old.total_points || 0) + optimisticXp,
        xp_current: (old.xp_current || 0) + optimisticXp,
      } : old);

      queryClient.setQueryData(["rankingSnapshot", user?.id], (old) => old ? {
        ...old,
        currentXp: (old.currentXp || 0) + optimisticXp,
        leaderboard: (old.leaderboard || []).map((entry) => entry.user_id === user?.id ? { ...entry, total_xp: (entry.total_xp || 0) + optimisticXp, total_points: (entry.total_points || 0) + optimisticXp } : entry),
      } : old);

      return { previousChallenges, previousPoints, previousRanking };
    },
    onError: (_error, _challenge, context) => {
      if (context?.previousChallenges) queryClient.setQueryData(["userChallenges", user?.id], context.previousChallenges);
      if (context?.previousPoints) queryClient.setQueryData(["userPoints", user?.id], context.previousPoints);
      if (context?.previousRanking) queryClient.setQueryData(["rankingSnapshot", user?.id], context.previousRanking);
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