import React from "react";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function HabitWeeklyPlanner({ habits, weekDays, getLogForDay, onToggle, isSaving }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Visão semanal</p>
        <h2 className="mt-2 text-xl font-bold text-white">Planilha da semana</h2>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid gap-2" style={{ gridTemplateColumns: `140px repeat(${weekDays.length}, minmax(80px, 1fr))` }}>
            <div />
            {weekDays.map((day) => (
              <div key={day.key} className="rounded-2xl border border-white/10 bg-white/[0.03] py-3 text-center">
                <p className="text-sm font-semibold text-white">{day.label}</p>
                <p className="text-xs text-white/40">{day.dayNumber}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            {habits.map((habit) => (
              <div key={habit.id} className="grid gap-2" style={{ gridTemplateColumns: `140px repeat(${weekDays.length}, minmax(80px, 1fr))` }}>
                <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm font-semibold text-white/80">
                  {habit.name}
                </div>
                {weekDays.map((day) => {
                  const log = getLogForDay(habit.originalHabit, day.key);
                  const completed = !!log?.completed;
                  return (
                    <button
                      key={`${habit.id}-${day.key}`}
                      onClick={() => onToggle(habit.originalHabit, log || null, habit.currentStreak, day.key)}
                      disabled={isSaving}
                      className={`rounded-2xl border px-2 py-3 text-xs font-semibold transition-all ${completed ? "border-[#CEF17B]/35 bg-[#CEF17B]/12 text-[#CEF17B]" : "border-white/10 bg-white/[0.03] text-white/45"}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        {completed ? <Check className="h-3.5 w-3.5" /> : <span className="h-2.5 w-2.5 rounded-full bg-white/20" />}
                        <span>{completed ? "Feito" : "Pendente"}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}