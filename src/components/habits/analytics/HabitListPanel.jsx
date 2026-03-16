import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Flame } from "lucide-react";

export default function HabitListPanel({ habitStats, onToggle }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <Card className="rounded-3xl border-white/10 bg-[#101716] p-5 shadow-2xl shadow-black/20">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Habit Control</p>
          <h3 className="mt-2 text-lg font-bold text-white">Painel rápido de hábitos</h3>
        </div>
        <div className="space-y-3">
          {habitStats.map((habit) => (
            <div key={habit.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: habit.color }} />
                    <p className="truncate text-sm font-semibold text-white">{habit.name}</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-white/55">
                    <div>
                      <p className="text-white/35">Progresso</p>
                      <p className="mt-1 font-semibold text-white">{habit.progress}%</p>
                    </div>
                    <div>
                      <p className="text-white/35">Streak atual</p>
                      <p className="mt-1 flex items-center gap-1 font-semibold text-white"><Flame className="h-3 w-3 text-orange-400" />{habit.currentStreak}d</p>
                    </div>
                    <div>
                      <p className="text-white/35">Melhor streak</p>
                      <p className="mt-1 font-semibold text-white">{habit.longestStreak}d</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => onToggle(habit.originalHabit, habit.todayLog || null)}
                  className={`h-11 rounded-2xl px-4 ${habit.isDoneToday ? "bg-[#CEF17B] text-[#0B3936] hover:bg-[#bfe56b]" : "bg-white/8 text-white hover:bg-white/12"}`}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {habit.isDoneToday ? "Feito" : "Concluir"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}