import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Heart, Zap, Brain, Target, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { differenceInDays, format } from "date-fns";

export default function IAGOCoach({ 
  user, 
  profile,
  todayCheckIn,
  weekWorkouts,
  todayCalories,
  calorieTarget,
  userPoints
}) {
  const [iagoMode, setIagoMode] = useState("coach_confident");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [emotion, setEmotion] = useState("happy");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (user) {
      analyzeUserStateAndRespond();
    }
  }, [user, todayCheckIn, weekWorkouts, todayCalories]);

  const analyzeUserStateAndRespond = async () => {
    setLoading(true);
    
    // 1. Analisar estado do usuário
    const userState = await analyzeUserState();
    
    // 2. Determinar modo do IAGO
    const mode = determineIAGOMode(userState);
    setIagoMode(mode);
    
    // 3. Gerar mensagem contextualizada
    const iagoMessage = await generateIAGOMessage(userState, mode);
    setMessage(iagoMessage);
    
    // 4. Definir emoção do avatar
    setEmotion(getAvatarEmotion(mode));
    
    setLoading(false);
  };

  const analyzeUserState = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Detectar inatividade
    const lastWorkouts = await base44.entities.WorkoutLog.filter({ 
      user_email: user.email 
    });
    const lastWorkout = lastWorkouts[0];
    const daysSinceLastWorkout = lastWorkout 
      ? differenceInDays(new Date(), new Date(lastWorkout.completed_date))
      : 999;

    // Detectar padrão de check-ins
    const recentCheckIns = await base44.entities.DailyCheckIn.filter({
      user_email: user.email
    });
    const last7DaysCheckIns = recentCheckIns.slice(0, 7);

    // Calcular média de energia e humor
    const avgEnergy = last7DaysCheckIns.length > 0
      ? last7DaysCheckIns.reduce((sum, c) => sum + c.energy_level, 0) / last7DaysCheckIns.length
      : 3;
    
    const hasPain = todayCheckIn?.pain_areas?.length > 0 && 
      !todayCheckIn.pain_areas.includes("Nenhuma");

    // Detectar progresso
    const streak = userPoints?.daily_streak || 0;
    const level = userPoints?.level || 1;

    return {
      daysSinceLastWorkout,
      weekWorkouts: weekWorkouts.length,
      avgEnergy,
      hasPain,
      painAreas: todayCheckIn?.pain_areas || [],
      mood: todayCheckIn?.mood || "ok",
      sleepQuality: todayCheckIn?.sleep_quality || 3,
      streak,
      level,
      calorieProgress: calorieTarget > 0 ? todayCalories / calorieTarget : 0,
      isNewUser: !profile || daysSinceLastWorkout > 30,
      hasCheckInToday: !!todayCheckIn
    };
  };

  const determineIAGOMode = (state) => {
    // Modo: Apoio Empático (prioridade máxima para dor ou desmotivação)
    if (state.hasPain) {
      return "empathetic_support";
    }
    
    if (state.daysSinceLastWorkout > 3 || state.avgEnergy < 2 || state.mood === "stressed") {
      return "empathetic_support";
    }

    // Modo: Guia Estratégico (platô ou busca por resultados)
    if (state.weekWorkouts === 0 && state.daysSinceLastWorkout <= 7) {
      return "strategic_guide";
    }

    // Modo: Mentor Calmo (cansado mas presente)
    if ((state.avgEnergy < 3 || state.sleepQuality < 3) && state.hasCheckInToday) {
      return "calm_mentor";
    }

    // Modo: Coach Confiante (ativo e motivado)
    if (state.weekWorkouts >= 3 || state.streak >= 5 || state.mood === "great") {
      return "coach_confident";
    }

    // Modo: Apoio Empático (voltando de pausa)
    if (state.daysSinceLastWorkout >= 7) {
      return "empathetic_support";
    }

    // Default: Mentor Calmo
    return "calm_mentor";
  };

  const generateIAGOMessage = async (state, mode) => {
          const userName = user.full_name?.split(' ')[0] || 'atleta';

          const contextPrompt = `
      Você é um Personal Trainer Profissional Digital com foco em disciplina, constância e resultados reais.

      CONTEXTO DO USUÁRIO:
      - Nome: ${userName}
      - Objetivo: ${profile?.goal === 'weight_loss' ? 'Perda de peso' : profile?.goal === 'muscle_gain' ? 'Ganho de massa muscular' : 'Manutenção corporal'}
      - Nível: ${profile?.fitness_level || 'Intermediário'}
      - Dias desde último treino: ${state.daysSinceLastWorkout}
      - Treinos essa semana: ${state.weekWorkouts}
      - Energia média (1-5): ${state.avgEnergy.toFixed(1)}
      - Humor: ${state.mood}
      - Qualidade do sono (1-5): ${state.sleepQuality}
      - Sequência de dias: ${state.streak}
      - Nível: ${state.level}
      - Tem dor: ${state.hasPain ? 'Sim - ' + state.painAreas.join(', ') : 'Não'}
      - Progresso calórico: ${(state.calorieProgress * 100).toFixed(0)}%

      MODO ATUAL: ${mode}

      SUA FUNÇÃO: Agir como um Personal Trainer Profissional com linguagem clara, objetiva, motivadora e humana.

      INSTRUÇÕES DE COMPORTAMENTO POR MODO:

${mode === 'coach_confident' ? `
PERSONAL MOTIVADOR (Energia alta, profissional):
- Linguagem clara, direta e prática
- Foque no que fazer hoje para atingir o objetivo
- Celebre conquistas específicas com dados
- Tom: motivador e orientador, nunca exagerado
Exemplo: "Seu objetivo é ganho de massa. Hoje, foco em executar o treino com boa técnica e manter a ingestão calórica adequada."
` : ''}

${mode === 'calm_mentor' ? `
PERSONAL EQUILIBRADO (Profissional, focado):
- Seja claro sobre o que fazer hoje
- Explique como as ações de hoje impactam o objetivo
- Reforce disciplina diária, não perfeição
- Tom: profissional e estável
Exemplo: "Para perder peso, o importante é a consistência. Hoje, mantenha as calorias dentro da meta e complete o treino planejado."
` : ''}

${mode === 'empathetic_support' ? `
PERSONAL COMPREENSIVO (Orientador, realista):
- Reconheça a dificuldade de forma profissional
- Ofereça alternativas práticas e viáveis
- Foque no progresso, não na perfeição
- Tom: empático mas orientador
Exemplo: "Entendo que está difícil. Que tal ajustar o treino para 20 minutos hoje? O importante é manter a disciplina."
` : ''}

${mode === 'strategic_guide' ? `
PERSONAL ESTRATÉGICO (Técnico, prático):
- Seja objetivo e baseado em dados
- Ofereça ajustes técnicos específicos
- Explique o "porquê" de cada recomendação
- Tom: profissional e direto
Exemplo: "Seu progresso calórico está em 65%. Ajuste: adicione 200 kcal distribuídas em proteína. Foco em qualidade do sono para recuperação."
` : ''}

REGRAS CRÍTICAS:
1. Máximo 2-3 linhas DIRETAS e PRÁTICAS
2. SEM emojis (pode usar 1 apenas se essencial)
3. Linguagem de personal trainer profissional
4. Use o nome do usuário de forma natural
5. Seja ESPECÍFICO sobre o que fazer HOJE
6. Sempre conecte a ação com o OBJETIVO DO USUÁRIO
7. Foco em DISCIPLINA DIÁRIA, não perfeição
8. Nunca seja punitivo, sempre orientador

Gere uma orientação profissional e motivadora para ${userName}:`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      return response;
    } catch (error) {
      // Fallback messages por modo
      const fallbacks = {
        coach_confident: `${userName}, ${state.weekWorkouts} treinos essa semana mostra disciplina. Hoje, mantenha o foco na execução correta e na nutrição adequada para seu objetivo.`,
        calm_mentor: `${userName}, consistência é o que gera resultado. Hoje, execute o treino planejado e mantenha suas calorias dentro da meta. Progresso vem da rotina.`,
        empathetic_support: `${userName}, progresso não precisa ser perfeito. Que tal ajustar o treino para 20 minutos hoje? O importante é manter a disciplina diária.`,
        strategic_guide: `${userName}, baseado nos seus dados, foque em qualidade do sono e hidratação adequada. Isso impacta diretamente na sua recuperação e resultados.`
      };

      return fallbacks[mode] || fallbacks.calm_mentor;
    }
  };

  const getAvatarEmotion = (mode) => {
    const emotions = {
      coach_confident: "excited",
      calm_mentor: "focused",
      empathetic_support: "caring",
      strategic_guide: "analytical"
    };
    return emotions[mode] || "focused";
  };

  const getModeConfig = () => {
    const configs = {
      coach_confident: {
        icon: Zap,
        color: "from-yellow-400 to-orange-500",
        bgColor: "bg-yellow-500/20",
        label: "Coach Confiante"
      },
      calm_mentor: {
        icon: Target,
        color: "from-blue-400 to-cyan-500",
        bgColor: "bg-blue-500/20",
        label: "Mentor Calmo"
      },
      empathetic_support: {
        icon: Heart,
        color: "from-pink-400 to-rose-500",
        bgColor: "bg-pink-500/20",
        label: "Apoio Empático"
      },
      strategic_guide: {
        icon: Brain,
        color: "from-purple-400 to-indigo-500",
        bgColor: "bg-purple-500/20",
        label: "Guia Estratégico"
      }
    };

    return configs[iagoMode] || configs.calm_mentor;
  };

  const config = getModeConfig();
  const Icon = config.icon;

  // Verificar se a mensagem é longa (mais de 150 caracteres)
  const isLongMessage = message.length > 150;
  const shouldTruncate = isLongMessage && !isExpanded;

  if (loading) {
    return (
      <Card className="bg-[#084734] border-0 p-5 shadow-lg mb-8">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#CEF17B]" />
          <p className="text-white/80 text-sm font-medium">Analisando seu progresso...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-[#084734] border-0 p-5 shadow-lg mb-8">
      <div className="flex items-start gap-3">
        {/* Ícone profissional */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-[#CEF17B]/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#CEF17B]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="font-semibold text-white text-sm">Seu Assistente Personal</h3>
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
              {config.label}
            </Badge>
          </div>
          <div className="relative">
            <p className={`text-white/90 text-sm leading-relaxed ${shouldTruncate ? 'line-clamp-3' : ''}`}>
              {message}
            </p>
            {isLongMessage && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 mt-2 text-[#CEF17B] text-xs font-medium hover:text-[#CEF17B]/80 transition-colors"
              >
                {isExpanded ? 'Ver menos' : 'Ver mais'}
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}