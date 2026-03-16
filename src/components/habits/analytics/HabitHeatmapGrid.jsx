import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const intensityClass = (completed) => (completed ? "bg-[#CEF17B]" : "bg-white/8");

export default function HabitHeatmapGrid({ habits, days, completionMap }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <Card className="rounded-3xl border-white/10 bg-[#101716] p-5 shadow-2xl shadow-black/20">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Habit Heatmap</p>
          <h3 className="mt-2 text-lg font-bold text-white">Heatmap de execução</h3>
          <p className="text-sm text-white/55">Veja rapidamente em quais dias você manteve a disciplina.</p>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="mb-2 grid" style={{ gridTemplateColumns: `140px repeat(${days.length}, minmax(22px, 1fr))` }}>
              <div />
              {days.map((day) => (
                <div key={day.key} className="text-center text-[10px] font-medium text-white/35">
                  {day.shortLabel}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {habits.map((habit, index) => (
                <div key={habit.id} className="grid items-center gap-2" style={{ gridTemplateColumns: `140px repeat(${days.length}, minmax(22px, 1fr))` }}>
                  <div className="truncate pr-3 text-sm font-medium text-white/80">{habit.name}</div>
                  {days.map((day) => {
                    const completed = !!completionMap?.[habit.id]?.[day.key];
                    return (
                      <motion.div
                        key={`${habit.id}-${day.key}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={`h-6 rounded-md border border-white/5 ${intensityClass(completed)}`}
                        title={`${habit.name} • ${day.label} • ${completed ? "Concluído" : "Não concluído"}`}
                      />
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