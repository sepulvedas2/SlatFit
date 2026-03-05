import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { base44 } from "@/api/base44Client";
import {
  Flame, Star, ChevronDown, ChevronUp,
  Lightbulb, Check, Plus, Trash2, Edit2, ArrowLeft
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function getScore(cal, prot, carbs, fats, goal) {
  const total = prot + carbs + fats || 1;
  const protPct = (prot / total) * 100;
  const fatsPct = (fats / total) * 100;
  let score = 6;
  if (goal === "muscle_gain") {
    if (prot / (cal || 1) >= 0.08) score += 2;
    if (protPct >= 25) score += 1;
  } else if (goal === "weight_loss") {
    if (cal <= 400) score += 2.5;
    else if (cal <= 600) score += 1;
    else score -= 1.5;
    if (fatsPct <= 30) score += 0.5;
  } else {
    if (protPct >= 20 && protPct <= 35) score += 2;
    if (cal >= 300 && cal <= 700) score += 1;
  }
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

function scoreColor(s) {
  if (s >= 8) return "#4ade80";
  if (s >= 5) return "#facc15";
  return "#f87171";
}

function MacroCard({ emoji, label, value, color, current, target }) {
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 50;
  return (
    <div className="flex-1 rounded-2xl p-3 text-center space-y-2" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
      <div className="text-2xl">{emoji}</div>
      <div>
        <div className="text-lg font-bold text-white leading-none">{value}<span className="text-xs text-white/50">g</span></div>
        <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function ImpactBar({ label, current, added, target, color }) {
  const beforePct = Math.min(100, (current / (target || 1)) * 100);
  const afterPct = Math.min(100, ((current + added) / (target || 1)) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/60">{label}</span>
        <span className="text-white/80 font-semibold">{Math.round(current + added)} / {target}</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
        <motion.div className="absolute h-full rounded-full opacity-40" style={{ width: `${beforePct}%`, backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${beforePct}%` }} transition={{ duration: 0.6 }} />
        <motion.div className="absolute h-full rounded-full" style={{ width: `${afterPct}%`, backgroundColor: color }} initial={{ width: `${beforePct}%` }} animate={{ width: `${afterPct}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
      </div>
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export default function ScannerResultScreen({
  data,
  imagePreview,
  userProfile,
  mealType,
  todayFoods = [],
  onSave,
  onReset,
}) {
  const [portionMultiplier, setPortionMultiplier] = useState(1);
  const [showImpact, setShowImpact] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const cal = Math.round(data.calories * portionMultiplier);
  const prot = Math.round(data.protein * portionMultiplier * 10) / 10;
  const carbs = Math.round(data.carbs * portionMultiplier * 10) / 10;
  const fats = Math.round(data.fats * portionMultiplier * 10) / 10;

  const totalMacros = prot + carbs + fats || 1;
  const protPct = Math.round((prot / totalMacros) * 100);
  const carbsPct = Math.round((carbs / totalMacros) * 100);
  const fatsPct = Math.round((fats / totalMacros) * 100);

  const goal = userProfile?.goal;
  const score = getScore(cal, prot, carbs, fats, goal);
  const sc = scoreColor(score);

  // daily totals already logged
  const dayCalories = todayFoods.reduce((s, f) => s + (f.calories || 0), 0);
  const dayProtein = todayFoods.reduce((s, f) => s + (f.protein || 0), 0);
  const dayCarbs = todayFoods.reduce((s, f) => s + (f.carbs || 0), 0);
  const dayFats = todayFoods.reduce((s, f) => s + (f.fats || 0), 0);

  const calTarget = userProfile?.daily_calorie_target || 2000;
  const protTarget = userProfile?.protein_target || 150;
  const carbsTarget = userProfile?.carbs_target || 250;
  const fatsTarget = userProfile?.fats_target || 65;

  const portionGrams = parseInt(data.portion_size) || 100;
  const currentGrams = Math.round(portionGrams * portionMultiplier);

  // Simple analysis text based on macros + goal
  useEffect(() => {
    if (!goal) { setAnalysis("Refeição registrada com sucesso!"); return; }
    const msgs = [];
    if (goal === "muscle_gain") {
      if (prot / (cal || 1) >= 0.08) msgs.push("✅ Boa quantidade de proteína para hipertrofia.");
      else msgs.push("⚠️ Proteína abaixo do ideal. Considere adicionar uma fonte proteica.");
      if (carbsPct >= 40) msgs.push("✅ Carboidratos adequados para energia e recuperação.");
    } else if (goal === "weight_loss") {
      if (cal <= 400) msgs.push("✅ Refeição leve, dentro da meta de emagrecimento.");
      else if (cal <= 600) msgs.push("⚠️ Calorias moderadas. Fique atento ao total do dia.");
      else msgs.push("🔴 Refeição calórica. Considere reduzir a porção.");
      if (fatsPct > 40) msgs.push("⚠️ Gordura elevada. Prefira preparo com menos óleo.");
    } else {
      msgs.push("✅ Refeição equilibrada para manutenção.");
      if (protPct < 20) msgs.push("💡 Adicionar proteína melhoraria o equilíbrio.");
    }
    setAnalysis(msgs.join(" "));
  }, [cal, prot, carbs, fats, goal, protPct, carbsPct, fatsPct]);

  const fetchSuggestion = async () => {
    setLoadingSuggestion(true);
    setShowSuggestion(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é nutricionista. Para a refeição "${data.food_name}" (${cal}kcal, ${prot}g prot, ${carbs}g carbs, ${fats}g gordura), dê UMA sugestão prática e curta para melhorar o equilíbrio nutricional, considerando objetivo: ${goal || "manutenção"}. Máximo 2 frases.`,
      response_json_schema: {
        type: "object",
        properties: { suggestion: { type: "string" } }
      }
    });
    setSuggestion(res?.suggestion || null);
    setLoadingSuggestion(false);
  };

  // XP + challenge check after saving
  const checkFoodChallenges = async (userEmail, savedData) => {
    const [pointsList, allFoods] = await Promise.all([
      base44.entities.UserPoints.filter({ user_email: userEmail }),
      base44.entities.FoodLog.filter({ user_email: userEmail }),
    ]);
    const points = pointsList[0];
    if (!points) return;

    let xpGain = 5; // base XP per meal logged

    // Challenge: score >= 7 → +10 XP bonus
    if (score >= 7) xpGain += 10;

    // Challenge: logged 3 meals today → +30 XP (only when exactly hitting 3)
    const today = new Date().toISOString().split("T")[0];
    const todayCount = allFoods.filter(f => f.log_date === today).length + 1; // +1 for current save
    if (todayCount === 3) xpGain += 30;

    // Update XP
    const newXp = (points.xp_current || 0) + xpGain;
    const xpNeeded = points.xp_next_level || 100;
    const newTotal = (points.total_points || 0) + xpGain;
    if (newXp >= xpNeeded) {
      await base44.entities.UserPoints.update(points.id, {
        xp_current: newXp - xpNeeded,
        level: (points.level || 1) + 1,
        xp_next_level: Math.round(xpNeeded * 1.5),
        total_points: newTotal,
      });
    } else {
      await base44.entities.UserPoints.update(points.id, {
        xp_current: newXp,
        total_points: newTotal,
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave({ ...data, calories: cal, protein: prot, carbs, fats });
    // fire-and-forget XP check
    if (data.user_email || userProfile?.user_email) {
      checkFoodChallenges(data.user_email || userProfile?.user_email, { cal, prot, carbs, fats }).catch(() => {});
    }
    setSaving(false);
    setSaved(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* SEÇÃO 1 — Foto */}
      {imagePreview && (
        <div className="relative overflow-hidden rounded-3xl">
          <img src={imagePreview} alt="Refeição" className="w-full aspect-[4/3] object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(8,71,52,0.95))" }} />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-white font-bold text-2xl leading-tight">{data.food_name}</h2>
            <p className="text-white/60 text-sm mt-0.5">~{currentGrams}g · {mealType}</p>
          </div>
          {/* Score badge */}
          <div className="absolute top-3 right-3 w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-xl" style={{ background: `${sc}20`, border: `2px solid ${sc}`, backdropFilter: "blur(10px)" }}>
            <Star className="w-3 h-3 mb-0.5" style={{ color: sc }} />
            <span className="text-lg font-bold leading-none" style={{ color: sc }}>{score}</span>
            <span className="text-[8px] text-white/50">score</span>
          </div>
        </div>
      )}

      {/* SEÇÃO 2 — Calorias em destaque */}
      <div className="rounded-3xl p-5 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,146,60,0.1))", border: "1px solid rgba(249,115,22,0.3)" }}>
        <div className="text-4xl mb-1">🔥</div>
        <div className="text-5xl font-black text-white leading-none">{cal}</div>
        <div className="text-orange-300 font-semibold text-lg mt-1">kcal</div>
        <p className="text-white/40 text-xs mt-2">Calorias totais desta porção</p>
      </div>

      {/* SEÇÃO 3 — Macros */}
      <div className="flex gap-2">
        <MacroCard emoji="🥩" label="Proteína" value={prot} color="#4ade80" current={dayProtein} target={protTarget} />
        <MacroCard emoji="🍞" label="Carboidratos" value={carbs} color="#facc15" current={dayCarbs} target={carbsTarget} />
        <MacroCard emoji="🥑" label="Gorduras" value={fats} color="#60a5fa" current={dayFats} target={fatsTarget} />
      </div>

      {/* Slider de porção */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-white/80">Ajuste a porção</span>
          <span className="text-sm font-bold text-[#CEF17B]">~{currentGrams}g</span>
        </div>
        <Slider value={[portionMultiplier * 100]} onValueChange={([v]) => setPortionMultiplier(v / 100)} min={25} max={300} step={5} className="w-full" />
        <div className="flex justify-between text-[10px] text-white/30">
          <span>¼</span><span>½</span><span>Normal</span><span>1.5×</span><span>2×</span><span>3×</span>
        </div>
      </div>

      {/* SEÇÃO 4 — Equilíbrio nutricional */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Equilíbrio Nutricional</p>
        <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
          <motion.div style={{ width: `${protPct}%`, background: "#4ade80" }} initial={{ width: 0 }} animate={{ width: `${protPct}%` }} transition={{ duration: 0.8 }} className="rounded-full" />
          <motion.div style={{ width: `${carbsPct}%`, background: "#facc15" }} initial={{ width: 0 }} animate={{ width: `${carbsPct}%` }} transition={{ duration: 0.8, delay: 0.15 }} className="rounded-full" />
          <motion.div style={{ width: `${fatsPct}%`, background: "#60a5fa" }} initial={{ width: 0 }} animate={{ width: `${fatsPct}%` }} transition={{ duration: 0.8, delay: 0.3 }} className="rounded-full" />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-green-400">🥩 {protPct}% Prot</span>
          <span className="text-yellow-400">🍞 {carbsPct}% Carbs</span>
          <span className="text-blue-400">🥑 {fatsPct}% Gord</span>
        </div>
      </div>

      {/* SEÇÃO 5 — Score nutricional */}
      <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${sc}30` }}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-white">Pontuação da refeição</p>
          <span className="text-2xl font-black" style={{ color: sc }}>{score} <span className="text-sm font-normal text-white/40">/ 10</span></span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: sc }}
            initial={{ width: 0 }}
            animate={{ width: `${score * 10}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/30">
          <span>🔴 Baixa</span><span>🟡 Média</span><span>🟢 Alta</span>
        </div>
      </div>

      {/* SEÇÃO 8 — Análise */}
      {analysis && (
        <div className="p-4 rounded-2xl" style={{ background: "rgba(206,241,123,0.07)", border: "1px solid rgba(206,241,123,0.2)" }}>
          <p className="text-xs font-bold text-[#CEF17B] uppercase tracking-wider mb-2">Análise da refeição</p>
          <p className="text-sm text-white/80 leading-relaxed">{analysis}</p>
        </div>
      )}

      {/* SEÇÃO 7 — Impacto na meta diária */}
      <button
        onClick={() => setShowImpact(p => !p)}
        className="w-full flex items-center justify-between p-4 rounded-2xl text-sm font-semibold text-white/70 transition-colors"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span>📊 Impacto na sua meta diária</span>
        {showImpact ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {showImpact && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <ImpactBar label="🔥 Calorias" current={dayCalories} added={cal} target={calTarget} color="#f97316" />
              <ImpactBar label="🥩 Proteína" current={dayProtein} added={prot} target={protTarget} color="#4ade80" />
              <ImpactBar label="🍞 Carboidratos" current={dayCarbs} added={carbs} target={carbsTarget} color="#facc15" />
              <ImpactBar label="🥑 Gorduras" current={dayFats} added={fats} target={fatsTarget} color="#60a5fa" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEÇÃO 9 — Sugestão */}
      <button
        onClick={fetchSuggestion}
        className="w-full flex items-center justify-between p-4 rounded-2xl text-sm font-semibold text-white transition-all active:scale-95"
        style={{ background: "rgba(206,241,123,0.07)", border: "1px solid rgba(206,241,123,0.2)" }}
      >
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#CEF17B]" />
          <span>Sugestão para melhorar</span>
        </div>
        {!showSuggestion && <span className="text-[#CEF17B] text-xs">Gerar →</span>}
      </button>
      <AnimatePresence>
        {showSuggestion && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl" style={{ background: "rgba(206,241,123,0.07)", border: "1px solid rgba(206,241,123,0.15)" }}>
            {loadingSuggestion ? (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-[#CEF17B]/30 border-t-[#CEF17B] rounded-full animate-spin" />
                <span className="text-sm text-white/50">Analisando com IA...</span>
              </div>
            ) : (
              <p className="text-sm text-white/85 leading-relaxed">💡 {suggestion}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEÇÃO 10 — Registrar */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="w-full h-16 rounded-2xl font-bold text-lg text-[#084734] disabled:opacity-70 active:scale-95 transition-all shadow-xl"
          style={{ background: saved ? "#4ade80" : "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
        >
          {saving ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-[#084734]/30 border-t-[#084734] rounded-full animate-spin" />
              Salvando...
            </div>
          ) : saved ? (
            <div className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Refeição registrada! +XP
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>🍽️</span>
              Registrar refeição
            </div>
          )}
        </button>
        <button onClick={onReset} className="w-full py-2 text-sm text-white/40 hover:text-white/70 transition-colors flex items-center justify-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Escanear outro alimento
        </button>
      </div>
    </motion.div>
  );
}