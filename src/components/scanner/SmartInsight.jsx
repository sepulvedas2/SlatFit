import React from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

function generateDailyInsight(foods, userProfile) {
  if (!foods || foods.length === 0) return null;

  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (f.calories || 0),
      protein: acc.protein + (f.protein || 0),
      carbs: acc.carbs + (f.carbs || 0),
      fats: acc.fats + (f.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const target = userProfile?.daily_calorie_target || 2000;
  const protTarget = userProfile?.protein_target || 120;
  const fatsTarget = userProfile?.fats_target || 60;
  const goal = userProfile?.goal;

  const pct = (totals.calories / target) * 100;
  const fatsPct = fatsTarget > 0 ? (totals.fats / fatsTarget) * 100 : 0;
  const protPct = protTarget > 0 ? (totals.protein / protTarget) * 100 : 0;

  if (pct > 100) {
    return { status: "bad", message: `Você ultrapassou a meta calórica em ${Math.round(totals.calories - target)} kcal hoje. Tente compensar com atividade física.` };
  }
  if (pct > 80) {
    return { status: "warn", message: `Você já consumiu ${Math.round(pct)}% da meta diária. Planeje as próximas refeições com cuidado.` };
  }
  if (fatsPct > 90) {
    return { status: "warn", message: `Você está próximo da meta diária de gorduras (${Math.round(fatsPct)}%). Prefira alimentos magros.` };
  }
  if (goal === "muscle_gain" && protPct < 50 && foods.length >= 2) {
    return { status: "warn", message: `Proteína ainda em ${Math.round(protPct)}% da meta. Inclua mais fontes proteicas nas próximas refeições.` };
  }
  if (goal === "weight_loss" && pct <= 60 && foods.length >= 2) {
    return { status: "good", message: `Ótimo controle! Você está dentro da meta e ainda tem ${Math.round(target - totals.calories)} kcal disponíveis.` };
  }
  if (protPct >= 80) {
    return { status: "good", message: `Excelente ingestão proteica hoje: ${Math.round(totals.protein)}g. Continue assim! 💪` };
  }
  return { status: "good", message: `Você está dentro da meta ideal. Continue registrando suas refeições para manter o controle.` };
}

export default function SmartInsight({ foods, userProfile }) {
  const insight = generateDailyInsight(foods, userProfile);
  if (!insight) return null;

  const config = {
    good: { bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)", color: "#4ade80", dot: "🟢" },
    warn: { bg: "rgba(250,204,21,0.08)", border: "rgba(250,204,21,0.25)", color: "#facc15", dot: "🟡" },
    bad: { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)", color: "#f87171", dot: "🔴" },
  }[insight.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 flex items-start gap-3"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.color }} />
      <p className="text-sm text-white/90 leading-relaxed">{insight.message}</p>
    </motion.div>
  );
}