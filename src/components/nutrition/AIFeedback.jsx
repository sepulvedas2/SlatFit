import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function AIFeedback({ userEmail }) {
  const [showDetail, setShowDetail] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', userEmail, today],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({
        user_email: userEmail,
        log_date: today
      });
      return data[0] || null;
    },
    enabled: !!userEmail,
  });

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['aiFeedback', userEmail, nutritionData?.id],
    queryFn: async () => {
      const mood = nutritionData?.mood || 'ok';
      const energy = nutritionData?.energy_level || 3;
      const hadMeals = [
        nutritionData?.had_breakfast,
        nutritionData?.had_lunch,
        nutritionData?.had_dinner
      ].filter(Boolean).length;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um nutricionista e coach fitness IA. Analise os dados do dia do usuário e dê um feedback curto, empático e acionável.

Dados de hoje:
- Humor: ${mood}
- Energia: ${energy}/5
- Refeições feitas: ${hadMeals}/3

Retorne uma mensagem de 2-3 linhas com:
1. Uma observação sobre o estado atual
2. Uma recomendação prática e simples

Seja motivador, não prescritivo. Foque em hábitos sustentáveis.`,
        add_context_from_internet: false
      });
      
      return response;
    },
    enabled: !!userEmail && !!nutritionData,
  });

  const moodEmoji = {
    great: '😄',
    good: '🙂',
    ok: '😐',
    tired: '😴',
    low: '😔'
  };

  const energyStars = nutritionData?.energy_level || 0;

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -mr-16 -mt-16" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">Resumo do Seu Dia — IA FitLens</h3>
            <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
              Análise Personalizada
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#CEF17B]" />
            <span className="ml-2 text-sm text-[#CEEDB2]">Analisando seus dados...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-[#CEEDB2] mb-1">Humor</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{moodEmoji[nutritionData?.mood] || '😐'}</span>
                  <span className="text-sm text-white capitalize">{nutritionData?.mood || 'ok'}</span>
                </div>
              </div>
              <div className="flex-1 p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-[#CEEDB2] mb-1">Energia</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">
                      {i < energyStars ? '⚡' : '○'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <p className="text-sm text-white leading-relaxed">
                {feedback || "Complete suas informações do dia para receber feedback personalizado."}
              </p>
            </div>

            <Button
              onClick={() => setShowDetail(!showDetail)}
              variant="outline"
              size="sm"
              className="w-full border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
            >
              {showDetail ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Ocultar Dica
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Ver Dica Completa
                </>
              )}
            </Button>

            <AnimatePresence>
              {showDetail && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-[#CEF17B]/10 rounded-xl border border-[#CEF17B]/20">
                    <p className="text-xs text-[#CEEDB2]">
                      💡 Lembre-se: Pequenas mudanças consistentes geram grandes resultados. 
                      Foque em melhorar 1% a cada dia, não em perfeição.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  );
}