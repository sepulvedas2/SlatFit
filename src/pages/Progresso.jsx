import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";

import UserResumoCard from "@/components/progress/UserResumoCard";
import DesafiosAtivosCard from "@/components/progress/DesafiosAtivosCard";
import ExplorarDesafiosCard from "@/components/progress/ExplorarDesafiosCard";
import DesafioDoDiaCard from "@/components/progress/DesafioDoDiaCard";
import { challengeCatalog } from "@/components/progress/challengeCatalog";

export default function Progresso() {
  const [user, setUser] = useState(null);
  const [xpFeedback, setXpFeedback] = useState(null);
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: userProgress } = useQuery({
    queryKey: ["userProgress", user?.email],
    queryFn: async () => {
      try {
        const progress = await db.UserProgress.filter({ user_email: user.email });
        if (progress[0]) return progress[0];
      } catch (error) {
        console.error("[Progresso] user_progress indisponível, usando user_points:", error);
      }
      const points = await db.UserPoints.filter({ user_email: user.email });
      if (!points[0]) return null;
      return {
        ...points[0],
        total_xp: points[0].total_points || 0,
        nivel: points[0].level || 1,
        streak_dias: points[0].daily_streak || 0,
      };
    },
    enabled: !!user?.email,
  });

  const { data: rankingEntry } = useQuery({
    queryKey: ["ranking", user?.email],
    queryFn: async () => {
      try {
        const ranking = await db.Ranking.filter({ user_email: user.email });
        return ranking[0] || null;
      } catch (error) {
        console.error("[Progresso] ranking indisponível:", error);
        return null;
      }
    },
    enabled: !!user?.email,
  });

  const { data: userStreak } = useQuery({
    queryKey: ["userStreak", user?.id],
    queryFn: async () => {
      try {
        const streak = await db.UserStreak.filter({ user_id: user.id });
        return streak[0] || null;
      } catch (error) {
        console.error("[Progresso] streak indisponível:", error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ["challengesCatalog"],
    queryFn: async () => {
      try {
        const rows = await db.Challenge.list();
        return rows.filter((row) => row.title);
      } catch (error) {
        console.error("[Progresso] catálogo indisponível:", error);
        return [];
      }
    },
    initialData: [],
  });

  useEffect(() => {
    if (!user?.email) return;
    if (challenges.length === 0) {
      base44.functions.invoke("seedChallenges", {}).then(() => {
        queryClient.invalidateQueries({ queryKey: ["challengesCatalog"] });
      }).catch((error) => console.error("[Progresso] erro ao popular desafios:", error));
    }
  }, [user?.email, challenges.length]);

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
        const definition = challenges.find((item) => item.id === challenge.challenge_id);
        const progressCurrent = challenge.progress_current || (challenge.completed_days || []).length || 0;
        const progressTotal = challenge.progress_total || challenge.total_days || definition?.duration_days || 1;
        const completedToday = Array.isArray(challenge.completed_days) ? challenge.completed_days.includes(today) : false;
        return {
          ...challenge,
          title: challenge.challenge_title || definition?.title,
          description: definition?.description || "Desafio diário em andamento.",
          progressText: `${progressCurrent}/${progressTotal} dias`,
          progressPercent: Math.min(100, Math.round((progressCurrent / progressTotal) * 100)),
          completedToday,
          streakCount: challenge.streak_count || 0,
        };
      })
      .filter((challenge) => challenge.status === "active")
      .slice(0, 3);
  }, [activeChallenges, challenges, today]);

  const availableCategories = useMemo(() => {
    if (challenges.length === 0) return challengeCatalog;
    return challenges.reduce((acc, challenge) => {
      if (!acc[challenge.category]) acc[challenge.category] = [];
      acc[challenge.category].push(challenge);
      return acc;
    }, {});
  }, [challenges]);

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
        progress_total: challenge.duration_days,
        challenge_title: challenge.title,
        start_date: today,
        started_at: new Date().toISOString(),
        current_day: 1,
        total_days: challenge.duration_days,
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
      const response = await base44.functions.invoke("completeChallengeCheckIn", { userChallengeId: challenge.id });
      return response.data;
    },
    onSuccess: (result) => {
      if (result?.xpGain) {
        setXpFeedback(result.xpGain);
        setTimeout(() => setXpFeedback(null), 1800);
      }
      queryClient.invalidateQueries({ queryKey: ["userChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
      queryClient.invalidateQueries({ queryKey: ["userStreak"] });
    },
  });

  const streakValue = userStreak?.current_streak || userProgress?.streak_dias || 0;

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
              +{xpFeedback} XP conquistado
            </motion.div>
          )}
        </AnimatePresence>

        <UserResumoCard
          xp={userProgress?.total_xp || 0}
          level={userProgress?.nivel || 1}
          ranking={rankingEntry?.posicao || null}
          streak={streakValue}
        />

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/80">
          <span className="text-lg">{streakValue >= 7 ? '🔥🔥🔥' : streakValue >= 3 ? '🔥🔥' : '🔥'}</span>
          <span>Streak ativa: {streakValue} dia(s)</span>
        </div>

        <DesafioDoDiaCard challenge={dailyChallenge} onComplete={(challenge) => completeTodayMutation.mutate(challenge)} isSaving={completeTodayMutation.isPending} />

        <DesafiosAtivosCard challenges={activeCards} onCompleteToday={(challenge) => completeTodayMutation.mutate(challenge)} isSaving={completeTodayMutation.isPending} />

        <ExplorarDesafiosCard categories={availableCategories} activeIds={activeChallengeIds} onActivate={(challenge) => activateChallengeMutation.mutate(challenge)} isSaving={activateChallengeMutation.isPending} />
      </div>
    </div>
  );
}