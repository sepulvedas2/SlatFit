import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { format, startOfWeek, addDays } from "date-fns";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function HabitCell({ habit, dateStr, log, isToday, isFuture, onToggle }) {
  const [popping, setPopping] = useState(false);
  const done = log?.completed === true;

  const handleClick = () => {
    if (isFuture) return;
    if (!done) {
      setPopping(true);
      setTimeout(() => setPopping(false), 400);
    }
    onToggle(habit, dateStr, log);
  };

  return (
    <div className="flex items-center justify-center py-2">
      <motion.button
        onClick={handleClick}
        disabled={isFuture}
        animate={popping ? { scale: [1, 1.25, 0.95, 1] } : {}}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: done
            ? "linear-gradient(135deg, #FF6A00, #FF8C00)"
            : isToday
            ? "rgba(255,106,0,0.08)"
            : "rgba(255,255,255,0.05)",
          border: done
            ? "none"
            : isToday
            ? "1.5px solid rgba(255,106,0,0.35)"
            : "1.5px solid rgba(255,255,255,0.08)",
          boxShadow: done ? "0 0 12px rgba(255,106,0,0.35)" : "none",
          opacity: isFuture ? 0.25 : 1,
          cursor: isFuture ? "not-allowed" : "pointer",
        }}
      >
        {done ? (
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        ) : (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: isToday ? "rgba(255,106,0,0.5)" : "rgba(255,255,255,0.15)" }}
          />
        )}
      </motion.button>
    </div>
  );
}

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
      style={{ background: "rgba(8,71,52,0.6)", border: "1px solid rgba(206,241,123,0.12)" }}
    >
      {/* Header dias */}
      <div className="grid" style={{ gridTemplateColumns: `1fr repeat(7, 44px)` }}>
        <div className="px-4 py-3">
          <span className="text-[10px] text-white/35 font-semibold uppercase tracking-widest">Hábito</span>
        </div>
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const isToday = dateStr === today;
          return (
            <div key={i} className="flex flex-col items-center justify-center py-3 gap-0.5">
              <span className="text-[9px] text-white/35 font-medium">{DAY_LABELS[i]}</span>
              <span
                className="text-xs font-bold"
                style={{ color: isToday ? "#FF6A00" : "rgba(255,255,255,0.55)" }}
              >
                {format(day, "d")}
              </span>
              {isToday && (
                <div className="w-1 h-1 rounded-full bg-orange-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Linhas de hábitos */}
      {habits.map((habit) => (
        <div
          key={habit.id}
          className="grid border-t"
          style={{
            gridTemplateColumns: `1fr repeat(7, 44px)`,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2 px-4 py-2 min-w-0">
            <span className="text-base flex-shrink-0">{habit.emoji || "✅"}</span>
            <span className="text-xs text-white/75 truncate leading-tight font-medium">{habit.name}</span>
          </div>

          {days.map((day, i) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isToday = dateStr === today;
            const isFuture = dateStr > today;
            const dayLogs = logsByDate[dateStr] || [];
            const log = dayLogs.find(l => l.habit_id === habit.id);

            return (
              <HabitCell
                key={i}
                habit={habit}
                dateStr={dateStr}
                log={log}
                isToday={isToday}
                isFuture={isFuture}
                onToggle={onToggle}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}