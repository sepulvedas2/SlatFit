import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Droplet, Clock, Zap, Lightbulb, BookOpen, 
  Brain, TrendingUp, Trophy, MessageCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";
import HydrationTracker from "../components/nutrition/HydrationTracker";
import RoutineConsistency from "../components/nutrition/RoutineConsistency";
import EnergyMoodLog from "../components/nutrition/EnergyMoodLog";
import LearningCards from "../components/nutrition/LearningCards";

export default function SmartNutrition() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const { data: iagoTip, isLoading: iagoLoading } = useQuery({
    queryKey: ['iagoTip', user?.email, today],
    queryFn: async () => {
      try {
        const tip = await base44.integrations.Core.InvokeLLM({
          prompt: `Como IAGO, o personal AI do FitLens, dê UMA dica curta e motivadora sobre nutrição inteligente para hoje.
          
          Seja empático, humano e focado em educação (não em dieta).
          Máximo 2 linhas.
          
          Exemplos:
          - "Beba água antes do treino — pequenos hábitos, grandes resultados."
          - "Seu corpo não precisa de perfeição, ele precisa de constância."
          - "Perceba como você se sente depois de cada refeição. Esse é o melhor feedback."`,
          add_context_from_internet: false
        });
        return tip;
      } catch (error) {
        return "Lembre-se: seu corpo não precisa de perfeição, ele precisa de constância. 💚";
      }
    },
    enabled: !!user?.email,
  });

  const openIAGOChat = () => {
    const event = new CustomEvent('openIAGOChat');
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CEF17B]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <p className="text-white">Erro ao carregar dados do usuário.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 mb-4">
            <Brain className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-300">Nutrição Inteligente</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Entenda seu Corpo
          </h1>
          <p className="text-gray-400 mt-2">
            Educação + Consciência + Performance
          </p>
        </div>

        {/* IAGO Daily Tip */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#CEF17B]/20 to-transparent rounded-full -mr-16 -mt-16" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-white">Dica do IAGO</h3>
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                  Hoje
                </Badge>
              </div>
              {iagoLoading ? (
                <p className="text-[#CEEDB2] text-sm animate-pulse">Pensando...</p>
              ) : (
                <p className="text-[#CEEDB2] leading-relaxed">{iagoTip}</p>
              )}
              <Button
                onClick={openIAGOChat}
                variant="outline"
                size="sm"
                className="mt-3 border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar com IAGO
              </Button>
            </div>
          </div>
        </Card>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <HydrationTracker userEmail={user.email} today={today} />
          <RoutineConsistency userEmail={user.email} />
        </div>

        {/* Energy & Mood Log */}
        <EnergyMoodLog userEmail={user.email} today={today} />

        {/* Learning Section */}
        <LearningCards />

        {/* Quick Stats */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-[#CEF17B]" />
            <h3 className="font-bold text-white">Seu Progresso</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold text-[#CEF17B]">7</p>
              <p className="text-xs text-[#CEEDB2] mt-1">Dias Consistente</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold text-[#CEF17B]">85%</p>
              <p className="text-xs text-[#CEEDB2] mt-1">Score de Rotina</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-2xl font-bold text-[#CEF17B]">12</p>
              <p className="text-xs text-[#CEEDB2] mt-1">Conteúdos Lidos</p>
            </div>
          </div>
        </Card>

        {/* IAGO Message */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <Lightbulb className="w-12 h-12 text-[#CEF17B] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">
            "Entender o que você come é mais importante do que contar calorias."
          </h3>
          <p className="text-sm text-[#CEEDB2]">
            — IAGO, seu personal AI
          </p>
        </Card>

      </div>
    </div>
  );
}