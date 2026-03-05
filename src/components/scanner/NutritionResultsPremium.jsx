import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sliders, Lightbulb, ArrowRight, Check, ChevronDown, ChevronUp, Plus, Trash2, Zap, Target, FlaskConical, Leaf } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { base44 } from "@/api/base44Client";

// ─── Score Nutricional ─────────────────────────────────────────────────────────
function calcNutritionalScore({ protein, carbs, fats, calories, goal }) {
  let score = 5;
  if (protein >= 20) score += 2;
  else if (protein >= 10) score += 1;
  if (protein >= 20 && calories <= 500) score += 1; // fibras/densid proxy
  if (carbs > 60) score -= 1;
  if (fats > 25) score -= 1;
  if (calories > 700) score -= 1;
  if (goal === "muscle_gain" && protein >= 20) score += 1;
  if (goal === "weight_loss" && calories <= 400) score += 1;
  return Math.max(1, Math.min(10, score));
}

function ScoreRing({ score }) {
  const color = score >= 7 ? "#4ade80" : score >= 4 ? "#facc15" : "#f87171";
  const label = score >= 7 ? "Ótimo" : score >= 4 ? "Regular" : "Baixo";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-16 h-16 rounded-full flex flex-col items-center justify-center"
        style={{ background: `${color}18`, border: `3px solid ${color}`, boxShadow: `0 0 18px ${color}40` }}
      >
        <span className="text-xl font-black" style={{ color }}>{score}</span>
        <span className="text-[9px] text-white/50 -mt-0.5">/ 10</span>
      </div>
      <span className="text-xs font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

// ─── Macro bar ─────────────────────────────────────────────────────────────────
function MacroBar({ label, value, unit, color, pct, emoji }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60">{emoji} {label}</span>
        <span className="text-sm font-bold text-white">{value}{unit}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] text-white/30">{pct}% dos macros</span>
    </div>
  );
}

// ─── Impacto na meta ───────────────────────────────────────────────────────────
function ImpactRow({ label, value, unit, target, color }) {
  const pct = target > 0 ? Math.round((value / target) * 100) : 0;
  const capped = Math.min(pct, 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs text-white/50 flex-shrink-0">{label}</div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${capped}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
      <div className="text-xs font-bold text-white flex-shrink-0 w-16 text-right">
        {value}{unit} <span className="text-white/40 font-normal">({pct}%)</span>
      </div>
    </div>
  );
}

// ─── Impacto glicêmico ─────────────────────────────────────────────────────────
function GlycemicBadge({ carbs, fats }) {
  const level = carbs > 50 ? "alto" : carbs > 25 ? "médio" : "baixo";
  const cfg = {
    alto: { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.3)", emoji: "🔴" },
    médio: { color: "#facc15", bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)", emoji: "🟡" },
    baixo: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.3)", emoji: "🟢" },
  }[level];
  return (
    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4" style={{ color: cfg.color }} />
        <span className="text-sm text-white/80">Impacto glicêmico estimado</span>
      </div>
      <span className="text-sm font-bold capitalize" style={{ color: cfg.color }}>{cfg.emoji} {level}</span>
    </div>
  );
}

