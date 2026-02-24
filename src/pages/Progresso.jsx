import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, startOfWeek } from "date-fns";
import { Trophy, Flame, Zap, Star, Target, Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENT_META = {
  first_workout: { title: "Primeira Conquista", icon: "🏆", desc: "Completou o primeiro treino" },
  streak_7: { title: "7 Dias Seguidos", icon: "🔥", desc: "7 dias consecutivos treinando" },
  streak_30: { title: "30 Dias Forte", icon: "💎", desc: "30 dias consecutivos" },
  "100_workouts": { title: "Centenário", icon: "💯", desc: "100 treinos realizados" },
  "1000_calories": { title: "Queimador", icon: "⚡", desc: "1000 calorias queimadas" },
  perfect_week: { title: "Semana Perfeita", icon: "⭐", desc: "Treinou todos os dias da semana" },
  early_bird: { title: "Madrugador", icon: "🌅", desc: "Treinou de manhã cedo" },
  night_owl: { title: "Coruja Noturna", icon: "🦉", desc: "Treinou à noite" },
  protein_king: { title: "Rei da Proteína", icon: "🥩", desc: "Meta de proteína atingida" },
  consistency_master: { title: "Mestre da Consistência", icon: "🎯", desc: "Consistência exemplar" },
};

const RANK_META = {
  bronze: { label: "Bronze", color: "text-orange-400", bg: "bg-orange-400/20" },
  silver: { label: "Prata", color: "text-gray-300", bg: "bg-gray-300/20" },
  gold: { label: "Ouro", color: "text-yellow-400", bg: "bg-yellow-400/20" },
  platinum: { label: "Platina", color: "text-cyan-300", bg: "bg-cyan-300/20" },
  diamond: { label: "Diamante", color: "text-blue-300", bg: "bg-blue-300/20" },
};

export default function Progresso() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const pts = await base44.entities.UserPoints.filter({ user_email: user.email });
      return pts[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allWorkoutLogs = [] } = useQuery({
    queryKey: ['allWorkoutLogs', user?.email],
    queryFn: () => base44.entities.WorkoutLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekWorkouts = [] } = useQuery({
    queryKey: ['weekWorkouts', user?.email, weekStart],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekNutrition = [] } = useQuery({
    queryKey: ['weekNutrition', user?.email, weekStart],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({ user_email: user.email });
      return data.filter(d => d.log_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const calculateStreak = () => {
    if (allWorkoutLogs.length === 0) return 0;
    const sortedDates = [...new Set(allWorkoutLogs.map(log => log.completed_date))].sort().reverse();
    let streak = 0;
    const todayDate = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const logDate = new Date(sortedDates[i]);
      const expected = new Date(todayDate);
      expected.setDate(todayDate.getDate() - i);
      if (logDate.toDateString() === expected.toDateString()) streak++;
      else break;
    }
    return streak;
  };

  const streak = calculateStreak();
  const totalCaloriesBurned = allWorkoutLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  const level = userPoints?.level || 1;
  const xpCurrent = userPoints?.xp_current || 0;
  const xpNext = userPoints?.xp_next_level || 100;
  const xpProgress = Math.round((xpCurrent / xpNext) * 100);
  const rank = userPoints?.rank || 'bronze';
  const rankInfo = RANK_META[rank] || RANK_META.bronze;
  const waterDays = weekNutrition.filter(d => d.water_goal_reached).length;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Progresso</h1>
          <p className="text-[#CEEDB2] text-sm mt-1">Acompanhe sua evolução</p>
        </div>

        {/* Level & XP */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#CEF17B]/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-[#CEF17B]">{level}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Nível {level}</p>
                  <Badge className={`${rankInfo.bg} ${rankInfo.color} border-0 text-xs`}>
                    {rankInfo.label}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#CEF17B] font-bold text-lg">{userPoints?.total_points || 0}</p>
                <p className="text-[#CEEDB2] text-xs">pontos totais</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#CEEDB2]">
                <span>XP: {xpCurrent}</span>
                <span>Próximo nível: {xpNext}</span>
              </div>
              <Progress value={xpProgress} className="h-2 bg-white/10 [&>div]:bg-[#CEF17B]" />
            </div>
          </Card>
        </motion.div>

        {/* Streak + Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-3 gap-3">
            <Card className="glass-effect border-[#CEF17B]/20 p-4 text-center">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <p className="text-2xl font-black text-white">{streak}</p>
              <p className="text-[#CEEDB2] text-xs">dias seguidos</p>
            </Card>
            <Card className="glass-effect border-[#CEF17B]/20 p-4 text-center">
              <Dumbbell className="w-6 h-6 text-[#CEF17B] mx-auto mb-1" />
              <p className="text-2xl font-black text-white">{allWorkoutLogs.length}</p>
              <p className="text-[#CEEDB2] text-xs">treinos feitos</p>
            </Card>
            <Card className="glass-effect border-[#CEF17B]/20 p-4 text-center">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
              <p className="text-2xl font-black text-white">{Math.round(totalCaloriesBurned / 1000)}k</p>
              <p className="text-[#CEEDB2] text-xs">kcal queimadas</p>
            </Card>
          </div>
        </motion.div>

        {/* Esta Semana */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="text-white font-bold">Esta Semana</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#CEEDB2]">Treinos</span>
                  <span className="text-white font-semibold">{weekWorkouts.length}/6</span>
                </div>
                <Progress value={(weekWorkouts.length / 6) * 100} className="h-2 bg-white/10 [&>div]:bg-[#CEF17B]" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#CEEDB2]">Hidratação</span>
                  <span className="text-white font-semibold">{waterDays}/7 dias</span>
                </div>
                <Progress value={(waterDays / 7) * 100} className="h-2 bg-white/10 [&>div]:bg-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Conquistas */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-white font-bold">Conquistas</h3>
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs ml-auto">
                {achievements.length} desbloqueadas
              </Badge>
            </div>

            {achievements.length === 0 ? (
              <div className="text-center py-6">
                <Star className="w-10 h-10 text-[#CEEDB2]/30 mx-auto mb-2" />
                <p className="text-[#CEEDB2] text-sm">Complete treinos para desbloquear conquistas!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((ach, i) => {
                  const meta = ACHIEVEMENT_META[ach.achievement_type] || { icon: "🏅", title: ach.title, desc: ach.description };
                  return (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white/5 rounded-xl">
                      <span className="text-2xl">{meta.icon}</span>
                      <div className="min-w-0">
                        <p className="text-white text-xs font-semibold truncate">{meta.title || ach.title}</p>
                        <p className="text-[#CEEDB2] text-[10px] truncate">{meta.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Metas */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="text-white font-bold">Meu Objetivo</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#CEF17B]/10 flex items-center justify-center text-2xl">
                {profile?.goal === 'weight_loss' ? '🔥' : profile?.goal === 'muscle_gain' ? '💪' : '⚖️'}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {profile?.goal === 'weight_loss' ? 'Emagrecimento' : profile?.goal === 'muscle_gain' ? 'Ganho de Massa' : 'Manutenção'}
                </p>
                <p className="text-[#CEEDB2] text-sm">
                  {profile?.fitness_level || 'Iniciante'} · {profile?.training_frequency || 3}x por semana
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}