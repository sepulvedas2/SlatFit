import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dumbbell, Clock, Flame, Target } from "lucide-react";

export default function TodayWorkout({ profile, weekWorkouts, todayWorkouts }) {
  // Determinar treino recomendado baseado no perfil
  const getRecommendedWorkout = () => {
    const { goal, fitness_level, activity_level } = profile || {};
    
    if (!goal) return null;

    // Lógica de personalização
    if (goal === "weight_loss") {
      if (fitness_level === "Iniciante") {
        return {
          name: "Cardio Progressivo",
          duration: 30,
          description: "Caminhada intensa ou corrida leve para queimar calorias",
          calories: 250,
          category: "cardio",
          exercises: [
            { name: "Aquecimento", duration: "5 min" },
            { name: "Cardio Principal", duration: "20 min" },
            { name: "Alongamento", duration: "5 min" }
          ]
        };
      } else {
        return {
          name: "HIIT Queima Gordura",
          duration: 25,
          description: "Treino intervalado de alta intensidade",
          calories: 350,
          category: "cardio",
          exercises: [
            { name: "Burpees", reps: "3x10" },
            { name: "Mountain Climbers", reps: "3x20" },
            { name: "Jump Squats", reps: "3x15" }
          ]
        };
      }
    }

    if (goal === "muscle_gain") {
      const dayOfWeek = new Date().getDay();
      const workoutSplit = ["Peito e Tríceps", "Costas e Bíceps", "Pernas", "Ombros e Abdômen", "Full Body"];
      
      return {
        name: workoutSplit[dayOfWeek % workoutSplit.length],
        duration: 60,
        description: "Foco em hipertrofia com volume adequado",
        calories: 300,
        category: "forca",
        exercises: [
          { name: "Exercício composto", reps: "4x8-10" },
          { name: "Exercício isolado 1", reps: "3x12" },
          { name: "Exercício isolado 2", reps: "3x12" }
        ]
      };
    }

    // Manutenção
    return {
      name: "Treino Equilibrado",
      duration: 45,
      description: "Combinação de força e cardio moderado",
      calories: 280,
      category: "full_body",
      exercises: [
        { name: "Aquecimento", duration: "5 min" },
        { name: "Força", duration: "25 min" },
        { name: "Cardio", duration: "15 min" }
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
        <p className="text-[#CEEDB2] text-sm mb-3">{workout.description}</p>
        
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

      <Link to={createPageUrl("Workouts")}>
        <Button className="w-full bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90 font-semibold">
          <Dumbbell className="w-4 h-4 mr-2" />
          {hasCompletedToday ? "Ver Todos os Treinos" : "Começar Treino"}
        </Button>
      </Link>

      <p className="text-center text-xs text-white/50 mt-3">
        {weekWorkouts?.length || 0} treinos esta semana • Continue firme!
      </p>
    </Card>
  );
}