import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HydrationTracker({ userEmail, today }) {
  const queryClient = useQueryClient();

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', userEmail, today],
    queryFn: async () => {
      if (!userEmail) return null;
      const data = await base44.entities.NutritionData.filter({
        user_email: userEmail,
        log_date: today
      });
      return data[0] || null;
    },
    enabled: !!userEmail,
  });

  const updateHydrationMutation = useMutation({
    mutationFn: async (amount) => {
      if (!userEmail) {
        throw new Error("User email is required");
      }
      
      const currentIntake = nutritionData?.water_intake_ml || 0;
      const newIntake = currentIntake + amount;
      
      if (nutritionData) {
        return base44.entities.NutritionData.update(nutritionData.id, {
          water_intake_ml: newIntake
        });
      } else {
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          water_intake_ml: newIntake
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
    },
  });

  if (!userEmail) {
    return (
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <p className="text-white text-center">Carregando...</p>
      </Card>
    );
  }

  const waterIntake = nutritionData?.water_intake_ml || 0;
  const waterGoal = nutritionData?.water_goal_ml || 2000;
  const progress = (waterIntake / waterGoal) * 100;
  const isGoalReached = waterIntake >= waterGoal;

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">Hidratação</h3>
        </div>
        {isGoalReached && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Meta Atingida!
          </Badge>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#CEEDB2]">{waterIntake}ml</span>
          <span className="text-white font-semibold">{waterGoal}ml</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-3 bg-white/10" />
        <p className="text-xs text-[#CEEDB2] mt-2 text-center">
          {waterIntake >= waterGoal 
            ? "🎉 Parabéns! Continue assim!"
            : `Faltam ${waterGoal - waterIntake}ml para sua meta`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => updateHydrationMutation.mutate(250)}
          disabled={updateHydrationMutation.isPending || !userEmail}
          size="sm"
          variant="outline"
          className="border-blue-500/30 hover:bg-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          250ml
        </Button>
        <Button
          onClick={() => updateHydrationMutation.mutate(500)}
          disabled={updateHydrationMutation.isPending || !userEmail}
          size="sm"
          variant="outline"
          className="border-blue-500/30 hover:bg-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          500ml
        </Button>
        <Button
          onClick={() => updateHydrationMutation.mutate(750)}
          disabled={updateHydrationMutation.isPending || !userEmail}
          size="sm"
          variant="outline"
          className="border-blue-500/30 hover:bg-blue-500/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          750ml
        </Button>
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-xs text-blue-300 text-center">
          💡 Dica IAGO: Beba água antes do treino para melhor performance!
        </p>
      </div>
    </Card>
  );
}