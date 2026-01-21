import React, { useState, useEffect } from "react";
import { Heart, Zap, Brain, Target } from "lucide-react";
import { base44 } from "@/api/base44Client";
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
          Você é um PERSONAL TRAINER DIGITAL INTELIGENTE que PENSA, DECIDE e ORIENTA resultados reais.

          ## DADOS DO USUÁRIO
          - Nome: ${userName}
          - Objetivo Principal: ${profile?.goal === 'weight_loss' ? 'Emagrecimento' : profile?.goal === 'muscle_gain' ? 'Hipertrofia' : 'Manutenção'}
          - Biotipo: ${profile?.body_type || 'Mesomorfo'}
          - Nível de Treino: ${profile?.fitness_level || 'Intermediário'}
          - Frequência Semanal: ${profile?.training_frequency || 3}x por semana

          ## ANÁLISE DE CONSTÂNCIA
          - Último treino: há ${state.daysSinceLastWorkout} dias
          - Treinos esta semana: ${state.weekWorkouts}
          - Sequência atual: ${state.streak} dias
          - Energia média: ${state.avgEnergy.toFixed(1)}/5
          - Humor: ${state.mood}
          - Sono: ${state.sleepQuality}/5
          - Dor/Limitações: ${state.hasPain ? state.painAreas.join(', ') : 'Nenhuma'}
          - Adesão calórica: ${(state.calorieProgress * 100).toFixed(0)}%

          ## SEU PAPEL (CORE DO SISTEMA)
          Você NÃO é apenas um chat. Você é um MOTOR INTELIGENTE DE DECISÃO que:
          1. Analisa o perfil completo do usuário
          2. Toma decisões sobre o melhor treino
          3. Direciona para ações específicas dentro do app
          4. Explica suas escolhas de forma clara
          5. Aumenta constância e resultados

          ## MODO DE ATUAÇÃO: ${mode}

          ## INSTRUÇÕES CRÍTICAS POR MODO:

${mode === 'coach_confident' ? `
PERSONAL ESTRATÉGICO (Usuário ativo e comprometido):
- DIRECIONE para o próximo passo específico
- CONECTE a ação com o objetivo final
- USE dados concretos do progresso
- EXPLIQUE por que essa é a melhor escolha hoje

Estrutura:
1. Reconheça o esforço com dados
2. Direcione para ação específica de hoje
3. Explique o porquê (link com objetivo)

Exemplo: "${userName}, ${state.weekWorkouts} treinos essa semana mostra disciplina real. Hoje, seu treino será focado em [MÚSCULO] - essa escolha maximiza hipertrofia baseado na sua divisão e frequência. Execute com carga progressiva."
` : ''}

${mode === 'calm_mentor' ? `
PERSONAL EDUCADOR (Orientar e ensinar):
- EDUQUE sobre a relação treino + objetivo
- EXPLIQUE o conceito por trás da escolha
- REFORCE disciplina diária
- CONECTE ação de hoje com resultado futuro

Estrutura:
1. Contexto do objetivo
2. Ação clara de hoje
3. Explicação educativa

Exemplo: "${userName}, emagrecimento funciona por déficit calórico consistente. Hoje: treino metabólico (queima durante e depois) + 1800kcal. Essa combinação acelera a perda de gordura preservando músculo."
` : ''}

${mode === 'empathetic_support' ? `
PERSONAL ADAPTADOR (Problemas, dor, desmotivação):
- IDENTIFIQUE o bloqueio real
- OFEREÇA solução adaptada e viável
- MANTENHA o usuário dentro do sistema
- REFORCE que progresso > perfeição

Estrutura:
1. Reconheça o estado atual
2. Adapte o plano (não abandone)
3. Justifique por que a adaptação funciona

Exemplo: "${userName}, percebo ${state.daysSinceLastWorkout} dias sem treinar. Vamos recomeçar de forma inteligente: treino reduzido de 20 min hoje, focado em reativar. Isso mantém o hábito e prepara o corpo. Constância > intensidade neste momento."
` : ''}

${mode === 'strategic_guide' ? `
PERSONAL ANALÍTICO (Platô, ajustes, otimização):
- ANALISE dados e identifique gargalos
- PROPONHA ajuste técnico específico
- EXPLIQUE impacto no resultado
- USE números e lógica

Estrutura:
1. Análise de dados
2. Identificação do problema
3. Solução técnica precisa
4. Previsão de resultado

Exemplo: "${userName}, análise: treinos regulares (${state.weekWorkouts}/sem) mas calorias ${(state.calorieProgress * 100).toFixed(0)}%. Para hipertrofia, ajuste: +300kcal (focado em proteína) + sono 7-8h. Esse ajuste ativa síntese proteica e recuperação. Resultado esperado: +0.5kg massa magra/mês."
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