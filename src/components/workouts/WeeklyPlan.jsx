import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import ExerciseLogModal from "./ExerciseLogModal";

export default function WeeklyPlan({ weekNumber, dailyWorkouts = [], onStartWorkout, userEmail }) {
  const [logModal, setLogModal] = useState({ open: false, exercise: null, day: null });
  const weekPlans = {
    1: {
      segunda: { muscle: "Peito", exercises: ["Flexão", "Supino", "Crucifixo"] },
      terca: { muscle: "Costas", exercises: ["Remada", "Puxada", "Levantamento terra"] },
      quarta: { muscle: "Bíceps", exercises: ["Rosca direta", "Rosca martelo", "Concentrada"] },
      quinta: { muscle: "Tríceps", exercises: ["Tríceps testa", "Francês", "Mergulho"] },
      sexta: { muscle: "Ombro", exercises: ["Desenvolvimento", "Elevação lateral", "Remada alta"] },
      sabado: { muscle: "Perna", exercises: ["Agachamento", "Leg press", "Panturrilha"] }
    },
    2: {
      segunda: { muscle: "Peito + Tríceps", exercises: ["Supino reto", "Inclinado", "Tríceps corda"] },
      terca: { muscle: "Costas + Bíceps", exercises: ["Barra fixa", "Remada curvada", "Rosca 21"] },
      quarta: { muscle: "Perna", exercises: ["Agachamento livre", "Stiff", "Cadeira extensora"] },
      quinta: { muscle: "Ombro + Abdômen", exercises: ["Arnold press", "Elevações", "Prancha"] },
      sexta: { muscle: "Cardio HIIT", exercises: ["Burpees", "Mountain climbers", "Jumping jacks"] },
      sabado: { muscle: "Full Body", exercises: ["Circuito funcional completo"] }
    },
    3: {
      segunda: { muscle: "Peito Intenso", exercises: ["Drop sets", "Super sets", "Isometria"] },
      terca: { muscle: "Costas Intenso", exercises: ["Remadas pesadas", "Pulley", "Deadlift"] },
      quarta: { muscle: "Perna Pesada", exercises: ["Agachamento 5x5", "Leg press máximo", "Afundo"] },
      quinta: { muscle: "Ombro + Core", exercises: ["Militar", "Laterais pesadas", "Abs pesados"] },
      sexta: { muscle: "Braços Completo", exercises: ["Bíceps + Tríceps super sets"] },
      sabado: { muscle: "Cardio + Mobilidade", exercises: ["HIIT avançado", "Alongamento"] }
    },
    4: {
      segunda: { muscle: "Push (Peito/Ombro/Tríceps)", exercises: ["Compostos + isolados"] },
      terca: { muscle: "Pull (Costas/Bíceps)", exercises: ["Puxadas + Remadas"] },
      quarta: { muscle: "Legs (Perna completa)", exercises: ["Agachamento + acessórios"] },
      quinta: { muscle: "Upper Body", exercises: ["Parte superior completa"] },
      sexta: { muscle: "Lower Body", exercises: ["Parte inferior completa"] },
      sabado: { muscle: "Athletic Performance", exercises: ["Explosão + Resistência"] }
    }
  };

  const currentPlan = weekPlans[weekNumber] || weekPlans[1];
  const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

  const getDayStatus = (day) => {
    const workout = dailyWorkouts.find(w => w.day_of_week === day);
    return workout?.completed || false;
  };

  const muscleIcons = {
    "Peito": "💪",
    "Costas": "🦾",
    "Bíceps": "💪",
    "Tríceps": "💪",
    "Ombro": "🏋️",
    "Perna": "🦵",
    "Cardio": "🔥",
    "Full": "⚡"
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Semana {weekNumber}</h2>
          <p className="text-[#CEEDB2]">Seu plano de treino semanal</p>
        </div>
        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 px-4 py-2">
          {dailyWorkouts.filter(d => d.completed).length}/6 concluídos
        </Badge>
      </div>

      {days.map((day, index) => {
        const dayPlan = currentPlan[day];
        const isCompleted = getDayStatus(day);
        const dayLabel = {
          segunda: "Segunda-feira",
          terca: "Terça-feira",
          quarta: "Quarta-feira",
          quinta: "Quinta-feira",
          sexta: "Sexta-feira",
          sabado: "Sábado"
        }[day];

        const icon = muscleIcons[dayPlan.muscle.split(' ')[0]] || "💪";

        return (
          <motion.div
            key={day}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`glass-effect p-6 transition-all hover:scale-[1.01] ${
              isCompleted ? 'border-green-500/30' : 'border-[#CEF17B]/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500/20' : 'bg-[#CEF17B]/20'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <span className="text-2xl">{icon}</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{dayLabel}</h3>
                      {isCompleted && (
                        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                          Concluído ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#CEF17B] font-semibold mb-2">{dayPlan.muscle}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dayPlan.exercises.map((ex, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogModal({ open: true, exercise: ex, day: day });
                          }}
                          className="text-xs text-[#CEEDB2] bg-white/5 px-2 py-1 rounded-full hover:bg-[#CEF17B]/20 hover:text-[#CEF17B] transition-all flex items-center gap-1"
                        >
                          <ClipboardList className="w-3 h-3" />
                          {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => onStartWorkout(weekNumber, day)}
                  disabled={isCompleted}
                  className={`${
                    isCompleted 
                      ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                      : 'gradient-button text-[#084734] hover:opacity-90'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Feito
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        );
      })}
      {/* Exercise Log Modal */}
      <ExerciseLogModal
        isOpen={logModal.open}
        onClose={() => setLogModal({ open: false, exercise: null, day: null })}
        exerciseName={logModal.exercise}
        userEmail={userEmail}
        weekNumber={weekNumber}
        workoutDay={logModal.day}
      />
    </div>
  );
}