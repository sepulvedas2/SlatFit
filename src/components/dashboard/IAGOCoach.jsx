import React, { useState, useEffect } from "react";
import { Heart, Zap, Brain, Target } from "lucide-react";
import { api } from "@/api/client";
import * as ai from "@/api/ai";
import { differenceInDays, format } from "date-fns";
import AIAssistantCard from "./AIAssistantCard";

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
    
    setLoading(false);
  };

  const analyzeUserState = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Detectar inatividade
    const lastWorkouts = await api.entities.WorkoutLog.filter({ 
      user_id: user.id 
    });
    const lastWorkout = lastWorkouts[0];
    const daysSinceLastWorkout = lastWorkout 
      ? differenceInDays(new Date(), new Date(lastWorkout.completed_date))
      : 999;

    // Detectar padrão de check-ins
    const recentCheckIns = await api.entities.DailyCheckIn.filter({
      user_id: user.id
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
    // REGRA CRÍTICA: Se treinou hoje, sempre modo positivo
    const hasWorkoutToday = weekWorkouts.some(w => {
      const workoutDate = format(new Date(w.completed_date), 'yyyy-MM-dd');
      const todayDate = format(new Date(), 'yyyy-MM-dd');
      return workoutDate === todayDate;
    });

    if (hasWorkoutToday) {
      return "coach_confident"; // Sempre parabenizar quem treinou hoje
    }

    // Modo: Apoio Empático (prioridade para dor ou desmotivação)
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

    try {
      const response = await ai.coachMessage({
        mode,
        userName,
        profile: {
          goal: profile?.goal,
          body_type: profile?.body_type,
          fitness_level: profile?.fitness_level,
          training_frequency: profile?.training_frequency,
        },
        state,
      });

      return response;
    } catch (error) {
      // Fallback messages inteligentes por modo
      const objective = profile?.goal === 'weight_loss' ? 'emagrecimento' : profile?.goal === 'muscle_gain' ? 'hipertrofia' : 'manutenção';

      const fallbacks = {
        coach_confident: `${userName}, seu objetivo é ${objective}. Hoje: execute o treino direcionado com foco em técnica e mantenha as calorias dentro da meta. Essa disciplina diária é o que gera resultados reais.`,
        calm_mentor: `${userName}, para ${objective}, o importante é consistência. Hoje: complete o treino planejado e mantenha nutrição adequada. Cada dia conta para o resultado final.`,
        empathetic_support: `${userName}, vamos recomeçar de forma inteligente. Que tal um treino adaptado de 20 minutos hoje? Isso mantém o hábito ativo e prepara para retomar o ritmo. Constância importa mais que intensidade agora.`,
        strategic_guide: `${userName}, análise: ${state.weekWorkouts} treinos/semana, adesão calórica ${(state.calorieProgress * 100).toFixed(0)}%. Para otimizar ${objective}, foque em sono de qualidade (7-8h) e hidratação (2L+). Isso acelera recuperação e resultados.`
      };

      return fallbacks[mode] || fallbacks.calm_mentor;
    }
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

  return (
    <AIAssistantCard
      message={message}
      modeLabel={config.label}
      loading={loading}
      icon={Icon}
    />
  );
}