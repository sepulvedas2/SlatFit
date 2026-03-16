import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";

export default function HabitMonthlyPlanner({ monthDays, selectedDate, onSelectDate, habits, getLogForDay, onToggle, isSaving }) {
  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Visão mensal</p>
          <h2 className="mt-2 text-xl font-bold text-white">Planilha do mês</h2>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-white/45">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((label) => (
            <div key={label} className="py-2">{label}</div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {monthDays.map((day) => (
            <button
              key={day.key}
              onClick={() => day.inMonth && onSelectDate(day.key)}
              className={`min-h-[72px] rounded-2xl border p-2 text-left transition-all ${
                !day.inMonth
                  ? 'border-transparent bg-transparent opacity-0'
                  : selectedDate === day.key
                  ? 'border-[#CEF17B]/40 bg-[#CEF17B]/10'
                  : 'border-white/10 bg-white/[0.03]'
              }`}
            >
              {day.inMonth && (
                <>
                  <p className="text-sm font-semibold text-white">{day.dayNumber}</p>
                  <p className="mt-2 text-xs text-white/45">{day.completed}/{day.total || 0}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full bg-[#CEF17B]" style={{ width: `${day.total ? (day.completed / day.total) * 100 : 0}%` }} />
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Dia selecionado</p>
          <h3 className="mt-2 text-lg font-bold text-white">Hábitos do dia</h3>
        </div>

        <div className="space-y-3">
          {habits.map((habit) => {
            const log = getLogForDay(habit.originalHabit, selectedDate);
            const completed = !!log?.completed;
            return (
              <button
                key={`${habit.id}-${selectedDate}`}
                onClick={() => onToggle(habit.originalHabit, log || null, habit.currentStreak, selectedDate)}
                disabled={isSaving}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${completed ? "border-[#CEF17B]/35 bg-[#CEF17B]/10" : "border-white/10 bg-white/[0.03]"}`}
              >
                {completed ? <CheckCircle2 className="h-5 w-5 shrink-0 text-[#CEF17B]" /> : <Circle className="h-5 w-5 shrink-0 text-white/35" />}
                <span className="flex-1 text-sm font-semibold text-white">{habit.name}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}