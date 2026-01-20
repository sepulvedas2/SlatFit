import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, Pause, RotateCcw, Flame, Clock, 
  Target, CheckCircle, Zap, Trophy, ArrowLeft, TrendingUp, Calendar, Dumbbell
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import HIITTimer from "../components/workouts/HIITTimer";
import ExerciseBlock from "../components/workouts/ExerciseBlock";
import WorkoutSummary from "../components/workouts/WorkoutSummary";
import WeeklyPlan from "../components/workouts/WeeklyPlan";
import MyWorkouts from "../components/workouts/MyWorkouts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TodayWorkout from "../components/dashboard/TodayWorkout";
import WorkoutAICoach from "../components/workouts/WorkoutAICoach";

export default function Workouts() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("plan"); // "plan", "hiit", "workout"
  const [activeTab, setActiveTab] = useState("app-workouts");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);
  const [totalTime, setTotalTime] = useState(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: todayWorkouts = [] } = useQuery({
    queryKey: ['todayWorkouts', user?.email],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const logs = await base44.entities.WorkoutLog.filter({ 
        user_email: user.email,
        completed_date: today
      });
      return logs;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekWorkouts } = useQuery({
    queryKey: ['weekWorkouts', user?.email],
    queryFn: async () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStartStr);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // Fetch all exercises from database
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
  });

  // Fetch daily workouts
  const { data: dailyWorkouts = [] } = useQuery({
    queryKey: ['dailyWorkouts', user?.email, selectedWeek],
    queryFn: () => base44.entities.DailyWorkout.filter({ 
      user_email: user.email,
      week_number: selectedWeek 
    }),
    enabled: !!user?.email,
    initialData: [],
  });

  const hiitWorkout = {
    title: "HIIT para Emagrecimento",
    description: "Treino intervalado de alta intensidade focado em queima de gordura",
    duration: "25-35 min",
    intensity: "Alta",
    calories: "250-350 kcal",
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
    
    if (user) {
      saveWorkoutMutation.mutate({
        totalTime,
        calories: caloriesBurned
      });
    }
    
    setWorkoutCompleted(true);
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
    setView("workout");
  };

  const handleStartWorkout = (weekNumber, dayOfWeek) => {
    setView("hiit");
  };

  const completeDayMutation = useMutation({
    mutationFn: async ({ weekNumber, dayOfWeek }) => {
      // Check if already exists
      const existing = dailyWorkouts.find(w => w.day_of_week === dayOfWeek);
      if (existing) {
        return base44.entities.DailyWorkout.update(existing.id, { completed: true, completed_date: new Date().toISOString().split('T')[0] });
      }
      return base44.entities.DailyWorkout.create({
        user_email: user.email,
        week_number: weekNumber,
        day_of_week: dayOfWeek,
        muscle_group: "treino",
        completed: true,
        completed_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dailyWorkouts']);
      queryClient.invalidateQueries(['weekWorkouts']);
    }
  });

  const handleCompleteDay = (weekNumber, dayOfWeek) => {
    if (user) {
      completeDayMutation.mutate({ weekNumber, dayOfWeek });
    }
  };

  const handleBackToPlan = () => {
    setView("plan");
    setWorkoutStarted(false);
  };

  if (workoutCompleted) {
    return (
      <WorkoutSummary
        totalTime={totalTime}
        blocksCompleted={1}
        caloriesBurned={Math.round(250 + (totalTime / 60) * 10)}
        onRestart={handleRestart}
      />
    );
  }

  // Weekly Plan View (Main View)
  if (view === "plan") {
    const weekOptions = [
      { number: 1, title: "Semana 1", subtitle: "Iniciante" },
      { number: 2, title: "Semana 2", subtitle: "Intermediário" },
      { number: 3, title: "Semana 3", subtitle: "Avançado" },
      { number: 4, title: "Semana 4", subtitle: "Expert" }
    ];

    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Treinos</h1>
              <p className="text-[#CEEDB2]">
                Treinos prontos ou crie os seus! 💪
              </p>
            </div>
            <Link to={createPageUrl("WorkoutProgress")}>
              <Button className="gradient-button text-[#084734]">
                <TrendingUp className="w-4 h-4 mr-2" />
                Meu Progresso
              </Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-[#CEF17B]/20">
              <TabsTrigger value="app-workouts" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
                Treinos do App
              </TabsTrigger>
              <TabsTrigger value="my-workouts" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
                Meus Treinos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="app-workouts" className="space-y-6 mt-6">

          {/* Agente de IA - Personal Trainer Inteligente */}
          <WorkoutAICoach 
            profile={profile}
            weekWorkouts={weekWorkouts}
            onStartWorkout={(workoutType) => {
              if (workoutType === 'hiit') {
                setActiveView('hiit');
              } else {
                setActiveView('weekly');
              }
            }}
          />

          {/* Week Selector */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekOptions.map((week) => (
              <Card 
                key={week.number}
                onClick={() => setSelectedWeek(week.number)}
                className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedWeek === week.number 
                    ? 'glass-effect border-[#CEF17B] ring-2 ring-[#CEF17B]' 
                    : 'glass-effect border-[#CEF17B]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedWeek === week.number ? 'bg-[#CEF17B]/30' : 'bg-[#CEF17B]/10'
                  }`}>
                    <span className="text-[#CEF17B] font-bold">{week.number}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{week.title}</h3>
                    <p className="text-xs text-[#CEEDB2]">{week.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* HIIT Quick Access */}
          <Card className="glass-effect border-[#CEF17B]/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Treino HIIT Rápido</h3>
                  <p className="text-xs text-[#CEEDB2]">Alta intensidade • Queima de gordura</p>
                </div>
              </div>
              <Button 
                onClick={() => setView("hiit")}
                size="sm"
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Flame className="w-4 h-4 mr-1" />
                HIIT
              </Button>
            </div>
          </Card>

          <WeeklyPlan 
            weekNumber={selectedWeek}
            dailyWorkouts={dailyWorkouts}
            onStartWorkout={handleStartWorkout}
            onCompleteDay={handleCompleteDay}
          />

          <Card className="glass-effect border-[#CEF17B]/20 p-4">
            <p className="text-sm text-[#CEEDB2] text-center">
              💡 Clique em cada dia para ver todos os exercícios detalhados
            </p>
          </Card>
            </TabsContent>

            <TabsContent value="my-workouts" className="mt-6">
              <MyWorkouts userEmail={user?.email} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Workout In Progress
  if (workoutStarted && view === "workout") {
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
                  setView("plan");
                }
              }}
              className="glass-effect border-[#CEF17B]/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">HIIT em Progresso</h1>
              <p className="text-[#CEEDB2] text-sm">
                {hiitWorkout.blocks[currentBlockIndex].title}
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
            totalBlocks={1}
            onBlockComplete={handleCompleteWorkout}
            onTimeUpdate={setTotalTime}
          />

          <ExerciseBlock 
            block={hiitWorkout.blocks[currentBlockIndex]} 
            exercises={exercises}
          />

        </div>
      </div>
    );
  }

  // HIIT Selection View
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBackToPlan}
            className="glass-effect border-[#CEF17B]/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Treinos HIIT</h1>
            <p className="text-[#CEEDB2]">
              Escolha qual bloco você quer treinar hoje 💪
            </p>
          </div>
        </div>

        <Card className="glass-effect border-[#CEF17B]/20 p-4">
          <p className="text-white/60 text-sm text-center">
            💡 Clique em qualquer exercício para ver a demonstração
          </p>
        </Card>

        {/* Workout Blocks Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {hiitWorkout.blocks.map((block, index) => (
            <motion.div
              key={block.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-[#CEF17B]/20 p-6 hover:scale-[1.02] transition-all cursor-pointer">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#CEF17B] font-bold text-xl">{block.id}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {block.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#CEEDB2]">
                      <CheckCircle className="w-4 h-4" />
                      <span>{block.exercises.length} exercícios</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {block.exercises.map((exercise, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#CEF17B]" />
                      <span className="text-[#CEEDB2]">{exercise.name}</span>
                      <span className="text-white/60 text-xs ml-auto">{exercise.reps}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => startSelectedBlock(block.id)}
                  className="w-full gradient-button text-[#084734] font-bold"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar Bloco {block.id}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

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
            <li>• Clique em cada exercício para ver a demonstração visual</li>
          </ul>
        </Card>

      </div>
    </div>
  );
}