import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Flame, 
  Dumbbell, 
  Droplet,
  ArrowLeft,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

export default function DailySummary() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: todayFoods = [] } = useQuery({
    queryKey: ['todayFoods', user?.email, today],
    queryFn: () => base44.entities.FoodLog.filter({ 
      user_email: user.email, 
      log_date: today 
    }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: todayWorkouts = [] } = useQuery({
    queryKey: ['todayWorkouts', user?.email, today],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ 
        user_email: user.email,
        completed_date: today
      });
      return logs;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', user?.email, today],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.NutritionData.filter({
        user_email: user.email,
        log_date: today
      });
      return data[0] || null;
    },
    enabled: !!user?.email,
  });

  const todayCalories = todayFoods.reduce((sum, food) => sum + (food.calories || 0), 0);
  const calorieTarget = profile?.daily_calorie_target || 2000;
  const calorieProgress = calorieTarget > 0 ? (todayCalories / calorieTarget) * 100 : 0;
  const workoutComplete = todayWorkouts.length > 0;
  const waterGoalReached = nutritionData?.water_goal_reached || false;

  const goals = [
    {
      id: 1,
      title: "Meta Calórica",
      icon: Flame,
      value: todayCalories,
      target: calorieTarget,
      unit: "kcal",
      completed: calorieProgress >= 100,
      progress: Math.min(calorieProgress, 100),
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
      action: "Registrar refeição",
      actionLink: createPageUrl("FoodScanner")
    },
    {
      id: 2,
      title: "Treino do Dia",
      icon: Dumbbell,
      value: todayWorkouts.length,
      target: 1,
      unit: workoutComplete ? "concluído" : "pendente",
      completed: workoutComplete,
      progress: workoutComplete ? 100 : 0,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
      action: "Iniciar treino",
      actionLink: createPageUrl("Workouts")
    },
    {
      id: 3,
      title: "Hidratação",
      icon: Droplet,
      value: nutritionData?.water_intake_ml || 0,
      target: nutritionData?.water_goal_ml || 2000,
      unit: "ml",
      completed: waterGoalReached,
      progress: nutritionData ? Math.min((nutritionData.water_intake_ml / nutritionData.water_goal_ml) * 100, 100) : 0,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20",
      action: "Registrar água",
      actionLink: createPageUrl("SmartNutrition")
    }
  ];

  const completedCount = goals.filter(g => g.completed).length;
  const totalProgress = (completedCount / goals.length) * 100;

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Resumo do Dia</h1>
            <p className="text-[#CEEDB2] text-sm capitalize">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Progresso Geral */}
        <Card className="glass-effect border-[#CEF17B]/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#CEF17B]" />
                Progresso Geral
              </CardTitle>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#CEF17B]" />
                <span className="text-white font-bold">{completedCount}/{goals.length}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={totalProgress} className="h-3 bg-white/10" />
            <p className="text-white/70 text-sm mt-3 text-center">
              {completedCount === goals.length 
                ? "🎉 Todas as metas do dia concluídas! Continue assim!" 
                : `${goals.length - completedCount} meta${goals.length - completedCount > 1 ? 's' : ''} restante${goals.length - completedCount > 1 ? 's' : ''} para completar o dia`
              }
            </p>
          </CardContent>
        </Card>

        {/* Metas Individuais */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            return (
              <Card key={goal.id} className="glass-effect border-[#CEF17B]/20">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${goal.bgColor}`}>
                        <Icon className={`w-5 h-5 ${goal.color}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{goal.title}</h3>
                        <p className="text-white/60 text-sm mt-1">
                          {goal.value} / {goal.target} {goal.unit}
                        </p>
                      </div>
                    </div>
                    {goal.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-[#CEF17B]" />
                    ) : (
                      <Circle className="w-6 h-6 text-white/30" />
                    )}
                  </div>

                  <Progress value={goal.progress} className="h-2 bg-white/10 mb-3" />

                  {!goal.completed && (
                    <Link to={goal.actionLink}>
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-[#084734] to-[#0d6849] text-[#CEF17B] hover:from-[#0d6849] hover:to-[#0f8559] font-semibold border-0"
                      >
                        {goal.action}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mensagem Motivacional */}
        <Card className="glass-effect border-[#CEF17B]/20 bg-gradient-to-br from-[#CEF17B]/10 to-[#CEEDB2]/5">
          <CardContent className="p-5 text-center">
            <p className="text-white/90 text-sm leading-relaxed">
              {completedCount === 0 && "Começar é o primeiro passo. Cada meta concluída te aproxima do seu objetivo!"}
              {completedCount === 1 && "Ótimo começo! Continue mantendo o ritmo e complete as próximas metas."}
              {completedCount === 2 && "Quase lá! Falta apenas uma meta para completar o dia perfeito."}
              {completedCount === 3 && "Dia perfeito! Sua disciplina está moldando seus resultados. 💪"}
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}