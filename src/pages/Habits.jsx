import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import HabitosHojeCard from "@/components/habits/analytics/HabitosHojeCard";
import PlanilhaHabitosSemanal from "@/components/habits/analytics/PlanilhaHabitosSemanal";
import ScoreDisciplinaCard from "@/components/habits/analytics/ScoreDisciplinaCard";
import GraficoConsistenciaHabitos from "@/components/habits/analytics/GraficoConsistenciaHabitos";
import GraficoPerformanceSemanal from "@/components/habits/analytics/GraficoPerformanceSemanal";
import FormMetricasDiarias from "@/components/habits/analytics/FormMetricasDiarias";
import GraficoMetricasDiarias from "@/components/habits/analytics/GraficoMetricasDiarias";
import PainelInsightsHabitos from "@/components/habits/analytics/PainelInsightsHabitos";
import ModalCriarHabito from "@/components/habits/analytics/ModalCriarHabito";

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

function habitColor(category) {
  return colorMap[category] || "#94A3B8";
}

function currentStreak(completedDates, today) {
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const key = format(subDays(today, i), "yyyy-MM-dd");
    if (completedDates.has(key)) streak += 1;
    else break;
  }
  return streak;
}

function bestStreak(completedDates, today) {
  let best = 0;
  let streak = 0;
  for (let i = 89; i >= 0; i--) {
    const key = format(subDays(today, i), "yyyy-MM-dd");
    if (completedDates.has(key)) {
      streak += 1;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }
  return best;
}

function levelFromScore(score) {
  if (score >= 90) return { label: "Elite", description: "Sua rotina está extremamente forte, previsível e disciplinada." };
  if (score >= 70) return { label: "Disciplinado", description: "Seu comportamento está consistente e você mantém uma boa execução semanal." };
  if (score >= 40) return { label: "Consistente", description: "Você já construiu uma base real, mas ainda pode reduzir falhas e aumentar constância." };
  return { label: "Iniciante", description: "Seu sistema ainda está ganhando forma. Foque em concluir o básico todos os dias." };
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

  const { data: logs = [] } = useQuery({
    queryKey: ["habitLogs", user?.email],
    queryFn: () => db.HabitLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ["dailyMetrics", user?.email],
    queryFn: () => db.DailyMetric.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["userProgress", user?.email],
    queryFn: async () => {
      const progress = await db.UserProgress.filter({ user_email: user.email });
      return progress[0] || null;
    },
    enabled: !!user?.email,
  });

  const activeLogsByHabit = useMemo(() => {
    return habits.reduce((acc, habit) => {
      const habitLogs = logs.filter((log) => log.habit_id === habit.id || log.habit_name === habit.name);
      acc[habit.id] = habitLogs;
      return acc;
    }, {});
  }, [habits, logs]);

  const getLogForDay = (habit, dateKey) => {
    const habitLogs = activeLogsByHabit[habit.id] || [];
    return habitLogs.find((log) => log.log_date === dateKey) || null;
  };

  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const habitLogs = activeLogsByHabit[habit.id] || [];
      const completedSet = new Set(habitLogs.filter((log) => log.completed).map((log) => log.log_date));
      const completed30 = Array.from({ length: 30 }, (_, index) => format(subDays(today, index), "yyyy-MM-dd")).filter((date) => completedSet.has(date)).length;
      const progress = Math.round((completed30 / 30) * 100);
      const todayLog = getLogForDay(habit, todayKey);

      return {
        id: habit.id,
        name: habit.name,
        color: habitColor(habit.category),
        progress,
        currentStreak: currentStreak(completedSet, today),
        longestStreak: bestStreak(completedSet, today),
        isDoneToday: !!todayLog?.completed,
        todayLog,
        todayKey,
        originalHabit: habit,
      };
    });
  }, [habits, activeLogsByHabit, todayKey]);

  const weekDays = useMemo(() => {
    const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      return {
        key: format(date, "yyyy-MM-dd"),
        label: labels[index],
        dayNumber: format(date, "d", { locale: ptBR }),
        fullLabel: format(date, "EEEE, dd/MM", { locale: ptBR }),
      };
    });
  }, [weekStart]);

  const createHabitMutation = useMutation({
    mutationFn: async (form) => {
      await db.Habit.create({
        user_email: user.email,
        name: form.name,
        emoji: "✅",
        category: form.color,
        type: "binary",
        target_value: form.targetFrequency,
        target_unit: form.notes || "",
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

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habit, existingLog, streak, dateKey }) => {
      const xpEarned = calcXP(habit.xp_per_completion || 10, streak);

      if (existingLog) {
        const nextCompleted = !existingLog.completed;
        await db.HabitLog.update(existingLog.id, {
          completed: nextCompleted,
          completed_at: nextCompleted ? new Date().toISOString() : null,
          xp_earned: existingLog.xp_earned || (nextCompleted ? xpEarned : 0),
        });

        if (nextCompleted && !existingLog.xp_earned) {
          await base44.functions.invoke("updateXP", { xp_ganho: xpEarned, tipo_acao: "habito" });
        }
        return;
      }

      await db.HabitLog.create({
        user_email: user.email,
        habit_id: habit.id,
        habit_name: habit.name,
        log_date: dateKey,
        completed: true,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      });
      await base44.functions.invoke("updateXP", { xp_ganho: xpEarned, tipo_acao: "habito" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });

  const metricToday = metrics.find((item) => item.metric_date === todayKey) || null;
  const [metricValues, setMetricValues] = useState({ energia: 0, foco: 0, humor: 0, sono: 0 });

  useEffect(() => {
    if (metricToday) {
      setMetricValues({
        energia: metricToday.energia || 0,
        foco: metricToday.foco || 0,
        humor: metricToday.humor || 0,
        sono: metricToday.sono || 0,
      });
    }
  }, [metricToday?.id]);

  const saveMetricsMutation = useMutation({
    mutationFn: async () => {
      if (metricToday?.id) {
        return db.DailyMetric.update(metricToday.id, { ...metricValues });
      }
      return db.DailyMetric.create({
        user_email: user.email,
        metric_date: todayKey,
        ...metricValues,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dailyMetrics"] });
    },
  });

  const totalPossible30 = habits.length * 30;
  const totalCompleted30 = habitStats.reduce((sum, habit) => sum + Math.round((habit.progress / 100) * 30), 0);
  const habitCompletionRate = totalPossible30 ? Math.round((totalCompleted30 / totalPossible30) * 100) : 0;
  const weeklyConsistency = weekDays.length
    ? Math.round(
        weekDays.reduce((sum, day) => {
          const completed = habits.filter((habit) => getLogForDay(habit, day.key)?.completed).length;
          return sum + (habits.length ? (completed / habits.length) * 100 : 0);
        }, 0) / weekDays.length,
      )
    : 0;
  const streakConsistency = habitStats.length
    ? Math.round(habitStats.reduce((sum, habit) => sum + Math.min((habit.currentStreak / 14) * 100, 100), 0) / habitStats.length)
    : 0;
  const disciplineScore = Math.min(100, Math.round(habitCompletionRate * 0.45 + weeklyConsistency * 0.3 + streakConsistency * 0.25));
  const discipline = levelFromScore(disciplineScore);

  const consistencyChartData = Array.from({ length: 30 }, (_, index) => {
    const date = subDays(today, 29 - index);
    const key = format(date, "yyyy-MM-dd");
    const completed = habits.filter((habit) => getLogForDay(habit, key)?.completed).length;
    return {
      label: format(date, "d/MM", { locale: ptBR }),
      completion: habits.length ? Math.round((completed / habits.length) * 100) : 0,
    };
  });

  const weeklyChartData = weekDays.map((day) => {
    const completed = habits.filter((habit) => getLogForDay(habit, day.key)?.completed).length;
    return {
      label: day.label,
      completion: habits.length ? Math.round((completed / habits.length) * 100) : 0,
    };
  });

  const metricsChartData = Array.from({ length: 14 }, (_, index) => {
    const date = subDays(today, 13 - index);
    const key = format(date, "yyyy-MM-dd");
    const metric = metrics.find((item) => item.metric_date === key);
    return {
      label: format(date, "d/MM", { locale: ptBR }),
      energia: metric?.energia || 0,
      foco: metric?.foco || 0,
      humor: metric?.humor || 0,
      sono: metric?.sono || 0,
    };
  });

  const bestHabit = habitStats.reduce((best, habit) => (!best || habit.progress > best.progress ? habit : best), null);
  const weakHabit = habitStats.reduce((weak, habit) => (!weak || habit.progress < weak.progress ? habit : weak), null);
  const bestDay = weeklyChartData.reduce((best, day) => (!best || day.completion > best.completion ? day : best), null);
  const maxStreak = habitStats.reduce((max, habit) => Math.max(max, habit.longestStreak), 0);

  const insights = [
    {
      title: "Hábito mais consistente",
      value: bestHabit ? bestHabit.name : "Sem dados",
      description: bestHabit ? `${bestHabit.progress}% de conclusão nos últimos 30 dias.` : "Adicione hábitos para começar a gerar insights.",
    },
    {
      title: "Hábito mais falhado",
      value: weakHabit ? weakHabit.name : "Sem dados",
      description: weakHabit ? `${weakHabit.progress}% de consistência. Talvez valha simplificar esse hábito.` : "Ainda não há dados suficientes.",
    },
    {
      title: "Melhor dia da semana",
      value: bestDay ? bestDay.label : "Sem dados",
      description: bestDay ? `${bestDay.completion}% de execução média nesse dia.` : "Acompanhe a semana para identificar padrões.",
    },
    {
      title: "Maior sequência de disciplina",
      value: `${maxStreak} dias`,
      description: "Seu maior streak registrado entre todos os hábitos ativos.",
    },
  ];

  return (
    <div className="min-h-screen pb-28 pt-6">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Habit Analytics</p>
            <h1 className="mt-2 text-3xl font-black text-white">Disciplina diária</h1>
            <p className="mt-2 max-w-xl text-sm text-white/55">Um painel prático para registrar hábitos, acompanhar sua semana e melhorar sua disciplina com dados reais.</p>
          </div>
        </motion.div>

        <div className="space-y-4">
          <HabitosHojeCard habits={habitStats} onToggle={(habit, log, streak, dateKey) => toggleHabitMutation.mutate({ habit, existingLog: log, streak, dateKey })} isSaving={toggleHabitMutation.isPending} />

          <PlanilhaHabitosSemanal
            habits={habitStats}
            weekDays={weekDays}
            getLogForDay={getLogForDay}
            onToggle={(habit, log, streak, dateKey) => toggleHabitMutation.mutate({ habit, existingLog: log, streak, dateKey })}
            isSaving={toggleHabitMutation.isPending}
          />

          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <ScoreDisciplinaCard score={disciplineScore} level={discipline.label} description={discipline.description} />
            <GraficoConsistenciaHabitos data={consistencyChartData} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <GraficoPerformanceSemanal data={weeklyChartData} />
            <FormMetricasDiarias
              values={metricValues}
              onChange={(field, value) => setMetricValues((prev) => ({ ...prev, [field]: value }))}
              onSave={() => saveMetricsMutation.mutate()}
              isSaving={saveMetricsMutation.isPending}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <GraficoMetricasDiarias data={metricsChartData} />
            <PainelInsightsHabitos insights={insights} />
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#CEF17B] text-[#0B3936] shadow-2xl shadow-[#CEF17B]/20 transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <ModalCriarHabito
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(form) => createHabitMutation.mutate(form)}
        isLoading={createHabitMutation.isPending}
      />
    </div>
  );
}