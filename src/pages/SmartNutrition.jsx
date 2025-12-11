import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, Zap, Lightbulb, BookOpen, 
  Brain, TrendingUp, Trophy, MessageCircle, Loader2
} from "lucide-react";
import { format } from "date-fns";
import RoutineConsistency from "../components/nutrition/RoutineConsistency";
import EnergyMoodLog from "../components/nutrition/EnergyMoodLog";
import LearningCards from "../components/nutrition/LearningCards";
import PersonalAIChatModal from "../components/chat/PersonalAIChatModal";
import WaterGoalTracker from "../components/nutrition/WaterGoalTracker";

export default function SmartNutrition() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const queryClient = useQueryClient();

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', user?.email, today],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.NutritionData.filter({
        user_email: user.email,
        log_date: today
      });
      return data[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  // Get daily tip from Seu Personal IA
  const { data: personalAITip, isLoading: tipLoading } = useQuery({
    queryKey: ['personalAITip', user?.email, today],
    queryFn: async () => {
      const tip = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é "Seu Personal IA", o assistente de fitness e nutrição do FitLens. Dê UMA dica curta e prática sobre nutrição inteligente para hoje.
        
        Seja empático, direto e educativo (não prescritivo).
        Máximo 2 linhas.
        Foque em educação nutricional, não em dietas restritivas.
        
        Exemplos:
        - "Escolha sempre cores no seu prato — cada cor traz nutrientes diferentes que seu corpo precisa."
        - "Equilíbrio é a base de tudo. Proteínas constroem, carboidratos sustentam e gorduras boas protegem."
        - "Antes do treino, 300-500ml de água ajudam na performance muscular."`,
        add_context_from_internet: false
      });
      return tip;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    const handleOpen = () => setShowChat(true);
    window.addEventListener('openPersonalAIChat', handleOpen);
    return () => window.removeEventListener('openPersonalAIChat', handleOpen);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CEF17B]" />
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <p className="text-white">Por favor, faça login para acessar esta página.</p>
        </Card>
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

        {/* Seu Personal IA Daily Tip */}
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
                <h3 className="font-bold text-white">Dica do Seu Personal IA</h3>
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                  Hoje
                </Badge>
              </div>
              {tipLoading ? (
                <p className="text-[#CEEDB2] text-sm animate-pulse">Pensando...</p>
              ) : (
                <p className="text-[#CEEDB2] leading-relaxed">{personalAITip || "Mantenha o foco e a constância!"}</p>
              )}
              <Button
                onClick={() => setShowChat(true)}
                variant="outline"
                size="sm"
                className="mt-3 border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Conversar com Seu Personal IA
              </Button>
            </div>
          </div>
        </Card>

        {/* Water Goal Tracker */}
        <WaterGoalTracker userEmail={user.email} nutritionData={nutritionData} />

        {/* Dashboard Cards */}
        <RoutineConsistency userEmail={user.email} />

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
            — Seu Personal IA
          </p>
        </Card>

      </div>

      {/* Personal AI Chat Modal */}
      {showChat && (
        <PersonalAIChatModal
          user={user}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}