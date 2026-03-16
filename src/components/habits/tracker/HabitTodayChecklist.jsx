import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

export default function HabitTodayChecklist({ habits, onToggle, isSaving }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Rotina diária</p>
        <h2 className="mt-2 text-xl font-bold text-white">Hábitos de Hoje</h2>
      </div>

      <div className="space-y-3">
        {habits.map((habit) => (
          <button
            key={habit.id}
            onClick={() => onToggle(habit.originalHabit, habit.todayLog || null, habit.currentStreak, habit.todayKey)}
            disabled={isSaving}
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${habit.isDoneToday ? "border-[#CEF17B]/35 bg-[#CEF17B]/10" : "border-white/10 bg-white/[0.03]"}`}
          >
            {habit.isDoneToday ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#CEF17B]" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-white/35" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{habit.name}</p>
              <p className="mt-1 text-xs text-white/45">Sequência atual: {habit.currentStreak} dia(s)</p>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}