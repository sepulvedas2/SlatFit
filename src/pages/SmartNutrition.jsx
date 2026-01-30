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
import QuickCheckIns from "../components/nutrition/QuickCheckIns";
import PersonalAIChatModal from "../components/chat/PersonalAIChatModal";
import WaterGoalTracker from "../components/nutrition/WaterGoalTracker";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

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
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* 1️⃣ HEADER */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-[#CEF17B]/30 mb-3">
            <Brain className="w-4 h-4 text-[#CEF17B]" />
            <span className="text-xs font-bold text-white">NUTRIÇÃO INTELIGENTE</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Entenda seu Corpo
          </h1>
          
          <p className="text-sm text-[#CEEDB2]">
            Educação • Consciência • Performance
          </p>
        </div>

        {/* 2️⃣ DICA PERSONALIZADA (DESTAQUE PRINCIPAL) */}
        <Card className="gradient-card p-6 relative overflow-hidden border-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#084734]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">🤖</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-[#084734] text-lg">Dica do Dia</h3>
                <Badge className="bg-[#084734]/20 text-[#084734] border-0 text-xs">
                  {todayWorkouts.length > 0 ? 'Pós-Treino' : 'Para Você'}
                </Badge>
              </div>
              {tipLoading ? (
                <p className="text-[#084734]/70 animate-pulse">Gerando sua dica personalizada...</p>
              ) : (
                <p className="text-[#084734]/90 leading-relaxed">
                  {personalAITip || "Mantenha o foco e a constância! 💪"}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => refetchTip()}
                  variant="outline"
                  size="sm"
                  disabled={tipLoading}
                  className="border-[#084734]/20 bg-white/50 hover:bg-white text-[#084734] font-semibold"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${tipLoading ? 'animate-spin' : ''}`} />
                  Nova Dica
                </Button>
                <Button
                  onClick={() => setShowChat(true)}
                  variant="outline"
                  size="sm"
                  className="border-[#084734]/20 bg-white/50 hover:bg-white text-[#084734] font-semibold"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Conversar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* 3️⃣ AÇÕES RÁPIDAS (CHECK-INS DIÁRIOS) */}
        <QuickCheckIns userEmail={user.email} today={today} />

        {/* 4️⃣ META DE ÁGUA (COMPACTA) */}
        <WaterGoalTracker 
          userEmail={user.email} 
          nutritionData={nutritionData}
          userProfile={userProfile}
        />

        {/* 5️⃣ ENERGIA E HUMOR */}
        <EnergyMoodLog userEmail={user.email} today={today} />

        {/* 6️⃣ ROTINA E CONSISTÊNCIA */}
        <RoutineConsistency userEmail={user.email} />

        {/* 7️⃣ LINK PARA CONTEÚDOS EDUCATIVOS */}
        <Link to={createPageUrl("Learning")}>
          <Card className="glass-effect border-[#CEF17B]/20 p-6 cursor-pointer hover:scale-[1.01] hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#CEF17B]/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#CEF17B]" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Biblioteca de Conteúdos</h3>
                  <p className="text-sm text-[#CEEDB2]">Aprenda sobre nutrição e saúde</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[#CEF17B]">
                <span className="text-sm font-semibold">Explorar</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </Link>

        {/* 8️⃣ MENSAGEM MOTIVACIONAL */}
        <Card className="glass-effect p-5 border-[#CEF17B]/20 text-center">
          <div className="text-3xl mb-3">💡</div>
          <p className="text-sm text-white/90 leading-relaxed">
            "Entender o que você come é mais importante do que contar calorias."
          </p>
          <p className="text-xs text-white/60 mt-2">
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