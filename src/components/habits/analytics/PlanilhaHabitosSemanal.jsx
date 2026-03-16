import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PlanilhaHabitosSemanal({ habits, weekDays, getLogForDay, onToggle, isSaving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Acompanhamento Semanal</p>
          <h3 className="mt-2 text-xl font-bold text-white">Planilha de Hábitos</h3>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div className="grid gap-2" style={{ gridTemplateColumns: `160px repeat(${weekDays.length}, minmax(44px, 1fr))` }}>
              <div />
              {weekDays.map((day) => (
                <div key={day.key} className="text-center">
                  <p className="text-xs font-semibold text-white/60">{day.label}</p>
                  <p className="text-[10px] text-white/35">{day.dayNumber}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              {habits.map((habit) => (
                <div key={habit.id} className="grid items-center gap-2" style={{ gridTemplateColumns: `160px repeat(${weekDays.length}, minmax(44px, 1fr))` }}>
                  <div className="truncate pr-3 text-sm font-semibold text-white/80">{habit.name}</div>
                  {weekDays.map((day) => {
                    const log = getLogForDay(habit.originalHabit, day.key);
                    const completed = !!log?.completed;
                    return (
                      <button
                        key={`${habit.id}-${day.key}`}
                        onClick={() => onToggle(habit.originalHabit, log || null, habit.currentStreak, day.key)}
                        disabled={isSaving}
                        className={`flex h-11 items-center justify-center rounded-2xl border transition-all ${completed ? "border-[#CEF17B]/35 bg-[#CEF17B]/12" : "border-white/8 bg-white/[0.03]"}`}
                        title={`${habit.name} • ${day.fullLabel}`}
                      >
                        {completed ? <Check className="h-4 w-4 text-[#CEF17B]" /> : <span className="h-2.5 w-2.5 rounded-full bg-white/20" />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}