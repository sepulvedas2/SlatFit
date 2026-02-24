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
  const weight = userProfile?.current_weight ? `${userProfile.current_weight}kg` : "não informado";
  const gender = userProfile?.gender === "male" ? "Masculino" : userProfile?.gender === "female" ? "Feminino" : "não informado";
  const level = userProfile?.fitness_level || "Iniciante";

  function buildPrompt(m) {
    const goalStrategy = userProfile?.goal === "weight_loss"
      ? "Porções moderadas, preparações grelhadas/cozidas/assadas, meta de 300–500 kcal por refeição."
      : userProfile?.goal === "muscle_gain"
      ? "Porções maiores, proteína elevada, combinação proteína + carboidrato, meta de 500–800 kcal por refeição."
      : "Porções equilibradas, refeições variadas.";

    const base = `Você é um agente de nutrição inteligente. Siga EXATAMENTE o formato abaixo. Responda em português brasileiro.

OBJETIVO DO USUÁRIO (lido automaticamente do perfil): ${goal}
Estratégia: ${goalStrategy}
Peso: ${weight} | Sexo: ${gender} | Nível de treino: ${level}

REGRAS OBRIGATÓRIAS:
- Use APENAS os ingredientes informados + sal, alho, cebola, pimenta, azeite como temperos padrão.
- NUNCA invente ou substitua ingredientes.
- Linguagem simples e brasileira. Sem termos técnicos.
- Respostas objetivas e diretas.
- Após cada refeição, calcule automaticamente a estimativa nutricional usando valores médios por 100g.
- Use "~" para indicar estimativa. Mostre APENAS calorias e proteína.
- Indicador visual: 🟢 Alta proteína (>25g) | 🟡 Proteína moderada (15–25g) | 🔴 Proteína baixa (<15g)

FORMATO OBRIGATÓRIO (siga exatamente esta estrutura):

OBJETIVO: [objetivo lido do perfil]

CAFÉ DA MANHÃ
Receita: [nome]
Ingredientes usados: [lista]
Modo de preparo:
1. [passo]
2. [passo]
3. [passo]
Estimativa nutricional:
Calorias: ~XXX kcal
Proteína: ~XX g
[indicador 🟢/🟡/🔴]

ALMOÇO
Receita: [nome]
Ingredientes usados: [lista]
Modo de preparo:
1. [passo]
2. [passo]
3. [passo]
Estimativa nutricional:
Calorias: ~XXX kcal
Proteína: ~XX g
[indicador 🟢/🟡/🔴]

JANTAR
Receita: [nome]
Ingredientes usados: [lista]
Modo de preparo:
1. [passo]
2. [passo]
3. [passo]
Estimativa nutricional:
Calorias: ~XXX kcal
Proteína: ~XX g
[indicador 🟢/🟡/🔴]

JUSTIFICATIVA
[máximo 3 linhas explicando por que as refeições ajudam no objetivo do usuário]`;

    if (m === "ingredients") {
      return `${base}\n\nIngredientes disponíveis informados pelo usuário: ${ingredients || "arroz, feijão, ovo, frango"}`;
    }
    return `${base}\n\nUse ingredientes brasileiros acessíveis e comuns (arroz, feijão, frango, ovo, legumes, frutas, aveia, etc).`;
  }

  async function generate(m) {
    setLoading(true);
    setResult(null);
    setMode(m);
    const res = await base44.integrations.Core.InvokeLLM({ prompt: buildPrompt(m) });
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