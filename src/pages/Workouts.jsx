import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Flame, Trophy, ArrowLeft, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import HIITTimer from "../components/workouts/HIITTimer";
import ExerciseBlock from "../components/workouts/ExerciseBlock";
import WorkoutSummary from "../components/workouts/WorkoutSummary";

export default function Workouts() {
  const [user, setUser] = useState(null);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
  });

  const allWorkouts = [
    {
      id: "hiit_emagrecimento",
      title: "HIIT para Emagrecimento",
      description: "Treino intervalado de alta intensidade focado em queima de gordura",
      duration: "25-35 min",
      intensity: "Alta",
      calories: "250-350 kcal",
      type: "hiit",
      blocks: [
      {
        id: 1,
        title: "Bloco 1: Mobilidade do Quadril",
        exercises: [
          { name: "Agachamento livre", reps: "10x", duration: 30 },
          { name: "Polichinelo", reps: "20x", duration: 30 },
          { name: "Flexão de braço (joelho no chão)", reps: "10x", duration: 30 },
          { name: "Prancha baixa", reps: '20"', duration: 20 }
        ]
      },
      {
        id: 2,
        title: "Bloco 2: Flexão de Quadril Deitado",
        exercises: [
          { name: "Agachamento sumô", reps: "10x", duration: 30 },
          { name: "Corrida no colchonete", reps: "20x", duration: 30 },
          { name: "Abdominal curto", reps: "30x", duration: 30 },
          { name: "Passada para trás", reps: "8/8", duration: 30 }
        ]
      },
      {
        id: 3,
        title: "Bloco 3: Mergulho no Chão",
        exercises: [
          { name: "Agachamento lateral", reps: "10/10", duration: 30 },
          { name: "Corrida curta", reps: "20x", duration: 30 },
          { name: "Elevação pélvica", reps: "10x", duration: 30 },
          { name: "Passada à frente", reps: "8/8", duration: 30 }
        ]
      },
      {
        id: 4,
        title: "Bloco 4: Mobilidade Escápula + Rotação",
        exercises: [
          { name: "Agachamento livre", reps: "20x", duration: 30 },
          { name: "Burpee (cadeira ou caixa)", reps: "10x", duration: 30 },
          { name: "Elevação lateral de ombro", reps: "10x", duration: 30 },
          { name: "Prancha alta", reps: '20"', duration: 20 }
        ]
      },
      {
        id: 5,
        title: "Bloco 5: Rotação de Tronco Lateral",
        exercises: [
          { name: "Corrida na cadeira", reps: "30x", duration: 30 },
          { name: "Prancha lateral", reps: "10x", duration: 30 },
          { name: "Corrida curta", reps: "30x", duration: 30 },
          { name: 'Mobilidade "Gato"', reps: '10"', duration: 10 }
        ]
      },
      {
        id: 6,
        title: "Bloco 6: Mobilidade de Quadril Ajoelhado",
        exercises: [
          { name: "Agachamento", reps: "10x", duration: 30 },
          { name: "Corrida com braços à frente", reps: "20x", duration: 30 },
          { name: "Flexão com joelho", reps: "10x", duration: 30 },
          { name: "Abdominal longo", reps: "30x", duration: 30 }
        ]
      }
    ]
    },
    {
      id: "semana2_avancado",
      title: "Semana 2 / Mês 2 — Treinos Avançados",
      description: "Rotina de musculação avançada com foco em hipertrofia e força",
      duration: "45-60 min",
      intensity: "Alta",
      calories: "300-450 kcal",
      type: "musculacao",
      restTime: "30-60 segundos entre séries",
      blocks: [
        {
          id: 1,
          title: "SEGUNDA — Costas e Bíceps",
          day: "Segunda-feira",
          exercises: [
            { name: "Remada baixa", reps: "4x 8-12", duration: 45 },
            { name: "Remada alta", reps: "3x 10-15", duration: 40 },
            { name: "Puxada alta", reps: "3x 8-12", duration: 40 },
            { name: "Bíceps martelo", reps: "3x 10-12", duration: 35 },
            { name: "Bíceps alternado", reps: "3x 12-15", duration: 35 },
            { name: "Bíceps barra reta", reps: "3x 10-12", duration: 35 }
          ]
        },
        {
          id: 2,
          title: "TERÇA — Pernas",
          day: "Terça-feira",
          exercises: [
            { name: "Agachamento livre", reps: "4x 8-12", duration: 50 },
            { name: "Leg press", reps: "3x 10-15", duration: 45 },
            { name: "Cadeira extensora", reps: "3x 10-12", duration: 35 },
            { name: "Cadeira flexora", reps: "3x 10-12", duration: 35 },
            { name: "Agachamento sumo", reps: "3x 10-12", duration: 40 },
            { name: "Panturrilha", reps: "3x 10 (variação)", duration: 30 }
          ]
        },
        {
          id: 3,
          title: "QUARTA — Peito e Tríceps",
          day: "Quarta-feira",
          exercises: [
            { name: "Supino inclinado", reps: "3x 10-15", duration: 45 },
            { name: "Supino reto", reps: "4x 8-12", duration: 50 },
            { name: "Supino no banco", reps: "3x 12-15", duration: 40 },
            { name: "Tríceps corda", reps: "3x 12-15", duration: 35 },
            { name: "Tríceps pulley", reps: "3x 12-15", duration: 35 },
            { name: "Tríceps barra reta", reps: "3x 10-12", duration: 35 }
          ]
        },
        {
          id: 4,
          title: "QUINTA — Pernas",
          day: "Quinta-feira",
          exercises: [
            { name: "Agachamento livre", reps: "4x 8-12", duration: 50 },
            { name: "Leg press", reps: "3x 10-15", duration: 45 },
            { name: "Cadeira extensora", reps: "3x 10-12", duration: 35 },
            { name: "Cadeira flexora", reps: "3x 10-12", duration: 35 },
            { name: "Agachamento sumo", reps: "3x 10-12", duration: 40 },
            { name: "Panturrilha", reps: "3x 10 (variação)", duration: 30 }
          ]
        },
        {
          id: 5,
          title: "SEXTA — Peito e Tríceps",
          day: "Sexta-feira",
          exercises: [
            { name: "Supino inclinado", reps: "3x 10-15", duration: 45 },
            { name: "Supino reto", reps: "4x 8-12", duration: 50 },
            { name: "Supino no banco", reps: "3x 12-15", duration: 40 },
            { name: "Tríceps corda", reps: "3x 12-15", duration: 35 },
            { name: "Tríceps pulley", reps: "3x 12-15", duration: 35 },
            { name: "Tríceps barra reta", reps: "3x 10-12", duration: 35 }
          ]
        },
        {
          id: 6,
          title: "SÁBADO — Costas e Bíceps",
          day: "Sábado",
          exercises: [
            { name: "Remada baixa", reps: "4x 8-12", duration: 45 },
            { name: "Remada alta", reps: "3x 10-15", duration: 40 },
            { name: "Puxada alta", reps: "3x 8-12", duration: 40 },
            { name: "Bíceps martelo", reps: "3x 10-12", duration: 35 },
            { name: "Bíceps alternado", reps: "3x 12-15", duration: 35 },
            { name: "Bíceps barra reta", reps: "3x 10-12", duration: 35 }
          ]
        }
      ]
    }
  ];

  const [selectedWorkout, setSelectedWorkout] = useState(allWorkouts[0]);
  const hiitWorkout = selectedWorkout;

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
      saveWorkoutMutation.mutate({ totalTime, calories: caloriesBurned });
    }
  };

  const handleRestart = () => {
    setWorkoutStarted(false);
    setWorkoutCompleted(false);
    setCurrentBlockIndex(0);
    setSelectedBlockId(null);
    setTotalTime(0);
  };

  const startSelectedBlock = (blockId) => {
    const blockIndex = hiitWorkout.blocks.findIndex(b => b.id === blockId);
    setSelectedBlockId(blockId);
    setCurrentBlockIndex(blockIndex);
    setWorkoutStarted(true);
  };

  if (workoutCompleted) {
    return <WorkoutSummary totalTime={totalTime} blocksCompleted={1} caloriesBurned={Math.round(250 + (totalTime / 60) * 10)} onRestart={handleRestart} />;
  }

  if (workoutStarted) {
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
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
              className="border-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-[#09142D]" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-[#09142D]">HIIT em Progresso</h1>
              <p className="text-[#3B5EED] text-sm">{hiitWorkout.blocks[currentBlockIndex].title}</p>
            </div>
            <Badge className="bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white border-0 px-4 py-2">
              <Flame className="w-4 h-4 mr-1" />
              Alta Intensidade
            </Badge>
          </div>

          <HIITTimer
            block={hiitWorkout.blocks[currentBlockIndex]}
            blockIndex={currentBlockIndex}
            totalBlocks={1}
            onBlockComplete={handleCompleteWorkout}
            onTimeUpdate={setTotalTime}
          />

          <ExerciseBlock block={hiitWorkout.blocks[currentBlockIndex]} exercises={exercises} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#0E9E4D] to-[#59F394] flex items-center justify-center shadow-lg"
          >
            <Flame className="w-10 h-10 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#09142D] mb-2">
              Seus Treinos
            </h1>
            <p className="text-[#3B5EED] text-lg max-w-2xl mx-auto">
              Escolha sua rotina de treino 💪
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-[#0E9E4D]" />
            <span>Clique em qualquer exercício para ver a demonstração animada</span>
          </div>
        </div>

        {/* Workout Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allWorkouts.map((workout, index) => (
            <motion.div
              key={workout.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                onClick={() => setSelectedWorkout(workout)}
                className={`cursor-pointer transition-all duration-300 ${
                  selectedWorkout.id === workout.id
                    ? 'bg-gradient-to-br from-[#0E9E4D]/10 to-[#59F394]/10 border-[#0E9E4D] shadow-lg scale-105'
                    : 'bg-white border-gray-200 hover:border-[#0E9E4D]/30 hover:shadow-md'
                }`}
              >
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-[#09142D]">{workout.title}</h3>
                    {selectedWorkout.id === workout.id && (
                      <Badge className="bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white">
                        Selecionado
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#3B5EED] leading-relaxed">{workout.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-[#0E9E4D]/30 text-[#09142D]">
                      {workout.duration}
                    </Badge>
                    <Badge variant="outline" className="border-[#0E9E4D]/30 text-[#09142D]">
                      {workout.intensity}
                    </Badge>
                    <Badge variant="outline" className="border-[#0E9E4D]/30 text-[#09142D]">
                      {workout.calories}
                    </Badge>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Rest Time Warning for Musculação */}
        {selectedWorkout.type === "musculacao" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <p className="text-[#09142D] font-semibold">Tempo de Descanso Recomendado</p>
                  <p className="text-amber-700 text-sm">
                    Entre as séries: <span className="font-bold">{selectedWorkout.restTime}</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Current Workout Info */}
        <Card className="bg-white border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[#09142D]">{selectedWorkout.title}</h2>
            <Badge className="bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white">
              {selectedWorkout.blocks.length} {selectedWorkout.type === "hiit" ? "blocos" : "dias"}
            </Badge>
          </div>
          <p className="text-[#3B5EED]">{selectedWorkout.description}</p>
        </Card>

        {/* Workout Blocks */}
        <div className="space-y-8">
          {selectedWorkout.blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="mb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0E9E4D] to-[#59F394] flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-xl">{block.id}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#09142D]">{block.title}</h2>
                    <p className="text-sm text-gray-500">
                      {block.exercises.length} exercícios
                      {block.day && <span className="ml-2">• {block.day}</span>}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => startSelectedBlock(block.id)}
                  className="bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar {selectedWorkout.type === "hiit" ? "Bloco" : "Treino"}
                </Button>
              </div>
              
              <ExerciseBlock block={block} exercises={exercises} />
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <Card className="bg-gradient-to-br from-[#0E9E4D]/5 to-[#59F394]/5 border-[#0E9E4D]/20 p-8 rounded-2xl">
          <h3 className="font-bold text-[#09142D] text-xl mb-6 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#0E9E4D]" />
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
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#0E9E4D] to-[#59F394]" />
                <p className="text-[#09142D] text-sm font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Tips */}
        <Card className="bg-white border-gray-200 p-8 rounded-2xl shadow-sm">
          <h3 className="font-bold text-[#09142D] text-xl mb-4">💡 Dicas para o Treino</h3>
          <ul className="space-y-3 text-sm text-[#3B5EED]">
            <li className="flex items-start gap-2">
              <span className="text-[#0E9E4D] font-bold">•</span>
              <span>Mantenha uma garrafa de água por perto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0E9E4D] font-bold">•</span>
              <span>Respeite os intervalos de descanso (10s entre exercícios)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0E9E4D] font-bold">•</span>
              <span>Foque na execução correta dos movimentos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0E9E4D] font-bold">•</span>
              <span>Ajuste a intensidade ao seu condicionamento físico</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0E9E4D] font-bold">•</span>
              <span>Use um tapete ou colchonete para exercícios no chão</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0E9E4D] font-bold">•</span>
              <span>Clique em cada exercício para ver a demonstração visual animada</span>
            </li>
          </ul>
        </Card>

      </div>
    </div>
  );
}