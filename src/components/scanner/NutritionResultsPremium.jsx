import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Lightbulb, ArrowRight, Check, Plus, Trash2, Edit3, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { base44 } from "@/api/base44Client";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getScore(cal, prot, carbs, fats, goal) {
  let score = 6;
  const total = prot + carbs + fats || 1;
  const protPct = (prot / total) * 100;
  const fatsPct = (fats / total) * 100;
  if (goal === "muscle_gain") {
    if (prot / cal >= 0.08) score += 2;
    if ((carbs / total) * 100 >= 40) score += 1;
  } else if (goal === "weight_loss") {
    if (cal <= 400) score += 3;
    else if (cal <= 600) score += 1;
    else score -= 1;
    if (fatsPct <= 30) score += 1;
  } else {
    score = 7;
    if (protPct >= 20) score += 1;
    if (fatsPct <= 35) score += 1;
  }
  return Math.max(1, Math.min(10, score));
}

function getInsightText(cal, prot, carbs, fats, goal) {
  if (goal === "muscle_gain") {
    if (prot / cal >= 0.08) return "Boa quantidade de proteína para hipertrofia! 💪";
    return "Proteína abaixo do ideal para ganho muscular. Considere adicionar uma fonte proteica.";
  } else if (goal === "weight_loss") {
    if (cal <= 400) return "Refeição leve, ótima para emagrecimento. Excelente escolha! 🌿";
    if (cal <= 600) return "Calorias moderadas. Fique atento ao total do dia.";
    return "Refeição calórica. Considere reduzir a porção ou substituir por opções mais leves.";
  }
  return "Refeição equilibrada para manutenção. Boa escolha!";
}

