import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";

import HabitViewTabs from "@/components/habits/tracker/HabitViewTabs";
import HabitTodayChecklist from "@/components/habits/tracker/HabitTodayChecklist";
import HabitWeeklyPlanner from "@/components/habits/tracker/HabitWeeklyPlanner";
import HabitMonthlyPlanner from "@/components/habits/tracker/HabitMonthlyPlanner";
import HabitCreateScreen from "@/components/habits/tracker/HabitCreateScreen";

function calcXP(baseXp, streak) {
  let mult = 1;
  if (streak >= 30) mult = 1.4;
  else if (streak >= 14) mult = 1.2;
  else if (streak >= 7) mult = 1.1;
  return Math.round(baseXp * mult);
}

function currentStreak(dateSet, today) {
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const key = format(subDays(today, i), "yyyy-MM-dd");
    if (dateSet.has(key)) streak += 1;
    else break;
  }
  return streak;
}

function longestStreak(dateSet, today) {
  let best = 0;
  let streak = 0;
  for (let i = 89; i >= 0; i--) {
    const key = format(subDays(today, i), "yyyy-MM-dd");
    if (dateSet.has(key)) {
      streak += 1;
      best = Math.max(best, streak);
    } else {
      streak = 0;
    }
  }
  return best;
}

export default function Habits() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState("plan");
  const [showCreateScreen, setShowCreateScreen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const queryClient = useQueryClient();
  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.email) {
      base44.functions.invoke("setupDatabase", {}).catch(() => {});
    }
  }, [user?.email]);

  const { data: habits = [] } = useQuery({
    queryKey: ["habits", user?.email],
    queryFn: () => db.Habit.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: habitLogs = [] } = useQuery({
    queryKey: ["habitLogs", user?.email],
    queryFn: () => db.HabitLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const createHabitMutation = useMutation({
    mutationFn: async (form) => {
      await db.Habit.create({
        user_email: user.email,
        user_id: user.id,
        name: form.name,
        color: form.color,
        category: form.color,
        frequency: form.frequency,
        target_value: form.frequency,
        preferred_time: form.preferredTime,
        ideal_time: form.preferredTime,
        notes: form.notes,
        target_unit: form.notes,
        emoji: "✅",
        type: "binary",
        xp_per_completion: 10,
        is_native: false,
        is_active: true,
        created_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
      setShowCreateScreen(false);
      setActiveView("week");
    },
  });

  const logsByHabit = useMemo(() => {
    return habits.reduce((acc, habit) => {
      acc[habit.id] = habitLogs.filter((log) => log.habit_id === habit.id || log.habit_name === habit.name);
      return acc;
    }, {});
  }, [habits, habitLogs]);

  const getLogForDay = (habit, dateKey) => {
    const logs = logsByHabit[habit.id] || [];
    return logs.find((log) => (log.log_date || log.date) === dateKey) || null;
  };

  const habitItems = useMemo(() => {
    return habits.map((habit) => {
      const logs = logsByHabit[habit.id] || [];
      const completedSet = new Set(logs.filter((log) => log.completed).map((log) => log.log_date || log.date));
      const completed30 = Array.from({ length: 30 }, (_, index) => format(subDays(today, index), "yyyy-MM-dd")).filter((date) => completedSet.has(date)).length;
      return {
        id: habit.id,
        name: habit.name,
        progress: Math.round((completed30 / 30) * 100),
        currentStreak: currentStreak(completedSet, today),
        longestStreak: longestStreak(completedSet, today),
        isDoneToday: !!getLogForDay(habit, todayKey)?.completed,
        todayLog: getLogForDay(habit, todayKey),
        todayKey,
        originalHabit: habit,
      };
    });
  }, [habits, logsByHabit, todayKey]);

  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habit, existingLog, streak, dateKey }) => {
      const xpEarned = calcXP(habit.xp_per_completion || 10, streak);

      if (existingLog) {
        const nextCompleted = !existingLog.completed;
        await db.HabitLog.update(existingLog.id, {
          completed: nextCompleted,
          completed_at: nextCompleted ? new Date().toISOString() : null,
          xp_earned: nextCompleted && !existingLog.completed ? xpEarned : existingLog.xp_earned || 0,
        });
        if (nextCompleted && !existingLog.completed) {
          await base44.functions.invoke("updateXP", { xp_ganho: xpEarned, tipo_acao: "habito" });
        }
        return;
      }

      await db.HabitLog.create({
        user_email: user.email,
        user_id: user.id,
        habit_id: habit.id,
        habit_name: habit.name,
        date: dateKey,
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

  const weekDays = useMemo(() => {
    const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(weekStart, index);
      return {
        key: format(date, "yyyy-MM-dd"),
        label: labels[index],
        dayNumber: format(date, "d", { locale: ptBR }),
      };
    });
  }, [weekStart]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const total = Math.round((calendarEnd - calendarStart) / 86400000) + 1;

    return Array.from({ length: total }, (_, index) => {
      const date = addDays(calendarStart, index);
      const key = format(date, "yyyy-MM-dd");
      const inMonth = date.getMonth() === today.getMonth();
      const completed = habits.filter((habit) => getLogForDay(habit, key)?.completed).length;
      return {
        key,
        inMonth,
        dayNumber: format(date, "d", { locale: ptBR }),
        completed,
        total: habits.length,
      };
    });
  }, [today, habits, habitLogs]);

  const completedToday = habitItems.filter((item) => item.isDoneToday).length;

  return (
    <div className="min-h-screen pb-28 pt-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">SlatFit habits</p>
            <h1 className="mt-2 text-3xl font-black text-white">Hábitos</h1>
            <p className="mt-2 max-w-xl text-sm text-white/55">Crie hábitos, acompanhe sua semana e marque tudo com persistência real no Supabase.</p>
          </div>
          <Button onClick={() => setShowCreateScreen(true)} className="h-12 rounded-2xl bg-[#CEF17B] px-5 font-bold text-[#0B3936] hover:bg-[#bfe56b]">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar hábito
          </Button>
        </div>

        <HabitViewTabs activeView={activeView} onChange={setActiveView} />

        <div className="mt-4 space-y-4">
          {activeView === "plan" && (
            <div className="space-y-4">
              <HabitTodayChecklist
                habits={habitItems}
                onToggle={(habit, log, streak, dateKey) => toggleHabitMutation.mutate({ habit, existingLog: log, streak, dateKey })}
                isSaving={toggleHabitMutation.isPending}
              />

              <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Resumo rápido</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Hábitos ativos</p>
                    <p className="mt-2 text-2xl font-black text-white">{habits.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Concluídos hoje</p>
                    <p className="mt-2 text-2xl font-black text-white">{completedToday}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Melhor sequência</p>
                    <p className="mt-2 text-2xl font-black text-white">{Math.max(...habitItems.map((item) => item.longestStreak), 0)}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeView === "week" && (
            <HabitWeeklyPlanner
              habits={habitItems}
              weekDays={weekDays}
              getLogForDay={getLogForDay}
              onToggle={(habit, log, streak, dateKey) => toggleHabitMutation.mutate({ habit, existingLog: log, streak, dateKey })}
              isSaving={toggleHabitMutation.isPending}
            />
          )}

          {activeView === "month" && (
            <HabitMonthlyPlanner
              monthDays={monthDays}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              habits={habitItems}
              getLogForDay={getLogForDay}
              onToggle={(habit, log, streak, dateKey) => toggleHabitMutation.mutate({ habit, existingLog: log, streak, dateKey })}
              isSaving={toggleHabitMutation.isPending}
            />
          )}
        </div>
      </div>

      <HabitCreateScreen
        open={showCreateScreen}
        onClose={() => setShowCreateScreen(false)}
        onSave={(form) => createHabitMutation.mutate(form)}
        isSaving={createHabitMutation.isPending}
      />
    </div>
  );
}