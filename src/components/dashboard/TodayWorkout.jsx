import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dumbbell, Clock, Flame, Target } from "lucide-react";

export default function TodayWorkout({ profile, weekWorkouts, todayWorkouts }) {
  // SISTEMA INTELIGENTE DE RECOMENDAÇÃO DE TREINO
  // Baseado em: objetivo, biotipo, nível, frequência, constância
  const getRecommendedWorkout = () => {
    const { goal, fitness_level, body_type, training_frequency } = profile || {};
    
    if (!goal) return null;

    const weekCount = weekWorkouts?.length || 0;
    const isConsistent = weekCount >= (training_frequency || 3);
    const dayOfWeek = new Date().getDay();

    // ========== EMAGRECIMENTO ==========
    if (goal === "weight_loss") {
      // Iniciante: Progressão gradual
      if (fitness_level === "Iniciante") {
        return {
          name: "Cardio Progressivo",
          duration: 30,
          description: "Escolhido para: iniciar adaptação cardiovascular e criar hábito sem sobrecarga",
          rationale: "Emagrecimento em iniciantes funciona melhor com volume moderado e aderência alta",
          calories: 250,
          category: "cardio",
          exercises: [
            { name: "Aquecimento articular", duration: "5 min" },
            { name: "Caminhada rápida ou trote", duration: "20 min" },
            { name: "Alongamento", duration: "5 min" }
          ]
        };
      }
      
      // Intermediário/Avançado: Maximizar queima
      return {
        name: "HIIT Queima Gordura",
        duration: 25,
        description: "Escolhido para: maximizar gasto calórico e efeito pós-treino (EPOC)",
        rationale: "Treino intervalado queima mais calorias e mantém metabolismo elevado por até 24h",
        calories: 350,
        category: "cardio",
        exercises: [
          { name: "Burpees", reps: "3x10" },
          { name: "Mountain Climbers", reps: "3x20" },
          { name: "Jump Squats", reps: "3x15" }
        ]
      };
    }

    // ========== HIPERTROFIA ==========
    if (goal === "muscle_gain") {
      // Definir divisão baseado em frequência
      let split, splitName, description, rationale;
      
      if (training_frequency >= 5) {
        // ABCDE ou Push/Pull/Legs
        split = ["Peito", "Costas", "Pernas", "Ombros", "Braços"];
        splitName = "ABCDE";
        description = "Escolhido para: volume alto com recuperação adequada por grupo muscular";
        rationale = "Frequência de 5x/semana permite trabalhar cada grupo 1x com intensidade máxima";
      } else if (training_frequency >= 4) {
        // ABCD ou Upper/Lower
        split = ["Peito e Tríceps", "Costas e Bíceps", "Pernas Completo", "Ombros e Abdômen"];
        splitName = "ABCD";
        description = "Escolhido para: dividir treinos com volume moderado-alto e boa frequência";
        rationale = "4 treinos semanais permitem trabalhar cada grupo 1-2x com recuperação total";
      } else if (training_frequency >= 3) {
        // ABC
        split = ["Peito e Tríceps", "Costas e Bíceps", "Pernas e Ombros"];
        splitName = "ABC";
        description = "Escolhido para: treino completo 3x na semana com volume adequado";
        rationale = "Divisão ABC é ideal para treinar todos os grupos musculares com 48h de descanso";
      } else {
        // Full Body ou AB
        split = ["Full Body A", "Full Body B"];
        splitName = "AB";
        description = "Escolhido para: estimular todos os músculos mesmo com baixa frequência";
        rationale = "Full Body garante estímulo completo mesmo treinando 2x/semana";
      }
      
      const todayWorkoutName = split[dayOfWeek % split.length];
      
      return {
        name: `${todayWorkoutName} (${splitName})`,
        duration: 60,
        description,
        rationale,
        calories: 300,
        category: "forca",
        exercises: [
          { name: "Exercício composto (base)", reps: "4x6-8" },
          { name: "Exercício acessório 1", reps: "3x10-12" },
          { name: "Exercício isolado", reps: "3x12-15" },
          { name: "Finalizador", reps: "2x15-20" }
        ]
      };
    }

    // ========== MANUTENÇÃO ==========
    return {
      name: "Treino Equilibrado",
      duration: 45,
      description: "Escolhido para: manter forma física e saúde geral",
      rationale: "Combinação de força e cardio preserva massa muscular e capacidade cardiovascular",
      calories: 280,
      category: "full_body",
      exercises: [
        { name: "Aquecimento dinâmico", duration: "5 min" },
        { name: "Força (compostos)", duration: "25 min" },
        { name: "Cardio moderado", duration: "15 min" }
      ]
    };
  };

  const workout = getRecommendedWorkout();
  const hasCompletedToday = todayWorkouts?.length > 0;

  if (!workout) {
    return (
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <p className="text-white/60 text-center">Complete seu perfil para receber treinos personalizados</p>
      </Card>
    );
  }

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-white text-lg mb-1">Treino de Hoje</h3>
          <p className="text-[#CEEDB2] text-sm">
            Personalizado para: {profile?.goal === 'weight_loss' ? 'Perda de Peso' : 
             profile?.goal === 'muscle_gain' ? 'Ganho de Massa' : 'Manutenção'}
          </p>
        </div>
        {hasCompletedToday && (
          <div className="bg-green-500/20 px-3 py-1 rounded-full">
            <span className="text-green-400 text-xs font-semibold">✓ Concluído</span>
          </div>
        )}
      </div>

      <div className="bg-[#CEF17B]/10 rounded-lg p-4 mb-4">
        <h4 className="text-white font-bold text-xl mb-2">{workout.name}</h4>
        <p className="text-[#CEEDB2] text-sm mb-2">{workout.description}</p>
        
        {/* Explicação Inteligente - Por que este treino? */}
        <div className="bg-[#084734]/40 rounded-lg p-3 mb-3 border border-[#CEF17B]/20">
          <p className="text-xs text-[#CEF17B] font-semibold mb-1">💡 Por que este treino?</p>
          <p className="text-white/80 text-xs leading-relaxed">{workout.rationale}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#CEF17B]" />
            <div>
              <p className="text-xs text-white/60">Duração</p>
              <p className="text-white font-semibold text-sm">{workout.duration} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <div>
              <p className="text-xs text-white/60">Calorias</p>
              <p className="text-white font-semibold text-sm">~{workout.calories}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#CEF17B]" />
            <div>
              <p className="text-xs text-white/60">Foco</p>
              <p className="text-white font-semibold text-sm capitalize">{workout.category}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-white/80 font-semibold mb-2">Estrutura:</p>
          {workout.exercises.map((ex, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                <span className="text-[#CEF17B] text-xs font-bold">{idx + 1}</span>
              </div>
              <span className="text-white/90 text-sm">{ex.name}</span>
              <span className="text-[#CEEDB2] text-xs ml-auto">
                {ex.reps || ex.duration}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!hasCompletedToday && (
        <Link to={createPageUrl("Workouts")}>
          <Button className="w-full bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90 font-semibold">
            <Dumbbell className="w-4 h-4 mr-2" />
            Começar Agora
          </Button>
        </Link>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#CEF17B]/20">
        <p className="text-xs text-white/60">
          {weekWorkouts?.length || 0}/{profile?.training_frequency || 3} treinos esta semana
        </p>
        <Link to={createPageUrl("Workouts")}>
          <Button variant="ghost" size="sm" className="text-[#CEF17B] text-xs h-auto p-0">
            Ver todos →
          </Button>
        </Link>
      </div>
    </Card>
  );
}