import React from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Zap, Calendar, TrendingUp, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function RunningChallenges({ userEmail, onBack }) {
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['runningChallenges', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return db.RunningChallenge.filter({ 
        user_email: userEmail 
      }, '-start_date');
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['runningActivities', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return db.RunningActivity.filter({ 
        user_email: userEmail 
      }, '-activity_date', 30);
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData) => {
      return db.RunningChallenge.create(challengeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['runningChallenges']);
    }
  });

  const createWeeklyChallenges = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const challengeTemplates = [
      {
        challenge_type: "weekly_distance",
        title: "Corrida de 20km esta semana",
        description: "Complete 20km em corridas esta semana",
        target_value: 20,
        reward_points: 100
      },
      {
        challenge_type: "consistency",
        title: "Corra 3x esta semana",
        description: "Faça pelo menos 3 corridas esta semana",
        target_value: 3,
        reward_points: 75
      },
      {
        challenge_type: "pace_improvement",
        title: "Melhore seu pace médio",
        description: "Alcance um pace médio melhor que sua média",
        target_value: 1,
        reward_points: 150
      }
    ];

    challengeTemplates.forEach(template => {
      createChallengeMutation.mutate({
        user_email: userEmail,
        ...template,
        start_date: today.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0]
      });
    });
  };

  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const getChallengeIcon = (type) => {
    switch(type) {
      case 'weekly_distance': return Target;
      case 'monthly_distance': return Calendar;
      case 'pace_improvement': return TrendingUp;
      case 'consistency': return Zap;
      case 'streak': return Trophy;
      default: return Target;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Desafios</h2>
          <p className="text-[#CEEDB2]">{activeChallenges.length} desafios ativos</p>
        </div>
        <Button
          onClick={createWeeklyChallenges}
          className="gradient-button text-[#084734]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Desafios
        </Button>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-white">Desafios Ativos</h3>
          {activeChallenges.map((challenge) => {
            const Icon = getChallengeIcon(challenge.challenge_type);
            const progress = (challenge.current_value / challenge.target_value) * 100;
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="glass-effect p-6 border-[#CEF17B]/20">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-[#CEF17B]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{challenge.title}</h4>
                      <p className="text-sm text-[#CEEDB2] mb-3">{challenge.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Progresso</span>
                          <span className="text-white font-bold">
                            {challenge.current_value.toFixed(1)} / {challenge.target_value}
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                          <Trophy className="w-3 h-3 mr-1" />
                          {challenge.reward_points} pts
                        </Badge>
                        <span className="text-xs text-white/60">
                          Até {new Date(challenge.end_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-white">Desafios Completados</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {completedChallenges.slice(0, 4).map((challenge) => (
              <Card key={challenge.id} className="glass-effect p-4 border-[#CEF17B]/20">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="font-semibold text-white text-sm">{challenge.title}</p>
                    <p className="text-xs text-[#CEEDB2]">
                      +{challenge.reward_points} pontos
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeChallenges.length === 0 && completedChallenges.length === 0 && (
        <Card className="glass-effect p-12 border-[#CEF17B]/20 text-center">
          <Trophy className="w-16 h-16 text-[#CEF17B]/40 mx-auto mb-4" />
          <p className="text-white/60 mb-4">Nenhum desafio ativo</p>
          <Button
            onClick={createWeeklyChallenges}
            className="gradient-button text-[#084734]"
          >
            Criar Desafios Semanais
          </Button>
        </Card>
      )}

    </div>
  );
}