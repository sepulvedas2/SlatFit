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
      segunda: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino reto 4x8-12",
          "Supino inclinado 3x10-15",
          "Supino banco 3x12-15",
          "Tríceps pulley 3x12-15",
          "Tríceps barra reta 3x10-12",
          "Tríceps corda 3x12-15"
        ] 
      },
      terca: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Remada baixa 4x8-12",
          "Remada alta 3x10-15",
          "Puxada alta 3x8-12",
          "Bíceps barra reta 3x10-12",
          "Bíceps alternado 3x12-15",
          "Bíceps martelo 3x10-12"
        ] 
      },
      quarta: { 
        muscle: "Perna", 
        exercises: [
          "Agachamento 4x8-12",
          "Leg press 3x10-15",
          "Cadeira extensora 3x10-12",
          "Cadeira flexora 3x10-12",
          "Agachamento sumo 3x10-12",
          "Panturrilha 3x12-15"
        ] 
      },
      quinta: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Remada baixa 4x8-12",
          "Remada alta 3x10-15",
          "Puxada alta 3x8-12",
          "Bíceps barra reta 3x10-12",
          "Bíceps alternado 3x12-15",
          "Bíceps martelo 3x10-12"
        ] 
      },
      sexta: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino reto 4x8-12",
          "Supino inclinado 3x10-15",
          "Supino banco 3x12-15",
          "Tríceps pulley 3x12-15",
          "Tríceps barra reta 3x10-12",
          "Tríceps corda 3x12-15"
        ] 
      },
      sabado: { 
        muscle: "Ombro / Abdômen", 
        exercises: [
          "Elevação lateral 3x10-12",
          "Elevação frontal 3x10-12",
          "Rotação de ombro 3x12-15",
          "Prancha 3x30-60s",
          "Abdominal infra 3x12-15",
          "Abdominal reto 3x10-12"
        ] 
      }
    },
    2: {
      segunda: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Remada baixa 4x8-12",
          "Remada alta 3x10-15",
          "Puxada alta 3x8-12",
          "Bíceps martelo 3x10-12",
          "Bíceps alternado 3x12-15",
          "Bíceps barra reta 3x10-12"
        ] 
      },
      terca: { 
        muscle: "Perna", 
        exercises: [
          "Agachamento livre 4x8-12",
          "Leg press 3x10-15",
          "Cadeira extensora 3x10-12",
          "Cadeira flexora 3x10-12",
          "Agachamento sumo 3x10-12",
          "Panturrilha 3x10"
        ] 
      },
      quarta: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino inclinado 3x10-15",
          "Supino reto 4x8-12",
          "Supino banco 3x12-15",
          "Tríceps corda 3x12-15",
          "Tríceps pulley 3x12-15",
          "Tríceps barra reta 3x10-12"
        ] 
      },
      quinta: { 
        muscle: "Perna", 
        exercises: [
          "Agachamento livre 4x8-12",
          "Leg press 3x10-15",
          "Cadeira extensora 3x10-12",
          "Cadeira flexora 3x10-12",
          "Agachamento sumo 3x10-12",
          "Panturrilha 3x10"
        ] 
      },
      sexta: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino inclinado 3x10-15",
          "Supino reto 4x8-12",
          "Supino banco 3x12-15",
          "Tríceps corda 3x12-15",
          "Tríceps pulley 3x12-15",
          "Tríceps barra reta 3x10-12"
        ] 
      },
      sabado: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Remada baixa 4x8-12",
          "Remada alta 3x10-15",
          "Puxada alta 3x8-12",
          "Bíceps martelo 3x10-12",
          "Bíceps alternado 3x12-15",
          "Bíceps barra reta 3x10-12"
        ] 
      }
    },
    3: {
      segunda: { 
        muscle: "Perna / Ombro", 
        exercises: [
          "Leg press 4x10-12",
          "Agachamento livre 3x10-12",
          "Cadeira extensora 3x12-15",
          "Avanço 3x10/10",
          "Cadeira abdutora 3x10-15",
          "Elevação lateral 4x10-12",
          "Elevação frontal 3x10-12",
          "Desenvolvimento máquina 3x10-12"
        ] 
      },
      terca: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino reto 4x8-12",
          "Supino inclinado 4x10-12",
          "Crossover 3x12-15",
          "Tríceps francês 3x10-12",
          "Tríceps corda 3x12-15",
          "Tríceps banco 3x10-12"
        ] 
      },
      quarta: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Puxada frontal 4x8-12",
          "Remada curvada 4x10-12",
          "Remada unilateral 3x10-12",
          "Bíceps Scott 3x10-12",
          "Bíceps concentrado 3x12-15",
          "Bíceps 21 3x7-7-7"
        ] 
      },
      quinta: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino reto 4x8-12",
          "Supino inclinado 4x10-12",
          "Crossover 3x12-15",
          "Tríceps francês 3x10-12",
          "Tríceps corda 3x12-15",
          "Tríceps banco 3x10-12"
        ] 
      },
      sexta: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Puxada frontal 4x8-12",
          "Remada curvada 4x10-12",
          "Remada unilateral 3x10-12",
          "Bíceps Scott 3x10-12",
          "Bíceps concentrado 3x12-15",
          "Bíceps 21 3x7-7-7"
        ] 
      },
      sabado: { 
        muscle: "Perna / Ombro", 
        exercises: [
          "Leg press 4x10-12",
          "Agachamento livre 3x10-12",
          "Cadeira extensora 3x12-15",
          "Avanço 3x10/10",
          "Elevação lateral 4x10-12",
          "Desenvolvimento máquina 3x10-12"
        ] 
      }
    },
    4: {
      segunda: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino reto 5x5",
          "Supino inclinado 4x8-10",
          "Fly máquina 3x12-15",
          "Mergulho paralelas 3x8-12",
          "Tríceps testa 4x10-12",
          "Tríceps kickback 3x12-15"
        ] 
      },
      terca: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Barra fixa 4x6-10",
          "Remada T 4x8-12",
          "Pulldown 3x10-12",
          "Remada máquina 3x12-15",
          "Bíceps barra W 4x10-12",
          "Bíceps cabo 3x12-15"
        ] 
      },
      quarta: { 
        muscle: "Perna / Ombro", 
        exercises: [
          "Agachamento 5x5",
          "Hack squat 4x10-12",
          "Stiff 3x10-12",
          "Leg curl deitado 3x12-15",
          "Desenvolvimento 4x8-12",
          "Arnold press 3x10-12",
          "Face pull 3x15"
        ] 
      },
      quinta: { 
        muscle: "Costas / Bíceps", 
        exercises: [
          "Barra fixa 4x6-10",
          "Remada T 4x8-12",
          "Pulldown 3x10-12",
          "Remada máquina 3x12-15",
          "Bíceps barra W 4x10-12",
          "Bíceps cabo 3x12-15"
        ] 
      },
      sexta: { 
        muscle: "Perna / Ombro", 
        exercises: [
          "Agachamento 5x5",
          "Hack squat 4x10-12",
          "Stiff 3x10-12",
          "Leg curl deitado 3x12-15",
          "Desenvolvimento 4x8-12",
          "Arnold press 3x10-12",
          "Face pull 3x15"
        ] 
      },
      sabado: { 
        muscle: "Peito / Tríceps", 
        exercises: [
          "Supino reto 5x5",
          "Supino inclinado 4x8-10",
          "Fly máquina 3x12-15",
          "Mergulho paralelas 3x8-12",
          "Tríceps testa 4x10-12",
          "Tríceps kickback 3x12-15"
        ] 
      }
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