// ─── Micronutrientes (estimado) ────────────────────────────────────────────────
function Micronutrients({ protein, carbs, fats, calories }) {
  const micros = [
    { name: "Ferro", value: Math.round(protein * 0.05 * 10) / 10, unit: "mg", dv: 18 },
    { name: "Potássio", value: Math.round((protein * 3.5 + carbs * 2) * 10) / 10, unit: "mg", dv: 4700 },
    { name: "Vitamina C", value: Math.round(carbs * 0.3 * 10) / 10, unit: "mg", dv: 90 },
    { name: "Cálcio", value: Math.round(protein * 2 + fats * 0.5), unit: "mg", dv: 1000 },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {micros.map(m => {
        const pct = Math.round((m.value / m.dv) * 100);
        return (
          <div key={m.name} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-white/60">{m.name}</span>
              <span className="text-xs font-bold text-white">{m.value}{m.unit}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full bg-[#CEF17B]" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-[9px] text-white/30 mt-0.5 block">{pct}% VD</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function NutritionResultsPremium({ data, userProfile, mealType, onSave, onReset }) {
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [showImpact, setShowImpact] = useState(false);
  const [showMicros, setShowMicros] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [foodList, setFoodList] = useState(
    data.detected_foods || [data.food_name]
  );
  const [newFood, setNewFood] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cal = Math.round(data.calories * portionMultiplier);
  const prot = Math.round(data.protein * portionMultiplier * 10) / 10;
  const carbs = Math.round(data.carbs * portionMultiplier * 10) / 10;
  const fats = Math.round(data.fats * portionMultiplier * 10) / 10;

  const totalMacros = prot + carbs + fats || 1;
  const protPct = Math.round((prot / totalMacros) * 100);
  const carbsPct = Math.round((carbs / totalMacros) * 100);
  const fatsPct = Math.round((fats / totalMacros) * 100);

  const goal = userProfile?.goal;
  const score = calcNutritionalScore({ protein: prot, carbs, fats, calories: cal, goal });

  const goalTargets = {
    calories: userProfile?.daily_calorie_target || 2000,
    protein: userProfile?.protein_target || 150,
    carbs: userProfile?.carbs_target || 250,
    fats: userProfile?.fats_target || 65,
  };

  const goalLabel = { muscle_gain: "ganho de massa", weight_loss: "emagrecimento", maintenance: "manutenção" }[goal] || "manutenção";

  const getAnalysis = () => {
    if (goal === "muscle_gain") {
      if (prot >= 20) return "Boa quantidade de proteína para hipertrofia! Refeição excelente para ganho muscular. 💪";
      return "Proteína abaixo do ideal para ganho de massa. Considere adicionar frango, ovos ou whey.";
    }
    if (goal === "weight_loss") {
      if (cal <= 400) return "Refeição leve e adequada para emagrecimento. Ótima escolha! ✅";
      if (cal <= 600) return "Calorias moderadas. Fique atento ao total do dia para manter o déficit.";
      return "Refeição calórica. Alto teor de carboidratos refinados pode dificultar o emagrecimento.";
    }
    return "Refeição equilibrada para manutenção. Boa distribuição de macronutrientes.";
  };

  const getSuggestion = () => {
    if (prot < 15) return "💡 Sugestão: adicione uma fonte de proteína como ovos, frango grelhado ou iogurte grego para melhorar o equilíbrio.";
    if (carbs > 60) return "💡 Sugestão: substitua parte dos carboidratos por fibras — aveia, chia ou folhas verdes reduzem o impacto glicêmico.";
    if (fats > 25) return "💡 Sugestão: prefira gorduras boas como abacate e azeite em vez de frituras ou manteiga.";
    return "💡 Refeição bem equilibrada! Para melhorar ainda mais, adicione legumes ou verduras para aumentar a densidade de micronutrientes.";
  };

  const portionGrams = parseInt(data.portion_size) || 100;
  const currentGrams = Math.round(portionGrams * portionMultiplier);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    setShowSuggestions(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é nutricionista. Para a refeição "${foodList.join(", ")}" com ${cal}kcal, ${prot}g proteína, sugira 2 substituições práticas para objetivo: ${goalLabel}. Seja específico com a economia calórica.`,
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* ── BLOCO 1: Nome + Score ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white leading-tight">{data.food_name}</h3>
          <p className="text-sm text-white/50 mt-0.5">~{currentGrams}g • {mealType}</p>
        </div>
        <ScoreRing score={score} />
      </div>

      {/* ── BLOCO 2: Calorias destaque ── */}
      <div
        className="flex items-center justify-center py-4 rounded-2xl"
        style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.25)" }}
      >
        <span className="text-4xl font-black text-orange-400">{cal}</span>
        <span className="text-orange-300/70 ml-2 text-lg font-semibold">kcal</span>
      </div>

      {/* ── BLOCO 3: Macros com barras ── */}
      <div className="p-4 rounded-2xl space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Macronutrientes</p>
        <MacroBar label="Proteína" emoji="🥩" value={prot} unit="g" color="#4ade80" pct={protPct} />
        <MacroBar label="Carboidratos" emoji="🍞" value={carbs} unit="g" color="#facc15" pct={carbsPct} />
        <MacroBar label="Gorduras" emoji="🥑" value={fats} unit="g" color="#60a5fa" pct={fatsPct} />
      </div>

      {/* ── BLOCO 4: Equilíbrio nutricional (barra horizontal) ── */}
      <div className="p-4 rounded-2xl space-y-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Equilíbrio Nutricional</p>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${protPct}%` }} transition={{ duration: 0.8 }} style={{ backgroundColor: "#4ade80" }} className="rounded-full" />
          <motion.div initial={{ width: 0 }} animate={{ width: `${carbsPct}%` }} transition={{ duration: 0.8, delay: 0.1 }} style={{ backgroundColor: "#facc15" }} className="rounded-full" />
          <motion.div initial={{ width: 0 }} animate={{ width: `${fatsPct}%` }} transition={{ duration: 0.8, delay: 0.2 }} style={{ backgroundColor: "#60a5fa" }} className="rounded-full" />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-400">🥩 Prot {protPct}%</span>
          <span className="text-yellow-400">🍞 Carbs {carbsPct}%</span>
          <span className="text-blue-400">🥑 Gord {fatsPct}%</span>
        </div>
      </div>

      {/* ── BLOCO 5: Impacto glicêmico ── */}
      <GlycemicBadge carbs={carbs} fats={fats} />

      {/* ── BLOCO 6: Alimentos identificados ── */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
          <Leaf className="w-3.5 h-3.5" /> Alimentos identificados
        </p>
        <div className="flex flex-wrap gap-2">
          {foodList.map((food, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-white/80" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {food}
              <button onClick={() => setFoodList(prev => prev.filter((_, idx) => idx !== i))}>
                <Trash2 className="w-3 h-3 text-red-400 hover:text-red-300" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newFood}
            onChange={e => setNewFood(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && newFood.trim()) { setFoodList(p => [...p, newFood.trim()]); setNewFood(""); } }}
            placeholder="Adicionar alimento..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={() => { if (newFood.trim()) { setFoodList(p => [...p, newFood.trim()]); setNewFood(""); } }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(206,241,123,0.15)", border: "1px solid rgba(206,241,123,0.3)" }}
          >
            <Plus className="w-4 h-4 text-[#CEF17B]" />
          </button>
        </div>
      </div>

      {/* ── BLOCO 7: Impacto na meta ── */}
      <button
        onClick={() => setShowImpact(p => !p)}
        className="w-full flex items-center justify-between p-3 rounded-xl text-sm text-white/60 hover:text-white/90 transition-colors"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#CEF17B]" />
          <span className="font-semibold text-white/80">Impacto na sua meta</span>
        </div>
        {showImpact ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {showImpact && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <ImpactRow label="🔥 Calorias" value={cal} unit=" kcal" target={goalTargets.calories} color="#f97316" />
              <ImpactRow label="🥩 Proteína" value={prot} unit="g" target={goalTargets.protein} color="#4ade80" />
              <ImpactRow label="🍞 Carboidratos" value={carbs} unit="g" target={goalTargets.carbs} color="#facc15" />
              <ImpactRow label="🥑 Gorduras" value={fats} unit="g" target={goalTargets.fats} color="#60a5fa" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BLOCO 8: Análise da refeição ── */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(206,241,123,0.06)", border: "1px solid rgba(206,241,123,0.15)" }}>
        <p className="text-xs font-bold text-[#CEF17B]/70 uppercase tracking-wider mb-2">Análise da refeição</p>
        <p className="text-sm text-white/80 leading-relaxed">{getAnalysis()}</p>
      </div>

      {/* ── BLOCO 9: Sugestão da IA ── */}
      <div className="p-4 rounded-2xl" style={{ background: "rgba(255,106,0,0.06)", border: "1px solid rgba(255,106,0,0.2)" }}>
        <p className="text-xs font-bold text-orange-400/70 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5" /> Sugestão da IA
        </p>
        <p className="text-sm text-white/80 leading-relaxed">{getSuggestion()}</p>
      </div>

      {/* ── BLOCO 10: Micronutrientes (expansível) ── */}
      <button
        onClick={() => setShowMicros(p => !p)}
        className="w-full flex items-center justify-between p-3 rounded-xl text-sm text-white/60 hover:text-white/90 transition-colors"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-white/80">Micronutrientes estimados</span>
        </div>
        {showMicros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {showMicros && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Micronutrients protein={prot} carbs={carbs} fats={fats} calories={cal} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ajustar porção ── */}
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
          min={50} max={300} step={10}
          className="w-full"
        />
        <div className="flex justify-between text-[10px] text-white/40">
          <span>Metade</span><span>Normal</span><span>Dobro</span>
        </div>
      </div>

      {/* ── Melhorar refeição (IA) ── */}
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
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
              Refeição registrada!
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              Registrar refeição
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