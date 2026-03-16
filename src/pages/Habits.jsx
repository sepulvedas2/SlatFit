import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Plus, Sparkles, CheckCircle2 } from "lucide-react";

import DisciplineScoreCard from "@/components/habits/analytics/DisciplineScoreCard";
import HabitProgressChart from "@/components/habits/analytics/HabitProgressChart";
import HabitHeatmapGrid from "@/components/habits/analytics/HabitHeatmapGrid";
import HabitListPanel from "@/components/habits/analytics/HabitListPanel";
import WeeklyPerformanceChart from "@/components/habits/analytics/WeeklyPerformanceChart";
import DailyMetricsChart from "@/components/habits/analytics/DailyMetricsChart";
import HabitInsightsPanel from "@/components/habits/analytics/HabitInsightsPanel";
import HabitCreateModal from "@/components/habits/analytics/HabitCreateModal";

const moodMap = { great: 5, good: 4, ok: 3, tired: 2, stressed: 1, low: 2 };
const colorMap = {
  lime: "#CEF17B",
  orange: "#FF6A00",
  blue: "#60A5FA",
  purple: "#C084FC",
  rose: "#FB7185",
  teal: "#2DD4BF",
  treino: "#FF6A00",
  saude: "#CEF17B",
  nutricao: "#60A5FA",
  mentalidade: "#C084FC",
  produtividade: "#2DD4BF",
};

function calcXP(baseXp, streak) {
  let mult = 1;
  if (streak >= 30) mult = 1.4;
  else if (streak >= 14) mult = 1.2;
  else if (streak >= 7) mult = 1.1;
  return Math.round(baseXp * mult);
}

function resolveHabitColor(category) {
  return colorMap[category] || "#94A3B8";
}

function calculateCurrentStreak(dateSet, today) {
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    if (dateSet.has(date)) streak += 1;
    else break;
  }
  return streak;
}

