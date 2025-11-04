import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Target, Flame, Heart, Brain,
  ArrowLeft, Check, Plus, Calendar, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Challenges() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
            <p className="text-[#CEEDB2] mt-1">Supere seus limites e ganhe recompensas!</p>
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