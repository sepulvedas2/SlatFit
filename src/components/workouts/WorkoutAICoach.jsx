import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Target, TrendingUp, Flame, Dumbbell, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkoutAICoach({ profile, weekWorkouts, onStartWorkout }) {
  const [recommendation, setRecommendation] = useState(null);

  useEffect(() => {
    if (profile) {
      analyzeAndRecommend();
    }
  }, [profile, weekWorkouts]);

  const analyzeAndRecommend = () => {
    const { goal, body_type, fitness_level, training_frequency } = profile;
    
    if (!goal) {
      setRecommendation({
        type: "incomplete_profile",
        message: "Complete seu perfil para receber recomendações personalizadas de treino"
      });
      return;
    }

    const weekCount = weekWorkouts?.length || 0;
    const isConsistent = weekCount >= (training_frequency || 3);

    // ========== LÓGICA DE DECISÃO INTELIGENTE ==========
    
    // OBJETIVO: EMAGRECIMENTO
    if (goal === "weight_loss") {
      if (fitness_level === "Iniciante") {
        setRecommendation({
          type: "hiit_beginner",
          title: "HIIT Iniciante",
          category: "Treino Metabólico",
          icon: Flame,
          color: "from-orange-500 to-red-500",
          bgColor: "bg-orange-500/20",
          reason: "Treino escolhido automaticamente com base no seu perfil",
          explanation: "Para emagrecimento em iniciantes, o HIIT oferece máxima queima calórica em tempo reduzido, acelerando o metabolismo sem sobrecarga articular. Esse treino combina cardio intenso com recuperação ativa.",
          benefits: [
            "Queima até 350 calorias em 25 minutos",
            "Efeito pós-treino (EPOC) de até 24h",
            "Melhora condicionamento cardiovascular",
            "Preserva massa muscular durante emagrecimento"
          ],
          workout_type: "hiit",
          duration: "25-30 min",
          intensity: "Alta",
          focus: "Queima de gordura + Resistência"
        });
      } else {
        setRecommendation({
          type: "hiit_advanced",
          title: "HIIT Avançado",
          category: "Treino Metabólico Intenso",
          icon: Flame,
          color: "from-red-500 to-pink-500",
          bgColor: "bg-red-500/20",
          reason: "Selecionado para maximizar resultados no seu nível",
          explanation: "Com seu nível de condicionamento, este HIIT avançado é o mais eficiente para emagrecimento rápido. Combina exercícios compostos de alta intensidade que recrutam múltiplos grupos musculares, maximizando gasto calórico.",
          benefits: [
            "Queima até 450 calorias em 30 minutos",
            "Acelera metabolismo por até 48h",
            "Treino completo de corpo inteiro",
            "Melhora explosão e potência muscular"
          ],
          workout_type: "hiit",
          duration: "30-35 min",
          intensity: "Muito Alta",
          focus: "Queima extrema + Definição muscular"
        });
      }
      return;
    }

    // OBJETIVO: GANHO DE MASSA MUSCULAR (HIPERTROFIA)
    if (goal === "muscle_gain") {
      let recommendation_data;

      // Análise por frequência semanal
      if (training_frequency >= 5) {
        // ABCDE - Divisão avançada
        recommendation_data = {
          type: "split_5days",
          title: "Divisão ABCDE",
          category: "Treino de Hipertrofia Avançada",
          icon: Dumbbell,
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-500/20",
          reason: "Frequência de 5x/semana permite volume ideal para hipertrofia",
          explanation: "Com 5 treinos semanais, você pode treinar cada grupo muscular isoladamente com volume máximo e recuperação completa. Este método é o mais eficaz para ganho de massa muscular, permitindo sobrecarga progressiva em cada sessão.",
          benefits: [
            "Cada grupo muscular treinado 1x por semana",
            "Volume alto com recuperação de 7 dias",
            "Foco total em cada músculo por treino",
            "Progressão de carga facilitada"
          ],
          workout_type: "muscle_split",
          split: "Peito / Costas / Pernas / Ombros / Braços",
          duration: "60-75 min por treino",
          intensity: "Alta",
          focus: "Hipertrofia máxima + Definição"
        };
      } else if (training_frequency >= 4) {
        // ABCD - Divisão intermediária/avançada
        recommendation_data = {
          type: "split_4days",
          title: "Divisão ABCD",
          category: "Treino de Hipertrofia Eficiente",
          icon: Dumbbell,
          color: "from-indigo-500 to-purple-500",
          bgColor: "bg-indigo-500/20",
          reason: "4 treinos semanais é o ponto ideal para volume e recuperação",
          explanation: "A divisão ABCD permite trabalhar cada grupo muscular com volume adequado 1-2x por semana. É a escolha inteligente para quem busca hipertrofia com boa frequência, combinando eficiência e resultados comprovados.",
          benefits: [
            "Divisão equilibrada de grupos musculares",
            "Recuperação completa entre treinos",
            "Volume moderado-alto por sessão",
            "Compatível com rotina de trabalho"
          ],
          workout_type: "muscle_split",
          split: "Peito+Tríceps / Costas+Bíceps / Pernas / Ombros+Abdômen",
          duration: "55-70 min por treino",
          intensity: "Moderada-Alta",
          focus: "Hipertrofia equilibrada"
        };
      } else if (training_frequency >= 3) {
        // ABC - Divisão clássica
        recommendation_data = {
          type: "split_3days",
          title: "Divisão ABC",
          category: "Treino de Hipertrofia Clássico",
          icon: Dumbbell,
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-500/20",
          reason: "3 treinos semanais permite trabalhar corpo completo com descanso ideal",
          explanation: "O ABC é a divisão mais tradicional e eficaz para hipertrofia com 3 treinos semanais. Garante estímulo completo de todos os grupos musculares com 48-72h de recuperação entre sessões do mesmo grupo.",
          benefits: [
            "Corpo completo treinado por semana",
            "Recuperação de 48-72h entre treinos",
            "Volume adequado por grupo muscular",
            "Método comprovado há décadas"
          ],
          workout_type: "muscle_split",
          split: "Peito+Tríceps / Costas+Bíceps / Pernas+Ombros",
          duration: "50-65 min por treino",
          intensity: "Moderada",
          focus: "Hipertrofia com consistência"
        };
      } else {
        // Full Body ou AB - Para baixa frequência
        recommendation_data = {
          type: "fullbody",
          title: "Full Body AB",
          category: "Treino Completo",
          icon: Activity,
          color: "from-teal-500 to-cyan-500",
          bgColor: "bg-teal-500/20",
          reason: "Com baixa frequência, treino completo garante estímulo de todos os músculos",
          explanation: "Para 2-3 treinos semanais, o Full Body é a escolha inteligente. Estimula todos os grupos musculares em cada sessão, garantindo crescimento mesmo com frequência reduzida. Ideal para quem tem agenda apertada mas quer resultados.",
          benefits: [
            "Todos os músculos treinados por sessão",
            "Flexibilidade de horários",
            "Resultados mesmo com poucos treinos/semana",
            "Exercícios compostos eficientes"
          ],
          workout_type: "fullbody",
          split: "Full Body A / Full Body B",
          duration: "45-60 min por treino",
          intensity: "Moderada",
          focus: "Hipertrofia com praticidade"
        };
      }

      // Ajuste por biotipo
      if (body_type === "ectomorph") {
        recommendation_data.biotipo_adjustment = "Ectomorfo: Foco em carga alta, descanso maior (90-120s), evitar excesso de cardio.";
      } else if (body_type === "endomorph") {
        recommendation_data.biotipo_adjustment = "Endomorfo: Combinar com leve cardio pós-treino, descanso moderado (60-90s), controle calórico.";
      } else {
        recommendation_data.biotipo_adjustment = "Mesomorfo: Equilíbrio entre volume e intensidade, descanso padrão (60-90s).";
      }

      setRecommendation(recommendation_data);
      return;
    }

    // OBJETIVO: MANUTENÇÃO
    setRecommendation({
      type: "maintenance",
      title: "Treino Equilibrado",
      category: "Saúde e Manutenção",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/20",
      reason: "Escolhido para manter sua forma física atual",
      explanation: "Para manutenção, o ideal é combinar treino de força com cardio moderado. Isso preserva massa muscular, mantém metabolismo ativo e saúde cardiovascular, sem exigir progressão agressiva de carga.",
      benefits: [
        "Mantém massa muscular e condicionamento",
        "Flexível e sustentável",
        "Previne lesões e sobrecarga",
        "Compatível com estilo de vida ativo"
      ],
      workout_type: "balanced",
      duration: "40-50 min",
      intensity: "Moderada",
      focus: "Saúde geral + Bem-estar"
    });
  };

  if (!recommendation) {
    return null;
  }

  if (recommendation.type === "incomplete_profile") {
    return (
      <Card className="bg-gradient-to-br from-[#084734] to-[#063528] border-[#CEF17B]/20 p-6 mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-[#CEF17B]" />
          <div>
            <h3 className="text-white font-bold text-lg">Configure seu Perfil</h3>
            <p className="text-white/70 text-sm">{recommendation.message}</p>
          </div>
        </div>
      </Card>
    );
  }

  const Icon = recommendation.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-[#084734] to-[#063528] border-[#CEF17B]/20 p-6 mb-6 overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#CEF17B]/5 rounded-full blur-3xl" />
        
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${recommendation.bgColor} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs mb-1">
                  🧠 Personal Trainer IA
                </Badge>
                <h3 className="text-white font-bold text-xl">{recommendation.title}</h3>
                <p className="text-[#CEF17B] text-sm">{recommendation.category}</p>
              </div>
            </div>
          </div>

          {/* Motivo da escolha */}
          <div className="bg-[#CEF17B]/10 rounded-lg p-3 mb-4 border border-[#CEF17B]/20">
            <p className="text-xs text-[#CEF17B] font-semibold mb-1">💡 Por que este treino?</p>
            <p className="text-white/90 text-sm">{recommendation.reason}</p>
          </div>

          {/* Explicação detalhada */}
          <div className="mb-4">
            <p className="text-white/80 text-sm leading-relaxed">{recommendation.explanation}</p>
          </div>

          {/* Detalhes do treino */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-white/60 text-xs mb-1">Duração</p>
              <p className="text-white font-semibold text-sm">{recommendation.duration}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <p className="text-white/60 text-xs mb-1">Intensidade</p>
              <p className="text-white font-semibold text-sm">{recommendation.intensity}</p>
            </div>
          </div>

          {recommendation.split && (
            <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/10">
              <p className="text-white/60 text-xs mb-1">Divisão do Treino</p>
              <p className="text-white font-semibold text-sm">{recommendation.split}</p>
            </div>
          )}

          {/* Benefícios */}
          <div className="mb-4">
            <p className="text-white font-semibold text-sm mb-2">✅ Benefícios Comprovados:</p>
            <div className="space-y-1.5">
              {recommendation.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-[#CEF17B] mt-1.5 flex-shrink-0" />
                  <p className="text-white/80 text-xs leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ajuste por biotipo */}
          {recommendation.biotipo_adjustment && (
            <div className="bg-[#CEF17B]/5 rounded-lg p-3 mb-4 border border-[#CEF17B]/10">
              <p className="text-[#CEF17B] text-xs font-semibold mb-1">🧬 Ajuste para seu Biotipo</p>
              <p className="text-white/70 text-xs">{recommendation.biotipo_adjustment}</p>
            </div>
          )}

          {/* Foco */}
          <div className="bg-gradient-to-r from-[#CEF17B]/20 to-transparent rounded-lg p-3 mb-4 border-l-4 border-[#CEF17B]">
            <p className="text-white/60 text-xs mb-0.5">Foco Principal</p>
            <p className="text-white font-bold text-sm">{recommendation.focus}</p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={() => onStartWorkout?.(recommendation.workout_type)}
            className="w-full bg-gradient-to-r from-[#CEF17B] to-[#CEEDB2] hover:from-[#CEEDB2] hover:to-[#CEF17B] text-[#084734] font-bold py-6 text-base shadow-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Começar Treino Recomendado
          </Button>

          <p className="text-center text-white/50 text-xs mt-3">
            Treino personalizado baseado no seu perfil e objetivo
          </p>
        </div>
      </Card>
    </motion.div>
  );
}