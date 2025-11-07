import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Pause, RotateCcw, Flame, Clock, 
  Target, CheckCircle, Zap, Trophy, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HIITTimer from "../components/workouts/HIITTimer";
import ExerciseBlock from "../components/workouts/ExerciseBlock";
import WorkoutSummary from "../components/workouts/WorkoutSummary";

export default function Workouts() {
  const [user, setUser] = useState(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const hiitWorkout = {
    title: "HIIT para Emagrecimento",
    description: "Treino intervalado de alta intensidade focado em queima de gordura",
    duration: "25-35 min",
    intensity: "Alta",
    calories: "250-350 kcal",
    blocks: [
      {
        title: "Bloco 1: Mobilidade do Quadril",
        exercises: [
          { name: "Agachamento livre", reps: "10x", duration: 30 },
          { name: "Polichinelo", reps: "20x", duration: 30 },
          { name: "Flexão de braço (joelho no chão)", reps: "10x", duration: 30 },
          { name: "Prancha baixa", reps: '20"', duration: 20 }
        ]
      },
      {
        title: "Bloco 2: Flexão de Quadril Deitado",
        exercises: [
          { name: "Agachamento sumô", reps: "10x", duration: 30 },
          { name: "Corrida no colchonete", reps: "20x", duration: 30 },
          { name: "Abdominal curto", reps: "30x", duration: 30 },
          { name: "Passada para trás", reps: "8/8", duration: 30 }
        ]
      },
      {
        title: "Bloco 3: Mergulho no Chão",
        exercises: [
          { name: "Agachamento lateral", reps: "10/10", duration: 30 },
          { name: "Corrida curta", reps: "20x", duration: 30 },
          { name: "Elevação pélvica", reps: "10x", duration: 30 },
          { name: "Passada à frente", reps: "8/8", duration: 30 }
        ]
      },
      {
        title: "Bloco 4: Mobilidade Escápula + Rotação",
        exercises: [
          { name: "Agachamento livre", reps: "20x", duration: 30 },
          { name: "Burpee (cadeira ou caixa)", reps: "10x", duration: 30 },
          { name: "Elevação lateral de ombro", reps: "10x", duration: 30 },
          { name: "Prancha alta", reps: '20"', duration: 20 }
        ]
      },
      {
        title: "Bloco 5: Rotação de Tronco Lateral",
        exercises: [
          { name: "Corrida na cadeira", reps: "30x", duration: 30 },
          { name: "Prancha lateral", reps: "10x", duration: 30 },
          { name: "Corrida curta", reps: "30x", duration: 30 },
          { name: 'Mobilidade "Gato"', reps: '10"', duration: 10 }
        ]
      },
      {
        title: "Bloco 6: Mobilidade de Quadril Ajoelhado",
        exercises: [
          { name: "Agachamento", reps: "10x", duration: 30 },
          { name: "Corrida com braços à frente", reps: "20x", duration: 30 },
          { name: "Flexão com joelho", reps: "10x", duration: 30 },
          { name: "Abdominal longo", reps: "30x", duration: 30 }
        ]
      }
    ]
  };

  const saveWorkoutMutation = useMutation({
    mutationFn: async (workoutData) => {
      return base44.entities.WorkoutLog.create({
        user_email: user.email,
        workout_id: "hiit_emagrecimento",
        workout_name: "HIIT para Emagrecimento",
        completed_date: new Date().toISOString().split('T')[0],
        duration_minutes: Math.round(workoutData.totalTime / 60),
        calories_burned: workoutData.calories,
        rating: 5
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['weekWorkouts']);
      
      // Award points
      if (user?.email) {
        base44.entities.UserPoints.filter({ user_email: user.email })
          .then(points => {
            if (points[0]) {
              base44.entities.UserPoints.update(points[0].id, {
                total_points: (points[0].total_points || 0) + 50,
                xp_current: (points[0].xp_current || 0) + 50
              });
            }
          });
      }
    },
  });

  const handleCompleteWorkout = () => {
    const caloriesBurned = Math.round(250 + (totalTime / 60) * 10);
    
    setWorkoutCompleted(true);
    
    if (user) {
      saveWorkoutMutation.mutate({
        totalTime,
        calories: caloriesBurned
      });
    }
  };

  const handleRestart = () => {
    setWorkoutStarted(false);
    setWorkoutCompleted(false);
    setCurrentBlockIndex(0);
    setTotalTime(0);
  };

  if (workoutCompleted) {
    return (
      <WorkoutSummary
        totalTime={totalTime}
        blocksCompleted={hiitWorkout.blocks.length}
        caloriesBurned={Math.round(250 + (totalTime / 60) * 10)}
        onRestart={handleRestart}
      />
    );
  }

  if (workoutStarted) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (window.confirm("Deseja sair do treino? Seu progresso será perdido.")) {
                  handleRestart();
                }
              }}
              className="glass-effect border-[#CEF17B]/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">HIIT em Progresso</h1>
              <p className="text-[#CEEDB2] text-sm">
                Bloco {currentBlockIndex + 1} de {hiitWorkout.blocks.length}
              </p>
            </div>
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 px-4 py-2">
              <Flame className="w-4 h-4 mr-1" />
              Alta Intensidade
            </Badge>
          </div>

          <HIITTimer
            block={hiitWorkout.blocks[currentBlockIndex]}
            blockIndex={currentBlockIndex}
            totalBlocks={hiitWorkout.blocks.length}
            onBlockComplete={() => {
              if (currentBlockIndex < hiitWorkout.blocks.length - 1) {
                setCurrentBlockIndex(currentBlockIndex + 1);
              } else {
                handleCompleteWorkout();
              }
            }}
            onTimeUpdate={setTotalTime}
          />

          <ExerciseBlock block={hiitWorkout.blocks[currentBlockIndex]} />

          {/* Next Block Preview */}
          {currentBlockIndex < hiitWorkout.blocks.length - 1 && (
            <Card className="glass-effect p-4 border-[#CEF17B]/20">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#CEF17B]" />
                <h3 className="text-sm font-semibold text-white">Próximo Bloco</h3>
              </div>
              <p className="text-[#CEEDB2] text-sm">
                {hiitWorkout.blocks[currentBlockIndex + 1].title}
              </p>
            </Card>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center"
          >
            <Flame className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">Treinos</h1>
          <p className="text-[#CEEDB2] text-lg">
            Transforme seu corpo, um treino de cada vez 💪
          </p>
        </div>

        {/* Main Workout Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-[#CEF17B]/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -mr-32 -mt-32" />
            
            <div className="relative z-10 p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {hiitWorkout.title}
                  </h2>
                  <p className="text-[#CEEDB2]">
                    {hiitWorkout.description}
                  </p>
                </div>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-lg px-4 py-2">
                  <Flame className="w-5 h-5 mr-2" />
                  HIIT
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Clock className="w-6 h-6 text-[#CEF17B] mx-auto mb-2" />
                  <p className="text-sm text-white font-semibold">{hiitWorkout.duration}</p>
                  <p className="text-xs text-[#CEEDB2]">Duração</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Target className="w-6 h-6 text-[#CEF17B] mx-auto mb-2" />
                  <p className="text-sm text-white font-semibold">{hiitWorkout.intensity}</p>
                  <p className="text-xs text-[#CEEDB2]">Intensidade</p>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <Flame className="w-6 h-6 text-[#CEF17B] mx-auto mb-2" />
                  <p className="text-sm text-white font-semibold">{hiitWorkout.calories}</p>
                  <p className="text-xs text-[#CEEDB2]">Calorias</p>
                </div>
              </div>

              {/* Workout Blocks Preview */}
              <div className="mb-6">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#CEF17B]" />
                  {hiitWorkout.blocks.length} Blocos de Exercícios
                </h3>
                <div className="space-y-2">
                  {hiitWorkout.blocks.map((block, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#CEF17B]/20 flex items-center justify-center text-[#CEF17B] font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-semibold">{block.title}</p>
                        <p className="text-[#CEEDB2] text-xs">
                          {block.exercises.length} exercícios
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={() => setWorkoutStarted(true)}
                className="w-full h-14 text-lg font-bold gradient-button text-[#084734] hover:opacity-90 transition-all"
              >
                <Play className="w-6 h-6 mr-2" />
                Iniciar Treino HIIT
              </Button>

              <p className="text-center text-xs text-[#CEEDB2] mt-4">
                +50 XP ao completar • Pronto para o desafio?
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Benefits */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#CEF17B]" />
            Benefícios do HIIT
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "🔥 Queima de gordura acelerada",
              "💪 Melhora da resistência cardiovascular",
              "⚡ Acelera o metabolismo por até 48h",
              "🎯 Treino completo em menos tempo",
              "🏃 Melhora da capacidade aeróbica",
              "💪 Preserva massa muscular"
            ].map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#CEF17B]" />
                <p className="text-[#CEEDB2] text-sm">{benefit}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="font-bold text-white mb-3">💡 Dicas para o Treino</h3>
          <ul className="space-y-2 text-sm text-[#CEEDB2]">
            <li>• Mantenha uma garrafa de água por perto</li>
            <li>• Respeite os intervalos de descanso (10s entre exercícios)</li>
            <li>• Foque na execução correta dos movimentos</li>
            <li>• Ajuste a intensidade ao seu condicionamento físico</li>
            <li>• Use um tapete ou colchonete para exercícios no chão</li>
          </ul>
        </Card>

      </div>
    </div>
  );
}