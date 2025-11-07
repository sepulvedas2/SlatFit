
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Droplet, Plus, Check, Edit3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function HydrationTracker({ userEmail, today }) {
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

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
    enabled: !!userEmail && !!today,
  });

  // NEW: Get user profile for personalized hydration tips
  const { data: profile } = useQuery({
    queryKey: ['userProfile', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      return profiles[0] || null;
    },
    enabled: !!userEmail,
  });

  const updateHydrationMutation = useMutation({
    mutationFn: async (amount) => {
      if (!userEmail) throw new Error("User email is required");
      
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
      setCustomAmount("");
      setShowCustomInput(false);
    },
  });

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 5000) {
      updateHydrationMutation.mutate(amount);
    }
  };

  if (!userEmail) {
    return (
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <p className="text-white/60 text-center">Carregando...</p>
      </Card>
    );
  }

  const waterIntake = nutritionData?.water_intake_ml || 0;
  const waterGoal = nutritionData?.water_goal_ml || 2000;
  const progress = (waterIntake / waterGoal) * 100;
  const isGoalReached = waterIntake >= waterGoal;

  // NEW: Personalized tips based on user goal
  const getPersonalizedTip = () => {
    if (!profile) return "💡 Dica: Beba água antes do treino para melhor performance!";
    
    const tips = {
      muscle_gain: "💪 Hipertrofia: Beba água entre as séries — hidratação ajuda no volume muscular!",
      weight_loss: "🔥 Emagrecimento: Mantenha-se hidratado — ajuda no metabolismo e reduz a fome.",
      maintenance: "⚖️ Manutenção: Hidratação constante mantém seu corpo funcionando perfeitamente."
    };

    return tips[profile.goal] || tips.maintenance;
  };

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">Hidratação Diária</h3>
        </div>
        {isGoalReached && (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Check className="w-3 h-3 mr-1" />
            Meta Atingida!
          </Badge>
        )}
      </div>

      {/* NEW: Clearer display */}
      <div className="mb-4 p-4 bg-white/5 rounded-lg">
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <p className="text-xs text-white/60">Hoje</p>
            <p className="text-3xl font-bold text-[#CEF17B]">{waterIntake}ml</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Meta</p>
            <p className="text-2xl font-semibold text-white">{waterGoal}ml</p>
          </div>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-3 bg-white/10" />
        <p className="text-xs text-center text-[#CEEDB2] mt-2">
          {waterIntake >= waterGoal 
            ? "🎉 Parabéns! Continue assim!"
            : `Faltam ${waterGoal - waterIntake}ml para sua meta diária`}
        </p>
      </div>

      {/* Quick add buttons */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button
          onClick={() => updateHydrationMutation.mutate(250)}
          disabled={updateHydrationMutation.isPending}
          size="sm"
          variant="outline"
          className="border-blue-500/30 hover:bg-blue-500/20 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          250ml
        </Button>
        <Button
          onClick={() => updateHydrationMutation.mutate(500)}
          disabled={updateHydrationMutation.isPending}
          size="sm"
          variant="outline"
          className="border-blue-500/30 hover:bg-blue-500/20 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          500ml
        </Button>
        <Button
          onClick={() => updateHydrationMutation.mutate(750)}
          disabled={updateHydrationMutation.isPending}
          size="sm"
          variant="outline"
          className="border-blue-500/30 hover:bg-blue-500/20 text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          750ml
        </Button>
      </div>

      {/* Custom Amount Section */}
      {!showCustomInput ? (
        <Button
          onClick={() => setShowCustomInput(true)}
          variant="outline"
          size="sm"
          className="w-full border-[#CEF17B]/20 hover:bg-[#CEF17B]/10 text-white"
        >
          <Edit3 className="w-4 h-4 mr-2" />
          Adicionar Quantidade Personalizada
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Ex: 300"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="flex-1 bg-white/5 border-blue-500/30 text-white"
              min="1"
              max="5000"
            />
            <Button
              onClick={handleCustomAdd}
              disabled={!customAmount || updateHydrationMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              setShowCustomInput(false);
              setCustomAmount("");
            }}
            variant="ghost"
            size="sm"
            className="w-full text-xs text-white/60 hover:text-white"
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* NEW: Personalized tip */}
      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-xs text-blue-300 text-center">
          {getPersonalizedTip()}
        </p>
      </div>
    </Card>
  );
}
