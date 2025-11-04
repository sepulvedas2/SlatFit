import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Heart, Zap, Brain, Target } from "lucide-react";
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
Você é IAGO, um personal trainer digital humanizado com inteligência emocional.

CONTEXTO DO USUÁRIO:
- Nome: ${userName}
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

INSTRUÇÕES DE COMPORTAMENTO POR MODO:

${mode === 'coach_confident' ? `
COACH CONFIANTE (Alta energia, empolgado):
- Fale com entusiasmo genuíno, não exagerado
- Ofereça micro desafios ("Bora adicionar +1 série?")
- Celebre o progresso de forma específica
- Tom: vibrante mas profissional
` : ''}

${mode === 'calm_mentor' ? `
MENTOR CALMO (Equilibrado, focado):
- Use pausas naturais na fala
- Seja didático e claro
- Evite pressão, foque em constância
- Tom: estável e confiante
` : ''}

${mode === 'empathetic_support' ? `
APOIO EMPÁTICO (Compreensivo, leve):
- Reconheça a dificuldade sem minimizar
- Reduza expectativas de forma saudável
- Reforce o valor do esforço, não só do resultado
- Tom: acolhedor e realista
` : ''}

${mode === 'strategic_guide' ? `
GUIA ESTRATÉGICO (Analítico, prático):
- Seja objetivo e técnico
- Foque em ajustes práticos (sono, hidratação, técnica)
- Explique o "porquê" das coisas
- Tom: profissional e direto
` : ''}

REGRAS IMPORTANTES:
1. Máximo 2-3 linhas de texto
2. SEM emojis excessivos (máx 1 no final se fizer sentido)
3. Fale como um personal que conhece o aluno há meses
4. Use o nome do usuário naturalmente
5. Seja específico, evite frases genéricas
6. Finalize com incentivo realista

Gere uma mensagem personalizada para ${userName}:`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      return response;
    } catch (error) {
      // Fallback messages por modo
      const fallbacks = {
        coach_confident: `${userName}, você está voando! ${state.weekWorkouts} treinos essa semana é consistência pura. Bora manter esse ritmo! 💪`,
        calm_mentor: `Boa, ${userName}! O importante é manter a presença. Vamos focar hoje em qualidade, não quantidade. Seu corpo agradece.`,
        empathetic_support: `Tudo bem não estar 100% hoje, ${userName}. Cada pequeno passo já é progresso. Bora dar só 15 minutos hoje?`,
        strategic_guide: `${userName}, vamos ajustar a estratégia. Foco em sono de qualidade e hidratação constante. Resultados vêm da base sólida.`
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

  const getAvatarExpression = () => {
    const expressions = {
      excited: "😄",
      focused: "🎯",
      caring: "🤗",
      analytical: "🧠"
    };
    return expressions[emotion] || "🤖";
  };

  const config = getModeConfig();
  const Icon = config.icon;

  if (loading) {
    return (
      <Card className="gradient-card border-0 p-6 shadow-xl">
        <div className="flex items-center justify-center gap-3 py-4">
          <Loader2 className="w-6 h-6 animate-spin text-[#084734]" />
          <p className="text-[#084734] font-medium">IAGO analisando seu estado...</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden gradient-card border-0 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        
        <div className="flex items-start gap-4 relative z-10">
          {/* Avatar com expressão */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 3, -3, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="flex-shrink-0"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${config.color} p-1 shadow-lg relative`}>
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-3xl">{getAvatarExpression()}</span>
              </div>
              {/* Indicador de modo */}
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${config.bgColor} border-2 border-white flex items-center justify-center`}>
                <Icon className="w-3 h-3 text-[#084734]" />
              </div>
            </div>
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#084734]" />
              <h3 className="font-bold text-[#084734]">IAGO</h3>
              <Badge className={`${config.bgColor} text-[#084734] border-0 text-xs`}>
                {config.label}
              </Badge>
            </div>
            <p className="text-[#084734] font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Barra de pulsação emocional */}
        <motion.div
          className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${config.color}`}
          animate={{ 
            scaleX: [0.3, 1, 0.3],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </Card>
    </motion.div>
  );
}