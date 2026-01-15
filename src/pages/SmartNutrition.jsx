import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, Zap, Lightbulb, BookOpen, 
  Brain, TrendingUp, Trophy, MessageCircle, Loader2, RefreshCw
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

  const { data: trainingProfile } = useQuery({
    queryKey: ['trainingProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.TrainingProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: todayWorkouts = [] } = useQuery({
    queryKey: ['todayWorkouts', user?.email, today],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ 
        user_email: user.email,
        completed_date: today
      });
      return logs;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // Get personalized daily tip from Personal IA
  const { data: personalAITip, isLoading: tipLoading, refetch: refetchTip } = useQuery({
    queryKey: ['personalAITip', user?.email, today],
    queryFn: async () => {
      const userContext = {
        objetivo: userProfile?.goal === 'weight_loss' ? 'Emagrecimento' : userProfile?.goal === 'muscle_gain' ? 'Hipertrofia' : 'Manutenção',
        nivel: userProfile?.fitness_level || 'Iniciante',
        aguaHoje: nutritionData?.water_intake_ml || 0,
        metaAgua: nutritionData?.water_goal_ml || 2000,
        treinouHoje: todayWorkouts.length > 0,
        ultimoTreino: todayWorkouts[0]?.workout_name,
        divisaoTreino: trainingProfile?.divisao_treino
      };

      const tip = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o Assistente Personal do FitnessLynx. Gere UMA dica personalizada e prática de nutrição para hoje.

Contexto do usuário:
- Objetivo: ${userContext.objetivo}
- Nível: ${userContext.nivel}
- Treinou hoje: ${userContext.treinouHoje ? 'Sim (' + userContext.ultimoTreino + ')' : 'Não'}
- Água hoje: ${userContext.aguaHoje}ml de ${userContext.metaAgua}ml
- Divisão de treino: ${userContext.divisaoTreino || 'não definida'}

Regras:
- Seja empático, direto e educativo
- Máximo 2 linhas
- Personalize com base no contexto
- Foque em educação nutricional
- Use emoji relevante no início

Exemplo: "💧 Você já bebeu ${userContext.aguaHoje}ml hoje. Tente chegar aos ${userContext.metaAgua}ml até o fim do dia para otimizar a recuperação muscular!"`,
        add_context_from_internet: false
      });
      return tip;
    },
    enabled: !!user?.email && !!userProfile,
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
                <h3 className="font-bold text-white">Dica Personalizada</h3>
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                  {todayWorkouts.length > 0 ? 'Pós-Treino' : 'Hoje'}
                </Badge>
              </div>
              {tipLoading ? (
                <p className="text-[#CEEDB2] text-sm animate-pulse">Gerando dica personalizada...</p>
              ) : (
                <p className="text-[#CEEDB2] leading-relaxed">{personalAITip || "Mantenha o foco e a constância! 💪"}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => refetchTip()}
                  variant="outline"
                  size="sm"
                  disabled={tipLoading}
                  className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${tipLoading ? 'animate-spin' : ''}`} />
                  Nova Dica
                </Button>
                <Button
                  onClick={() => setShowChat(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Water Goal Tracker */}
        <WaterGoalTracker 
          userEmail={user.email} 
          nutritionData={nutritionData}
          userProfile={userProfile}
        />

        {/* Dashboard Cards */}
        <RoutineConsistency userEmail={user.email} />

        {/* Energy & Mood Log */}
        <EnergyMoodLog userEmail={user.email} today={today} />

        {/* Learning Section */}
        <LearningCards />

        {/* Quick Stats */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="font-bold text-white">Seu Progresso</h3>
            </div>
            {todayWorkouts.length > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                Treinou hoje! 🔥
              </Badge>
            )}
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

        {/* Assistente Personal Message */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <Lightbulb className="w-12 h-12 text-[#CEF17B] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">
            "Entender o que você come é mais importante do que contar calorias."
          </h3>
          <p className="text-sm text-[#CEEDB2]">
            — Seu Assistente Personal
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