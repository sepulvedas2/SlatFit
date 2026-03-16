import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";

export default function HabitWeeklyPlanner({ habits, weekDays, getLogForDay, onToggle, isSaving, weeklyProgress }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Visão semanal</p>
        <h2 className="mt-2 text-xl font-bold text-white">Grade de Hábitos Semanal</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid gap-2" style={{ gridTemplateColumns: `180px repeat(${weekDays.length}, minmax(54px, 1fr))` }}>
            <div />
            {weekDays.map((day) => (
              <div key={day.key} className="py-2 text-center">
                <p className="text-sm font-semibold text-white">{day.label}</p>
                <p className="text-xs text-white/40">{day.dayNumber}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {habits.map((habit) => (
              <div key={habit.id} className="grid items-center gap-2" style={{ gridTemplateColumns: `180px repeat(${weekDays.length}, minmax(54px, 1fr))` }}>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
                    <p className="truncate text-sm font-semibold text-white">{habit.name}</p>
                  </div>
                  <p className="mt-1 text-xs text-white/45">🔥 {habit.currentStreak} dias seguidos</p>
                </div>
                {weekDays.map((day) => {
                  const log = getLogForDay(habit.originalHabit, day.key);
                  const completed = !!log?.completed;
                  return (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      key={`${habit.id}-${day.key}`}
                      onClick={() => onToggle(habit.originalHabit, log || null, habit.currentStreak, day.key)}
                      disabled={isSaving}
                      className="flex items-center justify-center rounded-2xl py-2 transition-all"
                    >
                      <motion.div
                        initial={false}
                        animate={{ scale: completed ? [1, 1.15, 1] : 1 }}
                        transition={{ duration: 0.25 }}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border ${completed ? "text-white" : "border-white/15 bg-white/[0.03] text-white/35"}`}
                        style={completed ? { backgroundColor: habit.color, borderColor: habit.color, boxShadow: `0 0 0 4px ${habit.color}22` } : {}}
                      >
                        {completed ? <Check className="h-4 w-4" /> : <span className="h-2.5 w-2.5 rounded-full bg-white/20" />}
                      </motion.div>
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-white/65">Progresso semanal</span>
          <span className="font-semibold text-[#CEF17B]">{weeklyProgress}%</span>
        </div>
        <Progress value={weeklyProgress} className="h-3 bg-white/10 [&>div]:bg-[#CEF17B]" />
      </div>
    </Card>
  );
}