import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Flame, Dumbbell, Apple, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";

export default function DailyMissions({ userEmail }) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayFoods } = useQuery({
    queryKey: ['todayFoods', userEmail, today],
    queryFn: () => {
      if (!userEmail) return [];
      return base44.entities.FoodLog.filter({ 
        user_email: userEmail, 
        log_date: today 
      });
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: todayWorkouts } = useQuery({
    queryKey: ['todayWorkouts', userEmail, today],
    queryFn: () => {
      if (!userEmail) return [];
      return base44.entities.WorkoutLog.filter({ 
        user_email: userEmail, 
        completed_date: today 
      });
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: todayCheckIn } = useQuery({
    queryKey: ['checkIn', userEmail, today],
    queryFn: async () => {
      if (!userEmail) return null;
      const checkIns = await base44.entities.DailyCheckIn.filter({
        user_email: userEmail,
        check_in_date: today
      });
      return checkIns[0] || null;
    },
    enabled: !!userEmail
  });

  if (!userEmail) {
    return null;
  }

  const missions = [
    {
      id: "checkin",
      title: "Check-in Diário",
      description: "Registre como está se sentindo hoje",
      icon: Target,
      xp: 10,
      completed: !!todayCheckIn,
      color: "text-blue-400"
    },
    {
      id: "workout",
      title: "Complete 1 Treino",
      description: "Faça pelo menos um treino hoje",
      icon: Dumbbell,
      xp: 50,
      completed: todayWorkouts.length > 0,
      color: "text-purple-400"
    },
    {
      id: "nutrition",
      title: "Registre 3 Refeições",
      description: "Acompanhe sua alimentação",
      icon: Apple,
      xp: 30,
      completed: todayFoods.length >= 3,
      color: "text-green-400"
    },
    {
      id: "calories",
      title: "Atinja Meta de Calorias",
      description: "Fique dentro do seu objetivo calórico",
      icon: Flame,
      xp: 40,
      completed: false,
      color: "text-orange-400"
    },
  ];

  const completedCount = missions.filter(m => m.completed).length;
  const totalXP = missions.filter(m => m.completed).reduce((sum, m) => sum + m.xp, 0);

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Missões Diárias</h3>
        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
          {completedCount}/{missions.length} Completas (+{totalXP} XP)
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {missions.map((mission) => {
          const Icon = mission.icon;
          return (
            <div
              key={mission.id}
              className={`p-4 rounded-lg transition-all ${
                mission.completed 
                  ? 'bg-[#CEF17B]/10 border border-[#CEF17B]/30' 
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    mission.completed ? 'bg-[#CEF17B]/20' : 'bg-white/5'
                  }`}>
                    {mission.completed ? (
                      <Check className="w-5 h-5 text-[#CEF17B]" />
                    ) : (
                      <Icon className={`w-5 h-5 ${mission.color}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      mission.completed ? 'text-white line-through' : 'text-white'
                    }`}>
                      {mission.title}
                    </h4>
                    <p className="text-xs text-[#CEEDB2] mt-1">{mission.description}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    mission.completed 
                      ? 'bg-[#CEF17B]/20 text-[#CEF17B] border-[#CEF17B]/30' 
                      : 'bg-white/5 text-white/70 border-white/10'
                  }`}
                >
                  +{mission.xp} XP
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {completedCount === missions.length && (
        <div className="mt-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
          <p className="text-center text-sm font-semibold text-green-400">
            🎉 Todas as missões completas! Você ganhou {totalXP} XP hoje!
          </p>
        </div>
      )}
    </Card>
  );
}