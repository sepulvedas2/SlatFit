import React from "react";
import { format, startOfWeek, addDays, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame } from "lucide-react";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function WeeklyCalendar({ selectedDate, onSelectDate, foodsByDate, calorieTarget, streak }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div
      className="rounded-3xl p-4 space-y-4"
      style={{ background: "rgba(8,71,52,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.15)" }}
    >
      {/* Streak + meta */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">Scanner Inteligente</h2>
          <p className="text-white/50 text-xs">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        {streak > 0 && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300 font-bold text-sm">{streak} dias</span>
          </div>
        )}
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayFoods = foodsByDate[dateStr] || [];
          const dayCalories = dayFoods.reduce((s, f) => s + (f.calories || 0), 0);
          const isSelected = selectedDate === dateStr;
          const isCurrentDay = isToday(day);
          const hasFoods = dayFoods.length > 0;
          const pct = calorieTarget > 0 ? Math.min(dayCalories / calorieTarget, 1) : 0;

          return (
            <button
              key={i}
              onClick={() => onSelectDate(dateStr)}
              className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-2xl transition-all"
              style={{
                background: isSelected ? "rgba(206,241,123,0.2)" : isCurrentDay ? "rgba(206,241,123,0.08)" : "transparent",
                border: isSelected ? "1px solid rgba(206,241,123,0.5)" : isCurrentDay ? "1px solid rgba(206,241,123,0.2)" : "1px solid transparent",
              }}
            >
              <span className="text-[10px] text-white/50">{DAY_LABELS[i]}</span>
              <span
                className="text-sm font-bold"
                style={{ color: isSelected || isCurrentDay ? "#CEF17B" : "rgba(255,255,255,0.8)" }}
              >
                {format(day, "d")}
              </span>
              {/* Mini progress indicator */}
              <div className="w-5 h-1 rounded-full bg-white/10 overflow-hidden">
                {hasFoods && (
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round(pct * 100)}%`,
                      background: pct > 1.05 ? "#f87171" : pct >= 0.9 ? "#4ade80" : "#CEF17B",
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Resumo do dia selecionado */}
      {(() => {
        const dayFoods = foodsByDate[selectedDate] || [];
        const consumed = dayFoods.reduce((s, f) => s + (f.calories || 0), 0);
        const remaining = calorieTarget - consumed;
        const pct = calorieTarget > 0 ? Math.min((consumed / calorieTarget) * 100, 100) : 0;

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="text-center">
                <div className="text-white font-bold text-lg">{calorieTarget}</div>
                <div className="text-white/40 text-xs">Meta</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg" style={{ color: "#CEF17B" }}>{consumed}</div>
                <div className="text-white/40 text-xs">Consumido</div>
              </div>
              <div className="text-center">
                <div
                  className="font-bold text-lg"
                  style={{ color: remaining < 0 ? "#f87171" : remaining < 200 ? "#facc15" : "white" }}
                >
                  {remaining < 0 ? 0 : remaining}
                </div>
                <div className="text-white/40 text-xs">Restante</div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: pct > 105 ? "#f87171" : pct >= 90 ? "#4ade80" : "linear-gradient(90deg, #CEF17B, #4ade80)",
                }}
              />
            </div>
          </div>
        );
      })()}
    </div>
  );
}