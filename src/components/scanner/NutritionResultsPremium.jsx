import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Beef, Wheat, Droplet, ChevronDown, ChevronUp, Star, Sliders, Lightbulb, ArrowRight, Check } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { base44 } from "@/api/base44Client";

function MacroScore({ label, value, color, emoji }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
      <span className="text-lg">{emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-white/70">{label}</span>
          <span className="text-xs text-white font-bold">{value}g</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function GoalInsight({ status, message }) {
  const config = {
    good: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.3)", dot: "🟢" },
    warn: { color: "#facc15", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)", dot: "🟡" },
    bad: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", dot: "🔴" },
  }[status];

  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: config.bg, border: `1px solid ${config.border}` }}>
      <span>{config.dot}</span>
      <p className="text-sm text-white/90">{message}</p>
    </div>
  );
}

export default function NutritionResultsPremium({ data, userProfile, mealType, onSave, onReset }) {
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cal = Math.round(data.calories * portionMultiplier);
  const prot = Math.round(data.protein * portionMultiplier * 10) / 10;
  const carbs = Math.round(data.carbs * portionMultiplier * 10) / 10;
  const fats = Math.round(data.fats * portionMultiplier * 10) / 10;

  const totalMacros = prot + carbs + fats;
  const protPct = totalMacros > 0 ? Math.round((prot / totalMacros) * 100) : 0;
  const carbsPct = totalMacros > 0 ? Math.round((carbs / totalMacros) * 100) : 0;
  const fatsPct = totalMacros > 0 ? Math.round((fats / totalMacros) * 100) : 0;

  const goal = userProfile?.goal;

  const getInsights = () => {
    if (!goal) return [];
    const insights = [];
    if (goal === "muscle_gain") {
      const protPerKcal = prot / (cal || 1);
      if (protPerKcal >= 0.08) insights.push({ status: "good", message: "Boa quantidade de proteína para hipertrofia! 💪" });
      else insights.push({ status: "warn", message: "Proteína abaixo do ideal. Adicione uma fonte proteica." });
      if (carbsPct >= 40) insights.push({ status: "good", message: "Carboidratos adequados para energia e recuperação." });
    } else if (goal === "weight_loss") {
      if (cal <= 400) insights.push({ status: "good", message: "Refeição leve, dentro da meta de emagrecimento." });
      else if (cal <= 600) insights.push({ status: "warn", message: "Calorias moderadas. Fique atento ao total do dia." });
      else insights.push({ status: "bad", message: "Refeição calórica. Considere reduzir a porção." });
      if (fatsPct > 40) insights.push({ status: "bad", message: "Gordura acima do ideal para emagrecimento." });
    } else {
      insights.push({ status: "good", message: "Refeição equilibrada para manutenção." });
    }
    return insights;
  };

  const getScore = () => {
    if (!goal) return 7;
    let score = 7;
    if (goal === "muscle_gain") {
      if (prot / (cal || 1) >= 0.08) score += 2;
      if (carbsPct >= 40) score += 1;
    } else if (goal === "weight_loss") {
      if (cal <= 400) score += 2;
      else if (cal > 600) score -= 2;
      if (fatsPct <= 30) score += 1;
    }
    return Math.max(1, Math.min(10, score));
  };

  const score = getScore();
  const insights = getInsights();

  const scoreColor = score >= 8 ? "#4ade80" : score >= 5 ? "#facc15" : "#f87171";

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é nutricionista. Para o alimento "${data.food_name}" com ${cal}kcal, sugira 2 substituições simples e práticas que reduzam calorias ou melhorem macros para o objetivo: ${goal || "manutenção"}. 
      Seja específico com a economia calórica.`,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                original: { type: "string" },
                substitute: { type: "string" },
                savings: { type: "string" },
                reason: { type: "string" }
              }
            }
          }
        }
      }
    });
    setSuggestions(res?.suggestions || []);
    setLoadingSuggestions(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...data, calories: cal, protein: prot, carbs, fats });
    setSaving(false);
    setSaved(true);
  };

  const portionGrams = parseInt(data.portion_size) || 100;
  const currentGrams = Math.round(portionGrams * portionMultiplier);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* Food name + Score */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">{data.food_name}</h3>
          <p className="text-sm text-white/50 mt-0.5">~{currentGrams}g • {mealType}</p>
        </div>
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center" style={{ background: `${scoreColor}20`, border: `2px solid ${scoreColor}` }}>
            <Star className="w-3 h-3 mb-0.5" style={{ color: scoreColor }} />
            <span className="text-lg font-bold" style={{ color: scoreColor }}>{score}</span>
          </div>
          <span className="text-[10px] text-white/40 mt-1">Score</span>
        </div>
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { emoji: "🔥", label: "kcal", value: cal, color: "#f97316", unit: "" },
          { emoji: "🥩", label: "Prot", value: prot, color: "#4ade80", unit: "g" },
          { emoji: "🍞", label: "Carbs", value: carbs, color: "#facc15", unit: "g" },
          { emoji: "🥑", label: "Gord", value: fats, color: "#60a5fa", unit: "g" },
        ].map(({ emoji, label, value, color, unit }) => (
          <motion.div
            key={label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl p-3 text-center"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
          >
            <div className="text-xl mb-1">{emoji}</div>
            <div className="text-lg font-bold text-white">{value}<span className="text-xs text-white/50">{unit}</span></div>
            <div className="text-[10px] text-white/50">{label}</div>
          </motion.div>
        ))}
      </div>

      {/* Portion slider */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#CEF17B]" />
            <span className="text-sm font-semibold text-white">Ajuste a porção</span>
          </div>
          <span className="text-sm font-bold text-[#CEF17B]">~{currentGrams}g</span>
        </div>
        <Slider
          value={[portionMultiplier * 100]}
          onValueChange={([v]) => setPortionMultiplier(v / 100)}
          min={50}
          max={300}
          step={10}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-white/40">
          <span>Metade</span>
          <span>Normal</span>
          <span>Dobro</span>
        </div>
      </div>

      {/* Goal insights */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((ins, i) => <GoalInsight key={i} {...ins} />)}
        </div>
      )}

      {/* Ver detalhes toggle */}
      <button
        onClick={() => setShowDetails(p => !p)}
        className="w-full flex items-center justify-between p-3 rounded-xl text-sm text-white/60 hover:text-white/90 transition-colors"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <span>Ver detalhes nutricionais</span>
        {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-2"
          >
            <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Distribuição de Macros</p>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${protPct}%` }} className="bg-green-400 rounded-full" transition={{ duration: 0.8 }} />
                <motion.div initial={{ width: 0 }} animate={{ width: `${carbsPct}%` }} className="bg-yellow-400 rounded-full" transition={{ duration: 0.8, delay: 0.1 }} />
                <motion.div initial={{ width: 0 }} animate={{ width: `${fatsPct}%` }} className="bg-blue-400 rounded-full" transition={{ duration: 0.8, delay: 0.2 }} />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-green-400">Prot {protPct}%</span>
                <span className="text-yellow-400">Carbs {carbsPct}%</span>
                <span className="text-blue-400">Gord {fatsPct}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Melhorar refeição */}
      <button
        onClick={fetchSuggestions}
        className="w-full flex items-center justify-between p-4 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
        style={{ background: "rgba(206,241,123,0.08)", border: "1px solid rgba(206,241,123,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#CEF17B]" />
          <span>Quer melhorar essa refeição?</span>
        </div>
        <ArrowRight className="w-4 h-4 text-[#CEF17B]" />
      </button>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {loadingSuggestions ? (
              <div className="p-4 text-center">
                <div className="w-5 h-5 border-2 border-[#CEF17B]/40 border-t-[#CEF17B] rounded-full animate-spin mx-auto" />
                <p className="text-xs text-white/50 mt-2">Buscando sugestões...</p>
              </div>
            ) : suggestions?.map((s, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: "rgba(206,241,123,0.06)", border: "1px solid rgba(206,241,123,0.15)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm text-white/60 line-through">{s.original}</span>
                  <ArrowRight className="w-3 h-3 text-[#CEF17B]" />
                  <span className="text-sm font-semibold text-[#CEF17B]">{s.substitute}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">{s.reason}</span>
                  <span className="text-xs font-bold text-green-400">{s.savings}</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA Salvar */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full h-14 rounded-2xl font-bold text-base text-[#084734] disabled:opacity-70 active:scale-95 transition-all shadow-lg"
          style={{ background: saved ? "#4ade80" : "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#084734]/30 border-t-[#084734] rounded-full animate-spin" />
              Salvando...
            </div>
          ) : saved ? (
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Adicionado com sucesso!
            </div>
          ) : (
            "Adicionar à minha meta diária"
          )}
        </button>

        <button onClick={onReset} className="w-full py-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          Escanear outro alimento
        </button>
      </div>
    </motion.div>
  );
}