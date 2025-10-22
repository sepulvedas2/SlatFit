import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Flame, Apple, Target, TrendingUp, Calendar, 
  ChevronRight, Sparkles, Award, Clock
} from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import StatsCard from "../components/dashboard/StatsCard";
import MacroChart from "../components/dashboard/MacroChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [user, setUser] = useState(null);

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

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: todayFoods } = useQuery({
    queryKey: ['todayFoods', user?.email, today],
    queryFn: () => base44.entities.FoodLog.filter({ 
      user_email: user.email, 
      log_date: today 
    }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekWorkouts } = useQuery({
    queryKey: ['weekWorkouts', user?.email],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const todayCalories = todayFoods.reduce((sum, food) => sum + (food.calories || 0), 0);
  const todayProtein = todayFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
  const todayCarbs = todayFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
  const todayFats = todayFoods.reduce((sum, food) => sum + (food.fats || 0), 0);

  const calorieTarget = profile?.daily_calorie_target || 2000;
  const calorieProgress = (todayCalories / calorieTarget) * 100;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Olá, {user?.full_name?.split(' ')[0] || 'Atleta'}! 👋
            </h1>
            <p className="text-gray-400 mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-full border border-orange-500/30">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-300">Sequência: {weekWorkouts.length} dias</span>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Calorias Hoje"
            value={Math.round(todayCalories)}
            target={calorieTarget}
            icon={Flame}
            color="from-orange-500 to-red-500"
            suffix="kcal"
          />
          <StatsCard
            title="Proteína"
            value={Math.round(todayProtein)}
            target={profile?.protein_target || 150}
            icon={Apple}
            color="from-green-500 to-emerald-500"
            suffix="g"
          />
          <StatsCard
            title="Treinos/Semana"
            value={weekWorkouts.length}
            target={5}
            icon={Target}
            color="from-purple-500 to-pink-500"
            suffix=""
          />
          <StatsCard
            title="Progresso"
            value={profile?.current_weight || 0}
            target={profile?.target_weight || 0}
            icon={TrendingUp}
            color="from-blue-500 to-cyan-500"
            suffix="kg"
          />
        </div>

        {/* Main Chart */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Macros de Hoje</h2>
            <div className="text-sm text-gray-400">
              {Math.round(calorieProgress)}% da meta
            </div>
          </div>
          <MacroChart 
            protein={todayProtein}
            carbs={todayCarbs}
            fats={todayFats}
            proteinTarget={profile?.protein_target}
            carbsTarget={profile?.carbs_target}
            fatsTarget={profile?.fats_target}
          />
        </Card>

        {/* Recent Activity */}
        <RecentActivity 
          recentFoods={todayFoods.slice(0, 3)}
          recentWorkouts={weekWorkouts.slice(0, 3)}
        />

        {/* Motivational Card */}
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Award className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Você está no caminho certo!</h3>
              <p className="text-sm text-gray-300">
                Continue assim e você alcançará seu objetivo em aproximadamente {
                  Math.abs(((profile?.target_weight || 0) - (profile?.current_weight || 0)) * 7).toFixed(0)
                } dias.
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}