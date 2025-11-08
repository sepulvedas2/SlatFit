import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, TrendingDown, Award, Calendar, Flame, 
  Droplet, Dumbbell, Apple, Target, Download, ChevronRight
} from "lucide-react";
import { format, subDays, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

export default function Progress() {
  const [user, setUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week"); // week, month, all

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStart = format(subDays(new Date(), 30), 'yyyy-MM-dd');

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  // Get nutrition data
  const { data: nutritionData = [] } = useQuery({
    queryKey: ['nutritionHistory', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const data = await base44.entities.NutritionData.filter({ user_email: user.email });
      return data.sort((a, b) => new Date(b.log_date) - new Date(a.log_date)).slice(0, 30);
    },
    enabled: !!user?.email,
  });

  // Get workouts
  const { data: workouts = [] } = useQuery({
    queryKey: ['workoutHistory', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date)).slice(0, 30);
    },
    enabled: !!user?.email,
  });

  // Get food logs
  const { data: foodLogs = [] } = useQuery({
    queryKey: ['foodHistory', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const logs = await base44.entities.FoodLog.filter({ user_email: user.email });
      return logs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date)).slice(0, 30);
    },
    enabled: !!user?.email,
  });

  // Calculate statistics
  const stats = {
    totalWorkouts: workouts.length,
    totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
    avgConsistency: nutritionData.length > 0 
      ? Math.round(nutritionData.reduce((sum, n) => sum + (n.consistency_score || 0), 0) / nutritionData.length)
      : 0,
    currentStreak: nutritionData.filter(n => n.water_goal_reached).length,
    weightChange: profile?.current_weight && profile?.target_weight 
      ? Math.abs(profile.current_weight - profile.target_weight)
      : 0,
  };

  // Prepare chart data for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
    const dayName = format(subDays(new Date(), 6 - i), 'EEE', { locale: ptBR });
    
    const dayNutrition = nutritionData.find(n => n.log_date === date);
    const dayWorkouts = workouts.filter(w => w.completed_date === date);
    const dayFoods = foodLogs.filter(f => f.log_date === date);
    
    return {
      date: dayName,
      water: dayNutrition?.water_intake_ml || 0,
      calories: dayFoods.reduce((sum, f) => sum + (f.calories || 0), 0),
      workouts: dayWorkouts.length,
      consistency: dayNutrition?.consistency_score || 0,
    };
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">Evolução e Análises</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Meu Progresso
          </h1>
          <p className="text-gray-400 mt-2">
            Acompanhe sua jornada e conquistas
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-effect p-4 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalWorkouts}</p>
                <p className="text-xs text-white/60">Treinos</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-4 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{Math.round(stats.totalCaloriesBurned)}</p>
                <p className="text-xs text-white/60">kcal queimadas</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-4 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.avgConsistency}%</p>
                <p className="text-xs text-white/60">Consistência</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-4 border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
                <p className="text-xs text-white/60">Dias consecutivos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <Card className="glass-effect p-6 border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Evolução Semanal</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedPeriod === "week" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("week")}
                className={selectedPeriod === "week" ? "bg-purple-600" : "border-white/10"}
              >
                7 dias
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod === "month" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("month")}
                className={selectedPeriod === "month" ? "bg-purple-600" : "border-white/10"}
              >
                30 dias
              </Button>
            </div>
          </div>

          {/* Hydration Chart */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-400" />
              Hidratação Diária (ml)
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Area type="monotone" dataKey="water" stroke="#3B82F6" fillOpacity={1} fill="url(#colorWater)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Calories Chart */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Calorias Consumidas (kcal)
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="calories" fill="#F97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Workouts Chart */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-purple-400" />
              Treinos Semanais
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="workouts" fill="#A855F7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weight Progress */}
        {profile && (
          <Card className="glass-effect p-6 border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Progresso de Peso</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{profile.current_weight} kg</p>
                <p className="text-sm text-white/60">Peso atual</p>
              </div>
              <ChevronRight className="w-6 h-6 text-white/40" />
              <div>
                <p className="text-3xl font-bold text-green-400">{profile.target_weight} kg</p>
                <p className="text-sm text-white/60">Meta</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Faltam</span>
                <span className="text-white font-bold">{stats.weightChange} kg</span>
              </div>
            </div>
          </Card>
        )}

        {/* Export Button */}
        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Download className="w-5 h-5 mr-2" />
          Exportar Relatório em PDF
        </Button>

      </div>
    </div>
  );
}