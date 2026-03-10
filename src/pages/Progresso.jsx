import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, startOfWeek, differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Calendar, Dumbbell, Flame } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import RankCard, { getRankByXP } from "../components/evolucao/RankCard";
import ChallengeCard from "../components/evolucao/ChallengeCard";
import LevelUpModal from "../components/evolucao/LevelUpModal";
import AchievementsGrid from "../components/progress/AchievementsGrid";
import { WorkoutsModal, CaloriesModal, StreakModal } from "../components/progress/StatsModals";
import { ALL_CHALLENGES, getChallengesForUser } from "../components/evolucao/challengesData";

// ── XP Actions ───────────────────────────────────────────────
const XP_ACTIONS = { workout: 15, meal: 5, water: 10, login: 3 };

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
  const [levelUpRank, setLevelUpRank] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const p = await base44.entities.UserProfile.filter({ user_email: user.email });
      return p[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: userPoints, refetch: refetchPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const pts = await base44.entities.UserPoints.filter({ user_email: user.email });
      return pts[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: userChallenges = [], refetch: refetchChallenges } = useQuery({
    queryKey: ['userChallenges', user?.email],
    queryFn: () => base44.entities.UserChallenge.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
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

  const { data: weekNutrition = [] } = useQuery({
    queryKey: ['weekNutrition', user?.email, weekStart],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({ user_email: user.email });
      return data.filter(d => d.log_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // ── Computed values ──────────────────────────────────────────
  const totalXP = userPoints?.total_points || 0;
  const streak = calculateStreak(allWorkoutLogs);
  const totalCaloriesBurned = allWorkoutLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
  const isActiveToday = allWorkoutLogs.some(l => l.completed_date === today);
  const waterDays = weekNutrition.filter(d => d.water_goal_reached).length;
  const weekWorkouts = allWorkoutLogs.filter(l => l.completed_date >= weekStart);

  const currentRank = getRankByXP(totalXP);
  const userGoal = profile?.goal || null;

  // ── Challenge helpers ─────────────────────────────────────────
  const activeChallenges = userChallenges.filter(uc => uc.status === "active");
  const activeChallengeIds = activeChallenges.map(uc => uc.challenge_id);

  // Cooldown: completed within 7 days (or 30 for monthly)
  const completedRecentIds = userChallenges
    .filter(uc => {
      if (uc.status !== "completed") return false;
      const completedDate = uc.start_date;
      if (!completedDate) return false;
      const ch = ALL_CHALLENGES.find(c => c.id === uc.challenge_id);
      const cooldown = ch?.monthlyLimit ? 30 : (ch?.cooldownDays || 7);
      return differenceInDays(new Date(), new Date(completedDate)) < cooldown;
    })
    .map(uc => uc.challenge_id);

  const availableChallenges = getChallengesForUser(userGoal, currentRank.key, activeChallengeIds, completedRecentIds);

  // Progress per active challenge (rough estimate from streak/workouts)
  function getChallengeProgress(challengeId) {
    const ch = ALL_CHALLENGES.find(c => c.id === challengeId);
    if (!ch) return 0;
    if (ch.unit === "treinos") return allWorkoutLogs.length;
    if (ch.unit === "dias") return streak;
    return 0;
  }

  // ── Handlers ─────────────────────────────────────────────────
  async function handleStartChallenge(challenge) {
    if (activeChallenges.length >= 3) {
      alert("Você já tem 3 desafios ativos. Conclua um antes de iniciar outro.");
      return;
    }
    await base44.entities.UserChallenge.create({
      user_email: user.email,
      challenge_id: challenge.id,
      challenge_title: challenge.title,
      start_date: today,
      current_day: 1,
      total_days: challenge.target,
      status: "active",
      points_earned: 0,
    });
    refetchChallenges();
  }

  async function handleCompleteChallenge(challenge) {
    const uc = userChallenges.find(u => u.challenge_id === challenge.id && u.status === "active");
    if (!uc) return;

    const prevRank = getRankByXP(totalXP);

    // Complete the challenge
    await base44.entities.UserChallenge.update(uc.id, {
      status: "completed",
      points_earned: challenge.xp,
    });

    // Add XP to UserPoints
    if (userPoints) {
      const newTotal = totalXP + challenge.xp;
      await base44.entities.UserPoints.update(userPoints.id, { total_points: newTotal });

      const newRank = getRankByXP(newTotal);
      if (newRank.key !== prevRank.key) {
        setLevelUpRank(newRank);
      }
    } else {
      await base44.entities.UserPoints.create({
        user_email: user.email,
        total_points: challenge.xp,
        rank: currentRank.key,
      });
    }

    refetchChallenges();
    refetchPoints();
    queryClient.invalidateQueries(['userPoints']);
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Central de Evolução</h1>
          <p className="text-[#CEEDB2] text-sm mt-1">Desafios reais. Ranking de verdade.</p>
        </div>

        {/* Rank Card */}
        <RankCard
          totalXP={totalXP}
          streak={streak}
          totalWorkouts={allWorkoutLogs.length}
          totalCalories={totalCaloriesBurned}
          isActiveToday={isActiveToday}
        />

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

        {/* Tabs: Desafios / Conquistas / Objetivo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Tabs defaultValue="challenges">
            <TabsList className="w-full bg-white/5 border border-white/10 rounded-2xl p-1 mb-4">
              <TabsTrigger value="challenges" className="flex-1 rounded-xl text-xs data-[state=active]:bg-[#CEF17B] data-[state=active]:text-black text-white/60 font-semibold">
                🎯 Desafios
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex-1 rounded-xl text-xs data-[state=active]:bg-[#CEF17B] data-[state=active]:text-black text-white/60 font-semibold">
                🏆 Conquistas
              </TabsTrigger>
              <TabsTrigger value="goal" className="flex-1 rounded-xl text-xs data-[state=active]:bg-[#CEF17B] data-[state=active]:text-black text-white/60 font-semibold">
                🎖️ Objetivo
              </TabsTrigger>
            </TabsList>

            {/* ── DESAFIOS ─────────────────────────────────────────────── */}
            <TabsContent value="challenges" className="space-y-4">
              {/* Active challenges */}
              {activeChallenges.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <h4 className="text-white font-bold text-sm">Em Andamento ({activeChallenges.length}/3)</h4>
                  </div>
                  <div className="space-y-3">
                    {activeChallenges.map(uc => {
                      const ch = ALL_CHALLENGES.find(c => c.id === uc.challenge_id);
                      if (!ch) return null;
                      const prog = getChallengeProgress(ch.id);
                      return (
                        <ChallengeCard
                          key={uc.id}
                          challenge={ch}
                          isActive={true}
                          progress={prog}
                          onComplete={handleCompleteChallenge}
                          onStart={() => {}}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available challenges by difficulty */}
              {["easy", "medium", "hard", "extreme"].map(diff => {
                const diffChallenges = availableChallenges.filter(c => c.difficulty === diff && !c.isActive);
                if (diffChallenges.length === 0) return null;
                const diffLabels = { easy: "🟢 Fácil", medium: "🔵 Médio", hard: "🔴 Difícil", extreme: "🟣 Extremo" };
                return (
                  <div key={diff}>
                    <h4 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">{diffLabels[diff]}</h4>
                    <div className="space-y-3">
                      {diffChallenges.map(ch => (
                        <ChallengeCard
                          key={ch.id}
                          challenge={ch}
                          isActive={false}
                          isLocked={ch.locked}
                          onStart={handleStartChallenge}
                          onComplete={() => {}}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* XP info */}
              <div className="glass-effect border border-[#CEF17B]/10 rounded-2xl p-4 mt-2">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">XP por ações simples</p>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  {[
                    ["🏋️ Registrar treino", "+15 XP"],
                    ["🥗 Registrar refeição", "+5 XP"],
                    ["💧 Bater meta de água", "+10 XP"],
                    ["📅 Login diário", "+3 XP"],
                  ].map(([label, xp]) => (
                    <div key={label} className="flex justify-between items-center">
                      <span className="text-white/50 text-xs">{label}</span>
                      <span className="text-[#CEF17B] text-xs font-bold">{xp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

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
                  <p className="text-white/50 text-xs uppercase tracking-widest font-bold mb-3">Jornada de Ranking</p>
                  {[
                    { label: "Bronze", icon: "🥉", min: 0, max: 800, color: "bg-orange-400" },
                    { label: "Prata", icon: "🥈", min: 801, max: 2500, color: "bg-gray-300" },
                    { label: "Ouro", icon: "🥇", min: 2501, max: 6000, color: "bg-yellow-400" },
                    { label: "Platina", icon: "💎", min: 6001, max: 12000, color: "bg-cyan-300" },
                    { label: "Diamante", icon: "💠", min: 12001, max: 20000, color: "bg-blue-300" },
                    { label: "Lendário", icon: "👑", min: 20001, max: 99999, color: "bg-purple-400" },
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

      <AnimatePresence>
        {levelUpRank && <LevelUpModal newRank={levelUpRank} onClose={() => setLevelUpRank(null)} />}
      </AnimatePresence>
    </div>
  );
}