import React from "react";
import { Flame } from "lucide-react";
import { format } from "date-fns";

const MEAL_META = {
  breakfast: { emoji: "☀️", label: "Café da manhã" },
  lunch: { emoji: "🌤️", label: "Almoço" },
  dinner: { emoji: "🌙", label: "Jantar" },
  snack: { emoji: "🍎", label: "Lanche" },
};

export default function DailyTimeline({ foods }) {
  if (!foods || foods.length === 0) return null;

  // Group by meal_type
  const grouped = foods.reduce((acc, f) => {
    const key = f.meal_type || "snack";
    if (!acc[key]) acc[key] = [];
    acc[key].push(f);
    return acc;
  }, {});

  const totalCal = foods.reduce((s, f) => s + (f.calories || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Histórico do dia</h3>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
          <Flame className="w-3 h-3 text-orange-400" />
          <span className="text-xs font-bold text-orange-400">{Math.round(totalCal)} kcal</span>
        </div>
      </div>

      <div className="space-y-2">
        {["breakfast", "lunch", "snack", "dinner"].map((mealType) => {
          const items = grouped[mealType];
          if (!items) return null;
          const { emoji, label } = MEAL_META[mealType];
          const mealCal = items.reduce((s, f) => s + (f.calories || 0), 0);

          return (
            <div key={mealType} className="p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{emoji}</span>
                  <span className="text-xs font-semibold text-white/80">{label}</span>
                </div>
                <span className="text-xs text-white/50">{Math.round(mealCal)} kcal</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {items.map((food, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
                    {food.image_url ? (
                      <img src={food.image_url} alt={food.food_name} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-400" />
                      </div>
                    )}
                    <span className="text-[9px] text-white/40 text-center max-w-[48px] truncate">{food.food_name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}