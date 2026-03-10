import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Target, Flame, Heart, Brain,
  ArrowLeft, Check, Plus, Calendar, Award, Zap, Star, Crown, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Challenges() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const LEVEL_RANKS = [
    { level: 1, name: "Iniciante", xpRequired: 0, xpNext: 100, color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Zap },
    { level: 2, name: "Aprendiz", xpRequired: 100, xpNext: 250, color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Star },
    { level: 3, name: "Praticante", xpRequired: 250, xpNext: 500, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Award },
    { level: 4, name: "Dedicado", xpRequired: 500, xpNext: 1000, color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Flame },
    { level: 5, name: "Expert", xpRequired: 1000, xpNext: 2000, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Trophy },
    { level: 6, name: "Mestre", xpRequired: 2000, xpNext: 3500, color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Crown },
    { level: 7, name: "Elite", xpRequired: 3500, xpNext: 5500, color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Crown },
    { level: 8, name: "Lenda", xpRequired: 5500, xpNext: 8000, color: "bg-pink-500/20 text-pink-400 border-pink-500/30", icon: Crown },
    { level: 9, name: "Titã", xpRequired: 8000, xpNext: 11000, color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", icon: Crown },
    { level: 10, name: "Imortal", xpRequired: 11000, xpNext: 15000, color: "bg-[#CEF17B]/30 text-[#CEF17B] border-[#CEF17B]/30", icon: Crown }
  ];

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allChallenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ is_active: true }),
    initialData: [],
  });

  const { data: userChallenges } = useQuery({
    queryKey: ['userChallenges', user?.email],
    queryFn: () => base44.entities.UserChallenge.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || null;
    },
    enabled: !!user?.email
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challenge) => {
      return base44.entities.UserChallenge.create({
        user_email: user.email,
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        start_date: format(new Date(), 'yyyy-MM-dd'),
        total_days: challenge.duration_days,
        current_day: 1,
        completed_days: [],
        status: "active"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChallenges']);
    },
  });

  const markDayCompleteMutation = useMutation({
    mutationFn: async (userChallenge) => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const completedDays = [...(userChallenge.completed_days || []), today];
      const currentDay = completedDays.length;
      const status = currentDay >= userChallenge.total_days ? "completed" : "active";

      return base44.entities.UserChallenge.update(userChallenge.id, {
        completed_days: completedDays,
        current_day: currentDay + 1,
        status: status,
        points_earned: status === "completed" ? 
          (allChallenges.find(c => c.id === userChallenge.challenge_id)?.points_reward || 0) : 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChallenges']);
    },
  });

  const activeChallenges = userChallenges.filter(c => c.status === "active");
  const completedChallenges = userChallenges.filter(c => c.status === "completed");
  const availableChallenges = allChallenges.filter(
    c => !userChallenges.find(uc => uc.challenge_id === c.id && uc.status === "active")
  );

  const getChallengeIcon = (type) => {
    switch(type) {
      case "workout": return Flame;
      case "nutrition": return Target;
      case "mindset": return Brain;
      case "habit": return Heart;
      default: return Trophy;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "easy": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "hard": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const canMarkToday = (userChallenge) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return !userChallenge.completed_days?.includes(today);
  };

  const totalXP = userPoints?.total_points || 0;
  let currentRank = LEVEL_RANKS[0];
  for (let i = LEVEL_RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_RANKS[i].xpRequired) {
      currentRank = LEVEL_RANKS[i];
      break;
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="glass-effect border-[#CEF17B]/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Desafios FitLens</h1>
            <p className="text-[#CEEDB2] mt-1">Supere seus limites!</p>
          </div>
          <div className="glass-effect px-4 py-2 rounded-full border border-[#CEF17B]/20">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#CEF17B]" />
              <div className="text-right">
                <p className="text-xs text-[#CEEDB2]">Completos</p>
                <p className="font-bold text-white">{completedChallenges.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking System */}
        <Card className="glass-effect border-[#CEF17B]/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#CEF17B]" />
                Sistema de Ranking
              </h2>
              <p className="text-sm text-[#CEEDB2]">Evolua completando desafios e acumulando XP</p>
            </div>
            {userPoints && (
              <Badge className={`${currentRank.color} border px-4 py-2 text-lg`}>
                <Trophy className="w-4 h-4 mr-2" />
                {currentRank.name}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {LEVEL_RANKS.map((rank) => {
              const RankIcon = rank.icon;
              const isCurrentLevel = userPoints && totalXP >= rank.xpRequired && totalXP < rank.xpNext;
              const isUnlocked = userPoints && totalXP >= rank.xpRequired;
              const isLocked = !isUnlocked;

              return (
                <Card 
                  key={rank.level}
                  className={`p-4 transition-all ${
                    isCurrentLevel 
                      ? `${rank.color} border-2 scale-105 shadow-lg` 
                      : isUnlocked
                      ? 'glass-effect border-[#CEF17B]/20 opacity-70'
                      : 'glass-effect border-white/10 opacity-40 grayscale'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-full ${
                      isLocked ? 'bg-white/5' : rank.color
                    } flex items-center justify-center mb-2 border-2 ${
                      isLocked ? 'border-white/10' : 'border-current'
                    }`}>
                      <RankIcon className={`w-6 h-6 ${
                        isLocked ? 'text-white/20' : ''
                      }`} />
                    </div>
                    <p className={`text-xs font-bold mb-1 ${
                      isLocked ? 'text-white/40' : 'text-white'
                    }`}>
                      Nível {rank.level}
                    </p>
                    <p className={`text-sm font-bold mb-2 ${
                      isLocked ? 'text-white/30' : ''
                    }`}>
                      {rank.name}
                    </p>
                    <Badge variant="outline" className={`text-xs ${
                      isLocked 
                        ? 'bg-white/5 border-white/10 text-white/30' 
                        : 'bg-white/10 border-white/20'
                    }`}>
                      {rank.xpRequired} XP
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>

          {userPoints && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-[#CEEDB2]">Seu Progresso</p>
                <p className="text-sm font-bold text-white">
                  {totalXP - currentRank.xpRequired}/{currentRank.xpNext - currentRank.xpRequired} XP
                </p>
              </div>
              <Progress 
                value={((totalXP - currentRank.xpRequired) / (currentRank.xpNext - currentRank.xpRequired)) * 100} 
                className="h-2"
              />
              <p className="text-xs text-white/60 mt-2 text-center">
                Faltam {currentRank.xpNext - totalXP} XP para o próximo nível!
              </p>
            </div>
          )}
        </Card>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#CEF17B]" />
              Desafios Ativos
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {activeChallenges.map((userChallenge) => {
                const challenge = allChallenges.find(c => c.id === userChallenge.challenge_id);
                if (!challenge) return null;

                const Icon = getChallengeIcon(challenge.type);
                const progress = (userChallenge.completed_days?.length || 0) / userChallenge.total_days * 100;
                const daysLeft = userChallenge.total_days - (userChallenge.completed_days?.length || 0);

                return (
                  <Card key={userChallenge.id} className="glass-effect p-6 border-[#CEF17B]/20">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#CEF17B]/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#CEF17B]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{challenge.title}</h3>
                          <p className="text-sm text-[#CEEDB2] mt-1">{challenge.description}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-[#CEEDB2]">Progresso</span>
                          <span className="font-bold text-white">
                            {userChallenge.completed_days?.length || 0}/{userChallenge.total_days} dias
                          </span>
                        </div>
                        <Progress value={progress} className="h-2 bg-white/10" />
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-white/5 border-white/10">
                          <Calendar className="w-3 h-3 mr-1" />
                          {daysLeft} dias restantes
                        </Badge>
                        {canMarkToday(userChallenge) ? (
                          <Button
                            onClick={() => markDayCompleteMutation.mutate(userChallenge)}
                            size="sm"
                            className="gradient-button text-[#084734]"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Marcar Hoje
                          </Button>
                        ) : (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Check className="w-3 h-3 mr-1" />
                            Hoje completo!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Challenges */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#CEF17B]" />
            Desafios Disponíveis
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableChallenges.map((challenge) => {
              const Icon = getChallengeIcon(challenge.type);
              
              return (
                <Card key={challenge.id} className="glass-effect p-6 border-[#CEF17B]/20 hover:scale-105 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-[#CEF17B]/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#CEF17B]" />
                    </div>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty === 'easy' ? 'Fácil' : 
                       challenge.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-white text-lg mb-2">{challenge.title}</h3>
                  <p className="text-sm text-[#CEEDB2] mb-4">{challenge.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-white/5 border-white/10">
                      <Calendar className="w-3 h-3 mr-1" />
                      {challenge.duration_days} dias
                    </Badge>
                    <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                      <Award className="w-3 h-3 mr-1" />
                      +{challenge.points_reward} XP
                    </Badge>
                  </div>

                  <Button
                    onClick={() => joinChallengeMutation.mutate(challenge)}
                    disabled={joinChallengeMutation.isPending}
                    className="w-full gradient-button text-[#084734]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aceitar Desafio
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#CEF17B]" />
              Desafios Completados
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {completedChallenges.map((userChallenge) => {
                const challenge = allChallenges.find(c => c.id === userChallenge.challenge_id);
                if (!challenge) return null;

                const Icon = getChallengeIcon(challenge.type);

                return (
                  <Card key={userChallenge.id} className="glass-effect p-4 border-green-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-sm">{challenge.title}</h4>
                        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs mt-1">
                          <Check className="w-3 h-3 mr-1" />
                          +{challenge.points_reward} XP
                        </Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}