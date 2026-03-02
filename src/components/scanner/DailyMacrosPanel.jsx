import React from "react";
import { motion } from "framer-motion";

function MacroBar({ label, consumed, target, color, emoji }) {
  const pct = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span>{emoji}</span>
          <span className="text-sm text-white/70">{label}</span>
        </div>
        <span className="text-xs text-white/50">
          <span className="font-bold text-white">{Math.round(consumed)}g</span>
          {target > 0 && <span> / {Math.round(target)}g</span>}
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function DailyMacrosPanel({ foods, userProfile }) {
  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fats: acc.fats + (f.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const proteinTarget = userProfile?.protein_target || 0;
  const carbsTarget = userProfile?.carbs_target || 0;
  const fatsTarget = userProfile?.fats_target || 0;

  if (foods.length === 0) return null;

  return (
    <div
      className="rounded-3xl p-5 space-y-4"
      style={{ background: "rgba(8,71,52,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.15)" }}
    >
      <h3 className="text-white font-bold text-base">Macros do Dia</h3>
      <div className="space-y-3">
        <MacroBar label="Proteína" consumed={totals.protein} target={proteinTarget} color="#4ade80" emoji="🥩" />
        <MacroBar label="Carboidratos" consumed={totals.carbs} target={carbsTarget} color="#facc15" emoji="🍞" />
        <MacroBar label="Gorduras" consumed={totals.fats} target={fatsTarget} color="#60a5fa" emoji="🥑" />
      </div>
    </div>
  );
}