function calculateLongestStreak(dateSet, today) {
  let best = 0;
  let current = 0;
  for (let i = 89; i >= 0; i--) {
    const date = format(subDays(today, i), "yyyy-MM-dd");
    if (dateSet.has(date)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

function getDisciplineLevel(score) {
  if (score >= 75) {
    return {
      label: "Advanced",
      description: "Sua consistência está forte e seu sistema de disciplina já mostra padrão de alta performance.",
    };
  }
  if (score >= 45) {
    return {
      label: "Intermediate",
      description: "Você já tem uma boa base, mas ainda há espaço para tornar a execução mais previsível e consistente.",
    };
  }
  return {
    label: "Beginner",
    description: "Seu sistema ainda está em construção. O foco agora é reduzir dias quebrados e aumentar constância.",
  };
}

export default function Habits() {
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: habits = [] } = useQuery({
    queryKey: ["habits", user?.email],
    queryFn: () => db.Habit.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ["habitLogs", user?.email],
    queryFn: () => db.HabitLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: checkIns = [] } = useQuery({
    queryKey: ["dailyCheckIns", user?.email],
    queryFn: () => db.DailyCheckIn.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const createHabitMutation = useMutation({
    mutationFn: async (form) => {
      await db.Habit.create({
        user_email: user.email,
        name: form.name,
        emoji: "✅",
        category: form.color,
        type: "binary",
        target_value: form.targetFrequency,
        target_unit: form.notes ? `notes::${form.notes}` : "",
        ideal_time: form.preferredTime,
        xp_per_completion: 10,
        is_native: false,
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setShowCreateModal(false);
    },
  });

  const logsByHabit = useMemo(() => {
    return habits.reduce((acc, habit) => {
      acc[habit.id] = allLogs.filter((log) => (log.habit_id === habit.id || log.habit_name === habit.name) && log.completed);
      return acc;
    }, {});
  }, [habits, allLogs]);

  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const logs = logsByHabit[habit.id] || [];
      const dateSet = new Set(logs.map((log) => log.log_date));
      const completedLast30 = Array.from({ length: 30 }, (_, i) => format(subDays(today, i), "yyyy-MM-dd")).filter((date) => dateSet.has(date)).length;
      const progress = Math.round((completedLast30 / 30) * 100);
      const todayLog = logs.find((log) => log.log_date === todayKey) || null;

      return {
        id: habit.id,
        name: habit.name,
        color: resolveHabitColor(habit.category),
        progress,
        currentStreak: calculateCurrentStreak(dateSet, today),
        longestStreak: calculateLongestStreak(dateSet, today),
        isDoneToday: !!todayLog,
        todayLog,
        originalHabit: habit,
      };
    });
  }, [habits, logsByHabit, today, todayKey]);

  const completionMap = useMemo(() => {
    return habitStats.reduce((acc, habit) => {
      acc[habit.id] = {};
      (logsByHabit[habit.id] || []).forEach((log) => {
        acc[habit.id][log.log_date] = true;
      });
      return acc;
    }, {});
  }, [habitStats, logsByHabit]);

  const totalPossible30 = habits.length * 30;
  const completed30 = Object.values(completionMap).reduce((sum, habitDays) => {
    return sum + Object.keys(habitDays).filter((date) => date >= format(subDays(today, 29), "yyyy-MM-dd")).length;
  }, 0);
  const completionRate = totalPossible30 ? Math.round((completed30 / totalPossible30) * 100) : 0;

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      const key = format(date, "yyyy-MM-dd");
      const completed = habitStats.filter((habit) => completionMap?.[habit.id]?.[key]).length;
      const percentage = habits.length ? Math.round((completed / habits.length) * 100) : 0;
      return {
        key,
        label: format(date, "EEE", { locale: ptBR }),
        completion: percentage,
      };
    });
  }, [weekStart, habits.length, habitStats, completionMap]);

  const weeklyPerformance = weeklyData.length ? Math.round(weeklyData.reduce((sum, day) => sum + day.completion, 0) / weeklyData.length) : 0;
  const streakConsistency = habitStats.length ? Math.round(habitStats.reduce((sum, habit) => sum + Math.min((habit.currentStreak / 14) * 100, 100), 0) / habitStats.length) : 0;
  const disciplineScore = Math.min(100, Math.round(completionRate * 0.45 + weeklyPerformance * 0.3 + streakConsistency * 0.25));
  const disciplineLevel = getDisciplineLevel(disciplineScore);

  const progressChartData = useMemo(() => {
    return Array.from({ length: 30 }, (_, index) => {
      const date = subDays(today, 29 - index);
      const key = format(date, "yyyy-MM-dd");
      const completed = habitStats.filter((habit) => completionMap?.[habit.id]?.[key]).length;
      return {
        label: format(date, "d/MM", { locale: ptBR }),
        completion: habits.length ? Math.round((completed / habits.length) * 100) : 0,
      };
    });
  }, [today, habitStats, completionMap, habits.length]);

  const heatmapDays = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const date = subDays(today, 13 - index);
      return {
        key: format(date, "yyyy-MM-dd"),
        label: format(date, "dd/MM", { locale: ptBR }),
        shortLabel: format(date, "d", { locale: ptBR }),
      };
    });
  }, [today]);

  const metricsChartData = useMemo(() => {
    return Array.from({ length: 14 }, (_, index) => {
      const date = subDays(today, 13 - index);
      const key = format(date, "yyyy-MM-dd");
      const entry = checkIns.find((item) => item.check_in_date === key);
      const mood = moodMap[entry?.mood] || 0;
      const energy = entry?.energy_level || 0;
      const sleep = entry?.sleep_quality || 0;
      const focus = entry ? Math.min(5, Math.round(((energy || 0) + (sleep || 0) + mood) / 3)) : 0;
      return {
        label: format(date, "d/MM", { locale: ptBR }),
        energy,
        focus,
        mood,
        sleep,
      };
    });
  }, [checkIns, today]);

  const bestHabit = habitStats.reduce((best, habit) => (!best || habit.progress > best.progress ? habit : best), null);
  const weakestHabit = habitStats.reduce((worst, habit) => (!worst || habit.progress < worst.progress ? habit : worst), null);
  const bestDay = weeklyData.reduce((best, day) => (!best || day.completion > best.completion ? day : best), null);
  const longestStreak = habitStats.reduce((max, habit) => Math.max(max, habit.longestStreak), 0);
  const totalDoneToday = habitStats.filter((habit) => habit.isDoneToday).length;

  const insights = [
    {
      title: "Hábito mais consistente",
      value: bestHabit ? bestHabit.name : "Sem dados",
      description: bestHabit ? `${bestHabit.progress}% de execução nos últimos 30 dias.` : "Comece registrando hábitos para gerar insights.",
    },
    {
      title: "Hábito mais fraco",
      value: weakestHabit ? weakestHabit.name : "Sem dados",
      description: weakestHabit ? `${weakestHabit.progress}% de consistência. Vale revisar o gatilho desse hábito.` : "Ainda não há histórico suficiente.",
    },
    {
      title: "Melhor dia da semana",
      value: bestDay ? bestDay.label : "Sem dados",
      description: bestDay ? `${bestDay.completion}% de conclusão média nesse dia.` : "Sem dados suficientes na semana atual.",
    },
    {
      title: "Recorde de streak",
      value: `${longestStreak} dias`,
      description: "Seu maior ciclo de disciplina contínua registrado entre os hábitos ativos.",
    },
  ];

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habit, existingLog }) => {
      const streakBase = habitStats.find((item) => item.id === habit.id)?.currentStreak || 0;
      const xpEarned = calcXP(habit.xp_per_completion || 10, streakBase);

      if (existingLog) {
        await db.HabitLog.delete(existingLog.id);
        return { added: false };
      }

      await db.HabitLog.create({
        user_email: user.email,
        habit_id: habit.id,
        habit_name: habit.name,
        log_date: todayKey,
        completed: true,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      });

      await base44.functions.invoke("updateXP", { xp_ganho: xpEarned, tipo_acao: "habito" });
      return { added: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });

  const handleToggle = (habit, existingLog) => {
    toggleHabitMutation.mutate({ habit, existingLog });
  };

  return (
    <div className="min-h-screen bg-[#0A0F0F] pb-28 pt-6">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">SlatFit Habit Analytics</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Disciplina em dados</h1>
            <p className="mt-2 max-w-xl text-sm text-white/55">Um painel analítico completo para acompanhar consistência, disciplina e evolução dos seus hábitos.</p>
          </div>
          <div className="hidden rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3 text-right sm:block">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">Hoje</p>
            <p className="mt-1 flex items-center justify-end gap-2 text-sm font-semibold text-[#CEF17B]"><CheckCircle2 className="h-4 w-4" />{totalDoneToday}/{habits.length || 0} hábitos</p>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <DisciplineScoreCard score={disciplineScore} level={disciplineLevel.label} description={disciplineLevel.description} />
          <HabitInsightsPanel insights={insights} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <HabitProgressChart data={progressChartData} />
          <HabitListPanel habitStats={habitStats} onToggle={handleToggle} />
        </div>

        <div className="mt-4">
          <HabitHeatmapGrid habits={habits} days={heatmapDays} completionMap={completionMap} />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <WeeklyPerformanceChart data={weeklyData} />
          <DailyMetricsChart data={metricsChartData} />
        </div>
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#CEF17B] text-[#0B3936] shadow-2xl shadow-[#CEF17B]/20 transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <HabitCreateModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(form) => createHabitMutation.mutate(form)}
        isLoading={createHabitMutation.isPending}
      />
    </div>
  );
}