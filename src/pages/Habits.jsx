import React, { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, BarChart3, Grid3X3, Settings } from "lucide-react";
import { format, startOfWeek, subDays } from "date-fns";

import HabitGrid from "../components/habits/HabitGrid";
import HabitStats from "../components/habits/HabitStats";
import HabitFormModal from "../components/habits/HabitFormModal";
import WeeklyReport from "../components/habits/WeeklyReport";
import ProgressChart from "../components/habits/ProgressChart";

// XP com multiplicador de streak
function calcXP(baseXp, streak) {
  let mult = 1;
  if (streak >= 30) mult = 1.4;
  else if (streak >= 14) mult = 1.2;
  else if (streak >= 7) mult = 1.1;
  return Math.round(baseXp * mult);
}

// Calcular streak de hábitos
function computeHabitStreak(logsByDate, habits) {
  let streak = 0;
  const today = format(new Date(), "yyyy-MM-dd");
  for (let i = 0; i < 90; i++) {
    const dateStr = format(subDays(new Date(), i), "yyyy-MM-dd");
    const dayLogs = logsByDate[dateStr] || [];
    const doneCount = dayLogs.filter(l => l.completed).length;
    if (doneCount > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function Habits() {
  const [user, setUser] = useState(null);
  const [userPoints, setUserPoints] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("grid"); // grid | stats
  const [xpAnimation, setXpAnimation] = useState(null); // { x, y, value }
  const queryClient = useQueryClient();

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const pts = await base44.entities.UserPoints.filter({ user_email: u.email });
      setUserPoints(pts[0] || null);
    }).catch(() => {});
  }, []);

  const { data: habits = [] } = useQuery({
    queryKey: ["habits", user?.email],
    queryFn: () => base44.entities.Habit.filter({ user_email: user.email, is_active: true }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allLogs = [] } = useQuery({
    queryKey: ["habitLogs", user?.email],
    queryFn: () => base44.entities.HabitLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  // Agrupar logs por data
  const logsByDate = useMemo(() => {
    return allLogs.reduce((acc, log) => {
      const d = log.log_date;
      if (!acc[d]) acc[d] = [];
      acc[d].push(log);
      return acc;
    }, {});
  }, [allLogs]);

  // Logs desta semana
  const weekLogs = useMemo(() => allLogs.filter(l => l.log_date >= weekStart), [allLogs, weekStart]);

  // Streak atual
  const streak = useMemo(() => computeHabitStreak(logsByDate, habits), [logsByDate, habits]);

  // Best streak (simplificado: máximo da contagem atual)
  const bestStreak = Math.max(streak, userPoints?.longest_streak || 0);

  // Consistência semanal
  const weekConsistency = useMemo(() => {
    if (!habits.length) return 0;
    const possible = habits.length * 7;
    const done = weekLogs.filter(l => l.completed).length;
    return Math.round((done / possible) * 100);
  }, [habits, weekLogs]);

  // Total XP de hábitos
  const totalHabitXp = useMemo(() => allLogs.reduce((s, l) => s + (l.xp_earned || 0), 0), [allLogs]);

  // Create habit
  const createHabitMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Habit.create({ ...data, user_email: user.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["habits"]);
      setShowForm(false);
    },
  });

  // Toggle habit log
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habit, dateStr, existingLog }) => {
      const xpEarned = calcXP(habit.xp_per_completion || 10, streak);

      if (existingLog) {
        // Toggle: se já está completo, remove; se não, marca como completo
        if (existingLog.completed) {
          await base44.entities.HabitLog.delete(existingLog.id);
          return { xpDelta: -xpEarned, added: false };
        } else {
          await base44.entities.HabitLog.update(existingLog.id, { completed: true, xp_earned: xpEarned });
          return { xpDelta: xpEarned, added: true };
        }
      } else {
        await base44.entities.HabitLog.create({
          user_email: user.email,
          habit_id: habit.id,
          habit_name: habit.name,
          log_date: dateStr,
          completed: true,
          xp_earned: xpEarned,
          completed_at: new Date().toISOString(),
        });
        return { xpDelta: xpEarned, added: true };
      }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries(["habitLogs"]);
      if (result?.added && result?.xpDelta > 0) {
        // Animação XP
        setXpAnimation({ value: result.xpDelta });
        setTimeout(() => setXpAnimation(null), 1500);
      }
    },
  });

  // Delete habit
  const deleteHabitMutation = useMutation({
    mutationFn: (habitId) => base44.entities.Habit.update(habitId, { is_active: false }),
    onSuccess: () => queryClient.invalidateQueries(["habits"]),
  });

  const handleToggle = useCallback((habit, dateStr, existingLog) => {
    toggleHabitMutation.mutate({ habit, dateStr, existingLog });
  }, [toggleHabitMutation]);

  return (
    <div className="min-h-screen pb-28 pt-6">
      <div className="max-w-lg mx-auto px-4 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-2xl">Meus Hábitos</h1>
            <p className="text-white/50 text-sm">Construa sua melhor versão</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
          >
            <Plus className="w-5 h-5 text-[#084734]" />
          </button>
        </div>

        {/* XP Animation */}
        <AnimatePresence>
          {xpAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -30, scale: 1.2 }}
              exit={{ opacity: 0, y: -60 }}
              className="fixed top-24 right-6 z-50 px-3 py-1.5 rounded-full font-bold text-sm text-[#084734]"
              style={{ background: "#CEF17B", pointerEvents: "none" }}
            >
              +{xpAnimation.value} XP ⚡
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
          {[
            { key: "grid", label: "📋 Grade", icon: Grid3X3 },
            { key: "stats", label: "📊 Progresso", icon: BarChart3 },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: activeTab === key ? "rgba(206,241,123,0.15)" : "transparent",
                color: activeTab === key ? "#CEF17B" : "rgba(255,255,255,0.5)",
                border: activeTab === key ? "1px solid rgba(206,241,123,0.3)" : "1px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* GRADE DE HÁBITOS */}
          {activeTab === "grid" && (
            <motion.div key="grid" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">

              {/* Streak rápido */}
              {streak > 0 && (
                <div
                  className="flex items-center justify-between p-4 rounded-2xl"
                  style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="text-white font-bold text-sm">{streak} dias consecutivos!</p>
                      <p className="text-orange-300/70 text-xs">
                        {streak >= 30 ? "Bônus +40% XP ativo" : streak >= 14 ? "Bônus +20% XP ativo" : streak >= 7 ? "Bônus +10% XP ativo" : "Continue para desbloquear bônus"}
                      </p>
                    </div>
                  </div>
                  {streak >= 7 && (
                    <span className="text-lg px-2 py-1 rounded-xl" style={{ background: "rgba(249,115,22,0.2)" }}>
                      {streak >= 30 ? "🏆" : streak >= 14 ? "⭐" : "🔥"}
                    </span>
                  )}
                </div>
              )}

              {/* Grid semanal */}
              <HabitGrid
                habits={habits}
                logsByDate={logsByDate}
                onToggle={handleToggle}
                today={today}
              />

              {/* Gerenciar hábitos */}
              {habits.length > 0 && (
                <div
                  className="rounded-3xl overflow-hidden"
                  style={{ background: "rgba(8,71,52,0.5)", border: "1px solid rgba(206,241,123,0.1)" }}
                >
                  <div className="p-4 flex items-center gap-2 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <Settings className="w-4 h-4 text-white/40" />
                    <span className="text-white/60 text-sm font-semibold">Gerenciar hábitos</span>
                  </div>
                  {habits.map((habit, i) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between px-4 py-3 border-b"
                      style={{ borderColor: "rgba(255,255,255,0.04)" }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{habit.emoji || "✅"}</span>
                        <div>
                          <p className="text-white text-sm font-semibold">{habit.name}</p>
                          <p className="text-white/40 text-xs capitalize">{habit.category}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHabitMutation.mutate(habit.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA quando vazio */}
              {habits.length === 0 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full h-16 rounded-2xl font-bold text-lg text-[#084734]"
                  style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Plus className="w-5 h-5" />
                    Adicionar meu primeiro hábito
                  </div>
                </button>
              )}
            </motion.div>
          )}

          {/* STATS / PROGRESSO */}
          {activeTab === "stats" && (
            <motion.div key="stats" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <ProgressChart
                logsByDate={logsByDate}
                habits={habits}
                streak={streak}
                bestStreak={bestStreak}
                weekConsistency={weekConsistency}
                totalXp={totalHabitXp}
              />
              <HabitStats
                totalXp={totalHabitXp}
                streak={streak}
                bestStreak={bestStreak}
                weekConsistency={weekConsistency}
              />
              <WeeklyReport habits={habits} logs={weekLogs} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Modal adicionar hábito */}
      <HabitFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={createHabitMutation.mutate}
        existingHabits={habits}
      />
    </div>
  );
}