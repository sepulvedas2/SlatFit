import React from "react";
import { Flame } from "lucide-react";

const MEAL_META = {
  breakfast: { emoji: "☀️", label: "Café da manhã" },
  lunch:     { emoji: "🌤️", label: "Almoço" },
  dinner:    { emoji: "🌙", label: "Jantar" },
  snack:     { emoji: "🍎", label: "Lanche" },
};

const FOOD_EMOJIS = ["🥚","🍞","🍌","🥛","🍚","🥩","🥦","🍎","🧀","🍗","🥜","🫐","🥕","🥑","🍋"];

export default function DailyTimeline({ foods }) {
  if (!foods || foods.length === 0) return null;

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
          <span className="text-xs font-bold text-orange-400">{Math.round(totalCal)} kcal totais</span>
        </div>
      </div>

      <div className="space-y-2">
        {["breakfast", "lunch", "snack", "dinner"].map((mealType) => {
          const items = grouped[mealType];
          if (!items) return null;
          const { emoji, label } = MEAL_META[mealType];
          const mealCal = items.reduce((s, f) => s + (f.calories || 0), 0);

          return (
            <div key={mealType} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {/* Header da refeição */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-bold text-white/80">{label}</span>
                  <span className="text-xs text-white/30">• {items.length} item{items.length > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span className="text-xs font-bold text-orange-300">{Math.round(mealCal)} kcal</span>
                </div>
              </div>

              {/* Itens */}
              <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                {items.map((food, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    {/* Ícone / foto */}
                    {food.image_url ? (
                      <img src={food.image_url} alt={food.food_name} className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "rgba(255,255,255,0.06)" }}>
                        {FOOD_EMOJIS[i % FOOD_EMOJIS.length]}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{food.food_name}</p>
                      {food.portion_size && <p className="text-xs text-white/35 mt-0.5">{food.portion_size}</p>}
                      <div className="flex gap-3 mt-1">
                        {food.protein > 0 && <span className="text-[10px] text-green-400">🥩 {Math.round(food.protein)}g</span>}
                        {food.carbs > 0 && <span className="text-[10px] text-yellow-400">🍞 {Math.round(food.carbs)}g</span>}
                        {food.fats > 0 && <span className="text-[10px] text-blue-400">🥑 {Math.round(food.fats)}g</span>}
                      </div>
                    </div>

                    {/* Calorias */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-base font-black text-white">{Math.round(food.calories)}</p>
                      <p className="text-[9px] text-white/30">kcal</p>
                    </div>
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