import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";

import UserResumoCard from "@/components/progress/UserResumoCard";
import DesafiosAtivosCard from "@/components/progress/DesafiosAtivosCard";
import ExplorarDesafiosCard from "@/components/progress/ExplorarDesafiosCard";
import { challengeCatalog, challengeMap } from "@/components/progress/challengeCatalog";

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

  const activeChallengeIds = useMemo(() => new Set(activeChallenges.map((challenge) => challenge.challenge_id)), [activeChallenges]);

  const activeChallengeCards = useMemo(() => {
    return activeChallenges
      .filter((challenge) => challenge.status !== "completed")
      .map((challenge) => {
        const definition = challengeMap[challenge.challenge_id];
        const completedDays = challenge.completed_days || [];
        const progressCount = completedDays.length;
        const totalDays = challenge.total_days || definition?.durationDays || 1;
        return {
          ...challenge,
          title: challenge.challenge_title,
          description: definition?.description || "Desafio ativo em andamento.",
          progressText: `${progressCount}/${totalDays} dias`,
          progressPercent: Math.min(100, Math.round((progressCount / totalDays) * 100)),
          completedToday: completedDays.includes(today),
        };
      })
      .slice(0, 5);
  }, [activeChallenges, today]);

  const activateChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      await db.UserChallenge.create({
        user_email: user.email,
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        start_date: today,
        current_day: 1,
        total_days: challenge.durationDays,
        completed_days: [],
        status: "active",
        points_earned: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userChallenges"] });
    },
  });

  const completeChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      const definition = challengeMap[challenge.challenge_id];
      const completedDays = [...(challenge.completed_days || [])];
      if (completedDays.includes(today)) return;

      completedDays.push(today);
      let xpGain = definition?.dailyXp || 10;
      if (completedDays.length === 3) xpGain += 20;
      if (completedDays.length === 7) xpGain += 50;
      if (completedDays.length === 30) xpGain += 200;

      const isCompleted = completedDays.length >= (challenge.total_days || definition?.durationDays || 1);
      if (isCompleted) xpGain += definition?.xpReward || 0;

      await db.UserChallenge.update(challenge.id, {
        completed_days: completedDays,
        current_day: Math.min(completedDays.length + 1, challenge.total_days || definition?.durationDays || 1),
        points_earned: (challenge.points_earned || 0) + xpGain,
        status: isCompleted ? "completed" : "active",
      });

      await base44.functions.invoke("updateXP", { xp_ganho: xpGain, tipo_acao: "desafio" });
      return xpGain;
    },
    onSuccess: (xpGain) => {
      if (xpGain) {
        setXpFeedback(xpGain);
        setTimeout(() => setXpFeedback(null), 1800);
      }
      queryClient.invalidateQueries({ queryKey: ["userChallenges"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
    },
  });

  return (
    <div className="min-h-screen pb-28 pt-6">
      <div className="mx-auto max-w-lg px-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Gamificação</p>
          <h1 className="mt-2 text-3xl font-black text-white">Progresso</h1>
          <p className="mt-2 text-sm text-white/55">Desafios rápidos, progresso visível e recompensa diária com XP.</p>
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
          streak={userProgress?.streak_dias || 0}
        />

        <DesafiosAtivosCard
          challenges={activeChallengeCards}
          onCompleteToday={(challenge) => completeChallengeMutation.mutate(challenge)}
          isSaving={completeChallengeMutation.isPending}
        />

        <ExplorarDesafiosCard
          categories={challengeCatalog}
          activeIds={activeChallengeIds}
          onActivate={(challenge) => activateChallengeMutation.mutate(challenge)}
          isSaving={activateChallengeMutation.isPending}
        />
      </div>
    </div>
  );
}