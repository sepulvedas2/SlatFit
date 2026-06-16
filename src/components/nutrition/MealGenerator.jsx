import React, { useState } from "react";
import * as ai from "@/api/ai";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Salad, Sparkles } from "lucide-react";

export default function MealGenerator({ userProfile }) {
  const [mode, setMode] = useState(null);
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function generate(m) {
    setLoading(true);
    setResult(null);
    setMode(m);
    const res = await ai.mealPlan({
      goal: userProfile?.goal,
      weight: userProfile?.current_weight,
      gender: userProfile?.gender,
      level: userProfile?.fitness_level,
      mode: m,
      ingredients,
    });
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="space-y-4">

      {/* Botões de seleção */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setMode("ingredients"); setResult(null); }}
          className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all active:scale-95"
          style={{
            background: mode === "ingredients" ? "rgba(206,241,123,0.12)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${mode === "ingredients" ? "rgba(206,241,123,0.4)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.15)" }}>
            <Salad className="w-5 h-5 text-[#CEF17B]" />
          </div>
          <span className="text-xs font-bold text-white text-center leading-tight">
            Montar com o que tenho em casa
          </span>
        </button>

        <button
          onClick={() => generate("suggestion")}
          className="flex flex-col items-center gap-2.5 p-4 rounded-2xl transition-all active:scale-95"
          style={{
            background: mode === "suggestion" && result ? "rgba(206,241,123,0.12)" : "rgba(255,255,255,0.04)",
            border: `1.5px solid ${mode === "suggestion" && result ? "rgba(206,241,123,0.4)" : "rgba(255,255,255,0.1)"}`,
          }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.15)" }}>
            <Sparkles className="w-5 h-5 text-[#CEF17B]" />
          </div>
          <span className="text-xs font-bold text-white text-center leading-tight">
            Quero sugestão pronta
          </span>
        </button>
      </div>

      {/* Input de ingredientes */}
      {mode === "ingredients" && !result && (
        <div className="space-y-3">
          <Textarea
            placeholder="Ex: arroz, ovo, frango, banana, aveia..."
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            className="resize-none text-white placeholder:text-white/30 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            rows={3}
          />
          <button
            onClick={() => generate("ingredients")}
            disabled={loading}
            className="w-full h-12 rounded-2xl font-bold text-sm text-[#084734] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg,#CEF17B,#CEEDB2)" }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Salad className="w-4 h-4" />}
            Gerar Refeições
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="py-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#CEF17B]" />
          <p className="text-xs text-white/40">Gerando suas refeições personalizadas...</p>
        </div>
      )}

      {/* Resultado */}
      {result && !loading && (
        <div className="rounded-2xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="whitespace-pre-line text-white/70 text-sm leading-relaxed">
            {result}
          </div>
          <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => generate(mode)}
              className="flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
              style={{ background: "rgba(206,241,123,0.1)", border: "1px solid rgba(206,241,123,0.2)", color: "#CEF17B" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Gerar novamente
            </button>
            {mode === "ingredients" && (
              <button
                onClick={() => { setResult(null); setIngredients(""); }}
                className="h-9 px-4 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}