import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Calendar, Dumbbell, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AchievementsGrid from "../components/progress/AchievementsGrid";
import { WorkoutsModal, CaloriesModal, StreakModal } from "../components/progress/StatsModals";

function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;
  const sorted = [...new Set(logs.map(l => l.completed_date))].sort().reverse();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const d = new Date(sorted[i]);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (d.toDateString() === expected.toDateString()) streak++;
    else break;
  }
  return streak;
}

export default function Progresso() {
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const p = await db.UserProfile.filter({ user_email: user.email });
      return p[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: async () => {
      const progress = await db.UserProgress.filter({ user_email: user.email });
      return progress[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: globalProgress = [] } = useQuery({
    queryKey: ['globalUserProgress'],
    queryFn: () => db.UserProgress.list('-total_xp', 200),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: userChallenges = [] } = useQuery({
    queryKey: ['userChallenges', user?.email],
    queryFn: () => db.UserChallenge.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => db.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allWorkoutLogs = [] } = useQuery({
    queryKey: ['allWorkoutLogs', user?.email],
    queryFn: () => db.WorkoutLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekNutrition = [] } = useQuery({
    queryKey: ['weekNutrition', user?.email, weekStart],
    queryFn: async () => {
      const data = await db.NutritionData.filter({ user_email: user.email });
      return data.filter(d => d.log_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // ── Computed values ──────────────────────────────────────────
  const totalXP = userProgress?.total_xp || 0;
  const streak = calculateStreak(allWorkoutLogs);
  const totalCaloriesBurned = allWorkoutLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
  const isActiveToday = allWorkoutLogs.some(l => l.completed_date === today);
  const waterDays = weekNutrition.filter(d => d.water_goal_reached).length;
  const weekWorkouts = allWorkoutLogs.filter(l => l.completed_date >= weekStart);
  const currentUserPosition = globalProgress.findIndex((item) => item.user_email === user?.email) + 1;
  const topRanking = globalProgress.slice(0, 10);
  const userGoal = profile?.goal || null;

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Central de Evolução</h1>
          <p className="text-[#CEEDB2] text-sm mt-1">Desafios reais. Ranking de verdade.</p>
        </div>

        {/* Stats Overview */}
        <Card className="glass-effect border-[#CEF17B]/20 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div onClick={() => setModal("workouts")} className="cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-[#CEF17B]" />
                <span className="text-white/60 text-xs">Treinos</span>
              </div>
              <p className="text-2xl font-bold text-white">{allWorkoutLogs.length}</p>
            </div>
            <div onClick={() => setModal("streak")} className="cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white/60 text-xs">Sequência</span>
              </div>
              <p className="text-2xl font-bold text-white">{streak} dias</p>
            </div>
            <div onClick={() => setModal("calories")} className="cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white/60 text-xs">Calorias</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalCaloriesBurned.toLocaleString()}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-white/60 text-xs">XP Total</span>
              </div>
              <p className="text-2xl font-bold text-white">{totalXP}</p>
            </div>
          </div>
        </Card>

        {/* Ranking Global */}
        <Card className="glass-effect border-[#CEF17B]/20 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Ranking Global</h3>
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
              {currentUserPosition > 0 ? `Sua posição: #${currentUserPosition}` : 'Sem posição'}
            </Badge>
          </div>
          <div className="space-y-2">
            {topRanking.map((entry, index) => {
              const isCurrentUser = entry.user_email === user?.email;
              return (
                <div
                  key={entry.id || entry.user_email}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 ${isCurrentUser ? 'bg-[#CEF17B]/10 border border-[#CEF17B]/20' : 'bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white/10 text-white">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{entry.user_email?.split('@')[0] || 'Usuário'}</p>
                      <p className="text-white/50 text-xs">Nível {entry.nivel || 1}</p>
                    </div>
                  </div>
                  <p className="text-[#CEF17B] font-bold text-sm">{entry.total_xp || 0} XP</p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Esta Semana */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
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
                <Progress value={(weekWorkouts.length / 6) * 100} className="h-2 bg-white/10 [&>div]:bg-[#CEF17B] [&>div]:transition-all [&>div]:duration-1000" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#CEEDB2]">Hidratação</span>
                  <span className="text-white font-semibold">{waterDays}/7 dias</span>
                </div>
                <Progress value={(waterDays / 7) * 100} className="h-2 bg-white/10 [&>div]:bg-blue-400 [&>div]:transition-all [&>div]:duration-1000" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs: Conquistas / Objetivo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Tabs defaultValue="achievements">
            <TabsList className="w-full bg-white/5 border border-white/10 rounded-2xl p-1 mb-4">
              <TabsTrigger value="achievements" className="flex-1 rounded-xl text-xs data-[state=active]:bg-[#CEF17B] data-[state=active]:text-black text-white/60 font-semibold">
                🏆 Conquistas
              </TabsTrigger>
              <TabsTrigger value="goal" className="flex-1 rounded-xl text-xs data-[state=active]:bg-[#CEF17B] data-[state=active]:text-black text-white/60 font-semibold">
                🎖️ Objetivo
              </TabsTrigger>
            </TabsList>

            {/* ── CONQUISTAS ───────────────────────────────────────────── */}
            <TabsContent value="achievements">
              <Card className="glass-effect border-[#CEF17B]/20 p-5">
                <AchievementsGrid achievements={achievements} />
              </Card>
            </TabsContent>

            {/* ── OBJETIVO ─────────────────────────────────────────────── */}
            <TabsContent value="goal">
              <Card className="glass-effect border-[#CEF17B]/20 p-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#CEF17B]" />
                  <h3 className="text-white font-bold">Meu Objetivo</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-white/50 text-xs">Nível atual</p>
                    <p className="text-white font-bold text-lg">{userProgress?.nivel || 1}</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3">
                    <p className="text-white/50 text-xs">Posição no ranking</p>
                    <p className="text-white font-bold text-lg">{currentUserPosition > 0 ? `#${currentUserPosition}` : '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="text-3xl">
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

                {/* Rank Roadmap */}
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-3">Jornada de Nível</p>
                  {[
                    { label: "Bronze", icon: "🥉", min: 0, max: 800 },
                    { label: "Prata", icon: "🥈", min: 801, max: 2500 },
                    { label: "Ouro", icon: "🥇", min: 2501, max: 6000 },
                    { label: "Platina", icon: "💎", min: 6001, max: 12000 },
                    { label: "Diamante", icon: "💠", min: 12001, max: 20000 },
                    { label: "Lendário", icon: "👑", min: 20001, max: 99999 },
                  ].map(r => {
                    const reached = totalXP >= r.min;
                    const active = totalXP >= r.min && totalXP < (r.max + 1);
                    return (
                      <div key={r.label} className={`flex items-center gap-3 py-2 px-3 rounded-xl mb-1 ${active ? "bg-white/10" : ""}`}>
                        <span className={`text-lg ${reached ? "" : "grayscale opacity-30"}`} style={{ filter: reached ? "none" : "grayscale(1)" }}>{r.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-semibold ${reached ? "text-white" : "text-white/30"}`}>{r.label}</span>
                            <span className={`text-xs ${reached ? "text-[#CEF17B]" : "text-white/20"}`}>{r.min.toLocaleString()} XP</span>
                          </div>
                        </div>
                        {reached && !active && <span className="text-green-400 text-xs">✓</span>}
                        {active && <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-[10px]">Atual</Badge>}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

      </div>

      {/* Modais */}
      {modal === "streak" && <StreakModal logs={allWorkoutLogs} onClose={() => setModal(null)} />}
      {modal === "workouts" && <WorkoutsModal logs={allWorkoutLogs} onClose={() => setModal(null)} />}
      {modal === "calories" && <CaloriesModal logs={allWorkoutLogs} onClose={() => setModal(null)} />}
    </div>
  );
}