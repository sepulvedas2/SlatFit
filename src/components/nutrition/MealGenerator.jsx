import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RefreshCw, Salad, Sparkles } from "lucide-react";

const GOAL_MAP = {
  weight_loss: "Emagrecimento",
  muscle_gain: "Hipertrofia / Ganho de massa",
  maintenance: "Manutenção",
};

export default function MealGenerator({ userProfile }) {
  const [mode, setMode] = useState(null); // "ingredients" | "suggestion"
  const [ingredients, setIngredients] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const goal = GOAL_MAP[userProfile?.goal] || "Manutenção";
  const weight = userProfile?.current_weight || "";
  const gender = userProfile?.gender === "male" ? "Masculino" : userProfile?.gender === "female" ? "Feminino" : "";
  const level = userProfile?.fitness_level || "Iniciante";

  async function generate(m) {
    setLoading(true);
    setResult(null);
    setMode(m);

    let prompt = "";
    if (m === "ingredients") {
      prompt = `Você é um nutricionista brasileiro. O usuário tem os seguintes ingredientes disponíveis em casa: ${ingredients || "arroz, feijão, ovo, frango"}.

Objetivo: ${goal}
Gere sugestões práticas de refeições (café da manhã, almoço e jantar) usando esses ingredientes.
Adicione uma breve explicação nutricional de cada refeição em linguagem simples e brasileira.
Formato da resposta:
☀️ Café da manhã: [refeição] — [explicação curta]
🍽️ Almoço: [refeição] — [explicação curta]
🌙 Jantar: [refeição] — [explicação curta]
💡 Dica: [uma dica nutricional rápida baseada no objetivo]`;
    } else {
      prompt = `Você é um nutricionista brasileiro. Gere um cardápio diário personalizado.

Objetivo: ${goal}
${weight ? `Peso: ${weight}kg` : ""}
${gender ? `Sexo: ${gender}` : ""}
Nível de treino: ${level}

Gere sugestões de café da manhã, almoço e jantar com ingredientes brasileiros acessíveis.
Seja didático, direto e use linguagem simples.
Formato da resposta:
☀️ Café da manhã: [refeição] — [explicação curta]
🍽️ Almoço: [refeição] — [explicação curta]
🌙 Jantar: [refeição] — [explicação curta]
💡 Dica: [uma dica nutricional rápida baseada no objetivo]`;
    }

    const res = await base44.integrations.Core.InvokeLLM({ prompt });
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => { setMode("ingredients"); setResult(null); }}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            mode === "ingredients"
              ? "border-[#CEF17B] bg-[#CEF17B]/10"
              : "border-[#CEF17B]/20 bg-white/5 hover:bg-white/10"
          }`}
        >
          <Salad className="w-8 h-8 text-[#CEF17B]" />
          <span className="text-sm font-bold text-white text-center leading-tight">
            Montar com o que tenho em casa
          </span>
        </button>
        <button
          onClick={() => generate("suggestion")}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            mode === "suggestion" && result
              ? "border-[#CEF17B] bg-[#CEF17B]/10"
              : "border-[#CEF17B]/20 bg-white/5 hover:bg-white/10"
          }`}
        >
          <Sparkles className="w-8 h-8 text-[#CEF17B]" />
          <span className="text-sm font-bold text-white text-center leading-tight">
            Quero sugestão pronta
          </span>
        </button>
      </div>

      {mode === "ingredients" && !result && (
        <div className="space-y-3">
          <Textarea
            placeholder="Ex: arroz, ovo, frango, banana, aveia..."
            value={ingredients}
            onChange={e => setIngredients(e.target.value)}
            className="bg-white/5 border-[#CEF17B]/20 text-white placeholder:text-white/40 resize-none"
            rows={3}
          />
          <Button
            onClick={() => generate("ingredients")}
            disabled={loading}
            className="w-full h-12 bg-[#CEF17B] hover:bg-[#b8d966] text-[#084734] font-black text-base rounded-xl"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Salad className="w-5 h-5 mr-2" />}
            Gerar Refeições
          </Button>
        </div>
      )}

      {loading && (
        <Card className="glass-effect border-[#CEF17B]/20 p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#CEF17B] mx-auto mb-3" />
          <p className="text-[#CEEDB2] text-sm">Gerando suas refeições personalizadas...</p>
        </Card>
      )}

      {result && !loading && (
        <Card className="glass-effect border-[#CEF17B]/30 p-5 space-y-4">
          <div className="whitespace-pre-line text-[#CEEDB2] text-sm leading-relaxed">
            {result}
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => generate(mode)}
              variant="outline"
              size="sm"
              className="border-[#CEF17B]/30 text-[#CEF17B] hover:bg-[#CEF17B]/10 flex-1"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar novamente
            </Button>
            {mode === "ingredients" && (
              <Button
                onClick={() => { setResult(null); setIngredients(""); }}
                variant="outline"
                size="sm"
                className="border-white/20 text-white/60 hover:bg-white/5"
              >
                Limpar
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}