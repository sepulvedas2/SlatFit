import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function HabitGrid({ habits, logsByDate, onToggle, today }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (habits.length === 0) {
    return (
      <div
        className="rounded-3xl p-8 text-center"
        style={{ background: "rgba(8,71,52,0.5)", border: "1px solid rgba(206,241,123,0.1)" }}
      >
        <div className="text-4xl mb-3">🌱</div>
        <p className="text-white/60 text-sm">Nenhum hábito ativo.<br />Adicione seu primeiro hábito abaixo!</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "rgba(8,71,52,0.6)", border: "1px solid rgba(206,241,123,0.15)" }}
    >
      {/* Header - dias */}
      <div className="grid gap-0" style={{ gridTemplateColumns: `1fr repeat(7, 44px)` }}>
        <div className="p-3 pl-4">
          <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Hábito</span>
        </div>
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = dateStr === today;
          return (
            <div key={i} className="flex flex-col items-center justify-center py-3 gap-0.5">
              <span className="text-[10px] text-white/40">{DAY_LABELS[i]}</span>
              <span
                className="text-xs font-bold"
                style={{ color: isToday ? "#CEF17B" : "rgba(255,255,255,0.6)" }}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Rows - hábitos */}
      {habits.map((habit, idx) => (
        <div
          key={habit.id}
          className="grid gap-0 border-t"
          style={{
            gridTemplateColumns: `1fr repeat(7, 44px)`,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {/* Nome */}
          <div className="flex items-center gap-2 px-4 py-3">
            <span className="text-lg flex-shrink-0">{habit.emoji || "✅"}</span>
            <span className="text-sm text-white/80 truncate leading-tight">{habit.name}</span>
          </div>

          {/* Células por dia */}
          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isToday = dateStr === today;
            const isFuture = dateStr > today;
            const dayLogs = logsByDate[dateStr] || [];
            const log = dayLogs.find(l => l.habit_id === habit.id);
            const done = log?.completed === true;
            const failed = log?.completed === false;

            return (
              <div key={i} className="flex items-center justify-center py-2">
                <button
                  onClick={() => !isFuture && onToggle(habit, dateStr, log)}
                  disabled={isFuture}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
                  style={{
                    background: done
                      ? "rgba(74,222,128,0.2)"
                      : failed
                      ? "rgba(248,113,113,0.15)"
                      : isToday
                      ? "rgba(206,241,123,0.08)"
                      : "rgba(255,255,255,0.04)",
                    border: done
                      ? "1px solid rgba(74,222,128,0.4)"
                      : failed
                      ? "1px solid rgba(248,113,113,0.3)"
                      : isToday
                      ? "1px solid rgba(206,241,123,0.2)"
                      : "1px solid rgba(255,255,255,0.06)",
                    opacity: isFuture ? 0.3 : 1,
                    cursor: isFuture ? "default" : "pointer",
                  }}
                >
                  {done ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : failed ? (
                    <X className="w-3 h-3 text-red-400" />
                  ) : (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: isToday ? "rgba(206,241,123,0.4)" : "rgba(255,255,255,0.1)" }}
                    />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}