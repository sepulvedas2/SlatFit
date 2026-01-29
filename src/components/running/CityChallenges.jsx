import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Users, Target, Calendar, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CityChallenges({ userEmail, userCity }) {
  const queryClient = useQueryClient();

  const { data: challenges = [] } = useQuery({
    queryKey: ['cityChallenges', userCity],
    queryFn: async () => {
      if (!userCity) return [];
      return base44.entities.CityChallenge.filter({ 
        city: userCity,
        status: 'active'
      });
    },
    enabled: !!userCity,
    initialData: [],
  });

  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId) => {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;
      
      const updatedParticipants = [...(challenge.participants || [])];
      if (!updatedParticipants.includes(userEmail)) {
        updatedParticipants.push(userEmail);
        return base44.entities.CityChallenge.update(challengeId, {
          participants: updatedParticipants
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cityChallenges']);
    }
  });

  const createWeeklyCityChallenge = async () => {
    if (!userCity) return;
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    await base44.entities.CityChallenge.create({
      city: userCity,
      challenge_title: `Desafio Semanal - ${userCity}`,
      challenge_type: "weekly_distance",
      target_value: 500,
      start_date: today.toISOString().split('T')[0],
      end_date: nextWeek.toISOString().split('T')[0],
      reward_description: "Todos que completarem ganham badge exclusivo!",
      participants: [userEmail]
    });

    queryClient.invalidateQueries(['cityChallenges']);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Desafios da Cidade</h2>
        {challenges.length === 0 && (
          <Button
            onClick={createWeeklyCityChallenge}
            size="sm"
            className="bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90"
          >
            Criar Desafio
          </Button>
        )}
      </div>

      {challenges.length === 0 ? (
        <Card className="glass-effect border-[#CEF17B]/20 p-8 text-center">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Nenhum desafio ativo em {userCity}</p>
          <p className="text-white/40 text-xs mt-1">Crie o primeiro e convide sua comunidade!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge, index) => {
            const progress = (challenge.current_value / challenge.target_value) * 100;
            const isParticipant = challenge.participants?.includes(userEmail);
            const daysLeft = Math.ceil(
              (new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={challenge.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-[#CEF17B]/20 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-bold text-white">{challenge.challenge_title}</h3>
                      </div>
                      <p className="text-xs text-[#CEEDB2] mb-2">
                        {challenge.reward_description}
                      </p>
                    </div>
                    {isParticipant && (
                      <Badge className="bg-green-500/20 text-green-400 border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Participando
                      </Badge>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                      <span>Progresso da Comunidade</span>
                      <span>{challenge.current_value.toFixed(0)} / {challenge.target_value} km</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-white/70">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {challenge.participants?.length || 0} participantes
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {daysLeft} dias restantes
                      </div>
                    </div>

                    {!isParticipant && (
                      <Button
                        size="sm"
                        onClick={() => joinChallengeMutation.mutate(challenge.id)}
                        className="bg-[#CEF17B]/20 text-[#CEF17B] hover:bg-[#CEF17B]/30 border-0"
                      >
                        Participar
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}