function getSuggestionText(cal, prot, goal) {
  if (goal === "muscle_gain" && prot / cal < 0.08)
    return "Adicione uma fonte proteica como frango, ovo ou whey para atingir sua meta de proteína.";
  if (goal === "weight_loss" && cal > 500)
    return "Adicione fibras como legumes e folhas verdes para aumentar saciedade com menos calorias.";
  return "Adicione uma fonte de fibras como aveia, frutas ou vegetais para melhorar o equilíbrio nutricional.";
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score }) {
  const color = score >= 8 ? "#4ade80" : score >= 5 ? "#facc15" : "#f87171";
  const label = score >= 8 ? "Excelente" : score >= 5 ? "Moderado" : "Baixo";
  return (
    <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Pontuação da refeição</p>
          <div className="flex items-end gap-1.5 mt-1">
            <span className="text-4xl font-black" style={{ color }}>{score}</span>
            <span className="text-lg text-white/40 mb-1">/10</span>
          </div>
        </div>
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${color}15`, border: `3px solid ${color}` }}>
          <span className="text-2xl">{score >= 8 ? "🏆" : score >= 5 ? "⚡" : "📉"}</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${score * 10}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
      </div>
      <div className="flex justify-between text-[10px] text-white/40">
        <span>Baixo</span>
        <span className="font-semibold" style={{ color }}>{label}</span>
        <span>Excelente</span>
      </div>
    </div>
  );
}

// ─── MacroCard ────────────────────────────────────────────────────────────────

function MacroCard({ emoji, label, value, unit, color, max }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 50);
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-3 rounded-2xl flex flex-col gap-2" style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
      <div className="text-2xl">{emoji}</div>
      <div>
        <p className="text-[10px] text-white/50 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-black text-white">{value}<span className="text-xs text-white/50 font-normal ml-0.5">{unit}</span></p>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
      </div>
    </motion.div>
  );
}

// ─── MacroBalance ─────────────────────────────────────────────────────────────

function MacroBalance({ prot, carbs, fats }) {
  const total = prot + carbs + fats || 1;
  const pp = Math.round((prot / total) * 100);
  const cp = Math.round((carbs / total) * 100);
  const fp = 100 - pp - cp;
  return (
    <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Equilíbrio Nutricional</p>
      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
        <motion.div className="bg-green-400 rounded-l-full" style={{ width: `${pp}%` }} initial={{ width: 0 }} animate={{ width: `${pp}%` }} transition={{ duration: 0.8 }} />
        <motion.div className="bg-yellow-400" style={{ width: `${cp}%` }} initial={{ width: 0 }} animate={{ width: `${cp}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
        <motion.div className="bg-blue-400 rounded-r-full" style={{ width: `${fp}%` }} initial={{ width: 0 }} animate={{ width: `${fp}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
      </div>
      <div className="flex justify-between">
        {[["🥩", "Proteína", pp, "#4ade80"], ["🍞", "Carbs", cp, "#facc15"], ["🥑", "Gordura", fp, "#60a5fa"]].map(([e, n, v, c]) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
            <span className="text-xs text-white/60">{e} {v}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ImpactBars ───────────────────────────────────────────────────────────────

function ImpactBars({ cal, prot, carbs, fats, userProfile, todayTotals }) {
  const calTarget = userProfile?.daily_calorie_target || 2000;
  const protTarget = userProfile?.protein_target || 150;
  const carbsTarget = userProfile?.carbs_target || 250;
  const fatsTarget = userProfile?.fats_target || 70;

  const items = [
    { label: "Calorias do dia", current: (todayTotals?.cal || 0) + cal, target: calTarget, unit: "kcal", color: "#f97316", emoji: "🔥" },
    { label: "Proteína do dia", current: (todayTotals?.prot || 0) + prot, target: protTarget, unit: "g", color: "#4ade80", emoji: "🥩" },
    { label: "Carboidratos do dia", current: (todayTotals?.carbs || 0) + carbs, target: carbsTarget, unit: "g", color: "#facc15", emoji: "🍞" },
    { label: "Gorduras do dia", current: (todayTotals?.fats || 0) + fats, target: fatsTarget, unit: "g", color: "#60a5fa", emoji: "🥑" },
  ];

  return (
    <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Impacto na sua meta diária</p>
      {items.map(({ label, current, target, unit, color, emoji }) => {
        const pct = Math.min(100, Math.round((current / target) * 100));
        const over = current > target;
        return (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">{emoji} {label}</span>
              <span className="text-xs font-bold" style={{ color: over ? "#f87171" : color }}>
                {Math.round(current)}/{target}{unit}
              </span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: over ? "#f87171" : color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── FoodItem ─────────────────────────────────────────────────────────────────

const FOOD_EMOJIS = ["🥚", "🍞", "🍌", "🥛", "🍚", "🥩", "🥦", "🍎", "🧀", "🍗", "🥜", "🫐", "🥕", "🥑", "🍋"];

function FoodItemCard({ item, index, onRemove, onEdit }) {
  const emoji = FOOD_EMOJIS[index % FOOD_EMOJIS.length];
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <span className="text-xl">{emoji}</span>
      <span className="flex-1 text-sm text-white font-medium">{item}</span>
      <button onClick={() => onEdit(index)} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
        <Edit3 className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => onRemove(index)} className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/50 hover:text-red-400 transition-colors" style={{ background: "rgba(255,255,255,0.05)" }}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NutritionResultsPremium({ data, userProfile, mealType, onSave, onReset, todayTotals }) {
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [foodItems, setFoodItems] = useState(
    data.food_name.includes(",") ? data.food_name.split(",").map(s => s.trim()) : [data.food_name]
  );
  const [newFoodInput, setNewFoodInput] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cal = Math.round(data.calories * portionMultiplier);
  const prot = Math.round(data.protein * portionMultiplier * 10) / 10;
  const carbs = Math.round(data.carbs * portionMultiplier * 10) / 10;
  const fats = Math.round(data.fats * portionMultiplier * 10) / 10;

  const portionGrams = parseInt(data.portion_size) || 100;
  const currentGrams = Math.round(portionGrams * portionMultiplier);

  const goal = userProfile?.goal;
  const score = getScore(cal, prot, carbs, fats, goal);
  const insightText = getInsightText(cal, prot, carbs, fats, goal);
  const suggestionText = getSuggestionText(cal, prot, goal);

  const removeFood = (i) => setFoodItems(prev => prev.filter((_, idx) => idx !== i));
  const addFood = () => {
    if (newFoodInput.trim()) {
      setFoodItems(prev => [...prev, newFoodInput.trim()]);
      setNewFoodInput("");
    }
  };
  const startEdit = (i) => { setEditIndex(i); setEditValue(foodItems[i]); };
  const saveEdit = () => {
    if (editValue.trim()) setFoodItems(prev => prev.map((f, i) => i === editIndex ? editValue.trim() : f));
    setEditIndex(null);
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é nutricionista. Para a refeição "${foodItems.join(", ")}" com ${cal}kcal, sugira 2 substituições simples e práticas para o objetivo: ${goal || "manutenção"}. Seja específico com economia calórica.`,
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
    await onSave({ ...data, food_name: foodItems.join(", "), calories: cal, protein: prot, carbs, fats });
    setSaving(false);
    setSaved(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* ── Nome + porção ── */}
      <div>
        <h3 className="text-2xl font-black text-white leading-tight">{foodItems.join(", ")}</h3>
        <p className="text-sm text-white/40 mt-0.5">~{currentGrams}g • {mealType}</p>
      </div>

      {/* ── Caloria destaque ── */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-center justify-center py-5 rounded-2xl"
        style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))", border: "1px solid rgba(249,115,22,0.3)" }}
      >
        <div className="text-center">
          <p className="text-xs text-orange-300/80 uppercase tracking-widest font-semibold mb-1">Calorias Totais</p>
          <div className="flex items-end justify-center gap-1">
            <span className="text-6xl font-black text-white">{cal}</span>
            <span className="text-2xl text-orange-300 mb-2">kcal</span>
          </div>
          <span className="text-3xl">🔥</span>
        </div>
      </motion.div>

      {/* ── 3 Macro cards ── */}
      <div className="grid grid-cols-3 gap-2.5">
        <MacroCard emoji="🥩" label="Proteína" value={prot} unit="g" color="#4ade80" max={userProfile?.protein_target || 150} />
        <MacroCard emoji="🍞" label="Carboidr." value={carbs} unit="g" color="#facc15" max={userProfile?.carbs_target || 250} />
        <MacroCard emoji="🥑" label="Gordura" value={fats} unit="g" color="#60a5fa" max={userProfile?.fats_target || 70} />
      </div>

      {/* ── Equilíbrio ── */}
      <MacroBalance prot={prot} carbs={carbs} fats={fats} />

      {/* ── Score ── */}
      <ScoreBar score={score} />

      {/* ── Alimentos identificados ── */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Alimentos Identificados</p>
        <div className="space-y-2">
          {foodItems.map((item, i) => (
            editIndex === i ? (
              <div key={i} className="flex gap-2">
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 text-white text-sm rounded-xl px-3 py-2 outline-none"
                  autoFocus
                />
                <button onClick={saveEdit} className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#CEF17B]/20 text-[#CEF17B]">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditIndex(null)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 text-white/50">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <FoodItemCard key={i} item={item} index={i} onRemove={removeFood} onEdit={startEdit} />
            )
          ))}
        </div>
        {/* Add food */}
        <div className="flex gap-2">
          <input
            value={newFoodInput}
            onChange={e => setNewFoodInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addFood()}
            placeholder="Adicionar alimento..."
            className="flex-1 bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 outline-none placeholder:text-white/30"
          />
          <button onClick={addFood} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.15)", border: "1px solid rgba(206,241,123,0.3)" }}>
            <Plus className="w-4 h-4 text-[#CEF17B]" />
          </button>
        </div>
      </div>

      {/* ── Ajuste porção ── */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#CEF17B]" />
            <span className="text-sm font-semibold text-white">Ajuste a porção</span>
          </div>
          <span className="text-sm font-bold text-[#CEF17B]">~{currentGrams}g</span>
        </div>
        <Slider value={[portionMultiplier * 100]} onValueChange={([v]) => setPortionMultiplier(v / 100)} min={50} max={300} step={10} className="w-full" />
        <div className="flex justify-between text-[10px] text-white/40">
          <span>½ porção</span><span>Normal</span><span>Dobro</span>
        </div>
      </div>

      {/* ── Impacto meta diária ── */}
      <ImpactBars cal={cal} prot={prot} carbs={carbs} fats={fats} userProfile={userProfile} todayTotals={todayTotals} />

      {/* ── Análise ── */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(206,241,123,0.07)", border: "1px solid rgba(206,241,123,0.2)" }}>
        <p className="text-xs text-[#CEF17B]/70 uppercase tracking-wider font-semibold mb-2">🧠 Análise da refeição</p>
        <p className="text-sm text-white/80 leading-relaxed">{insightText}</p>
      </div>

      {/* ── Sugestão para melhorar ── */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.2)" }}>
        <p className="text-xs text-blue-300/70 uppercase tracking-wider font-semibold mb-2">💡 Sugestão para melhorar</p>
        <p className="text-sm text-white/80 leading-relaxed">{suggestionText}</p>
      </div>

      {/* ── IA: Substituições ── */}
      <button
        onClick={fetchSuggestions}
        className="w-full flex items-center justify-between p-4 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
        style={{ background: "rgba(206,241,123,0.08)", border: "1px solid rgba(206,241,123,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#CEF17B]" />
          <span>Ver substituições inteligentes</span>
        </div>
        <ArrowRight className="w-4 h-4 text-[#CEF17B]" />
      </button>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
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

      {/* ── CTA Registrar ── */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full h-16 rounded-2xl font-black text-lg text-[#084734] disabled:opacity-70 active:scale-95 transition-all shadow-xl"
          style={{ background: saved ? "#4ade80" : "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#084734]/30 border-t-[#084734] rounded-full animate-spin" />
              Registrando...
            </div>
          ) : saved ? (
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Refeição Registrada! ✅
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>📋</span> Registrar Refeição
            </div>
          )}
        </button>
        <button onClick={onReset} className="w-full py-2 text-sm text-white/40 hover:text-white/70 transition-colors">
          Escanear outro alimento
        </button>
      </div>

    </motion.div>
  );
}