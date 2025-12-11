import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Droplet, Settings, Plus, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import WaterGoalModal from "./WaterGoalModal";
import WaterIntakeModal from "./WaterIntakeModal";

// Calcular meta de água baseada no biotipo
const calculateWaterGoalByBodyType = (bodyType, weight = 70) => {
  const baseWater = weight * 35; // ml por kg
  
  const multipliers = {
    ectomorph: 1.15,  // Metabolismo rápido, precisa mais água
    mesomorph: 1.0,   // Equilibrado
    endomorph: 0.95   // Metabolismo lento, retém mais líquidos
  };
  
  return Math.round(baseWater * (multipliers[bodyType] || 1.0));
};

export default function WaterGoalTracker({ userEmail, nutritionData, userProfile }) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [celebrateGoal, setCelebrateGoal] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Calcular meta personalizada baseada no biotipo
  const defaultGoal = userProfile?.body_type 
    ? calculateWaterGoalByBodyType(userProfile.body_type, userProfile.current_weight)
    : 2000;
  
  const currentIntake = nutritionData?.water_intake_ml || 0;
  const goalAmount = nutritionData?.water_goal_ml || defaultGoal;
  const percentage = Math.min((currentIntake / goalAmount) * 100, 100);
  const isGoalReached = percentage >= 100;
  
  // Mensagem personalizada baseada no biotipo
  const getBodyTypeMessage = () => {
    if (!userProfile?.body_type) return null;
    
    const messages = {
      ectomorph: "💧 Seu metabolismo rápido exige mais hidratação",
      mesomorph: "💧 Meta equilibrada para seu biotipo",
      endomorph: "💧 Hidratação ajustada para seu metabolismo"
    };
    
    return messages[userProfile.body_type];
  };

  const updateWaterMutation = useMutation({
    mutationFn: async (newIntake) => {
      if (nutritionData?.id) {
        const reached = newIntake >= goalAmount;
        return base44.entities.NutritionData.update(nutritionData.id, {
          water_intake_ml: newIntake,
          water_goal_reached: reached
        });
      } else {
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          water_intake_ml: newIntake,
          water_goal_ml: goalAmount,
          water_goal_reached: newIntake >= goalAmount
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (newGoal) => {
      if (nutritionData?.id) {
        return base44.entities.NutritionData.update(nutritionData.id, {
          water_goal_ml: newGoal
        });
      } else {
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          water_goal_ml: newGoal,
          water_intake_ml: 0
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
      toast.success("Meta de água atualizada!");
    },
  });

  const awardPointsMutation = useMutation({
    mutationFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: userEmail });
      if (points[0]) {
        return base44.entities.UserPoints.update(points[0].id, {
          total_points: points[0].total_points + 20,
          xp_current: points[0].xp_current + 20
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPoints']);
    }
  });

  const handleAddWater = async (amount) => {
    const newIntake = currentIntake + amount;
    const wasNotReached = !isGoalReached;
    
    await updateWaterMutation.mutateAsync(newIntake);

    if (wasNotReached && newIntake >= goalAmount) {
      setCelebrateGoal(true);
      await awardPointsMutation.mutateAsync();
      toast.success("🎉 Meta de água concluída! +20 XP");
      setTimeout(() => setCelebrateGoal(false), 3000);
    } else {
      toast.success(`+${amount}ml adicionado!`);
    }
  };

  const handleSaveGoal = (newGoal) => {
    updateGoalMutation.mutate(newGoal);
  };

  const getMotivationalMessage = () => {
    if (percentage >= 100) return "Meta concluída! Parabéns 🎉";
    if (percentage >= 75) return "Quase lá, continue firme! 💪";
    if (percentage >= 50) return "Você está na metade da meta! 💧";
    if (percentage >= 25) return "Bom começo! Continue se hidratando 💧";
    return "Vamos começar a se hidratar! 💦";
  };

  const quickAddButtons = [
    { amount: 100, label: "+100ml" },
    { amount: 250, label: "+250ml" },
    { amount: 500, label: "+500ml" },
  ];

  return (
    <>
      <Card className="glass-effect border-blue-400/30 p-6 relative overflow-hidden">
        {celebrateGoal && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-green-500/20 flex items-center justify-center z-10 rounded-lg"
          >
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-2 animate-pulse" />
              <p className="text-2xl font-bold text-white">🎉 Meta Concluída!</p>
              <p className="text-[#CEF17B]">+20 XP</p>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Meta de Água</h3>
              <p className="text-sm text-[#CEEDB2]">
                {currentIntake} / {goalAmount} ml
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGoalModal(true)}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/60 mb-2">
            <span>{getMotivationalMessage()}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-3 bg-blue-900/30"
            style={{
              '--progress-background': 'linear-gradient(90deg, #3b82f6, #06b6d4)'
            }}
          />
        </div>

        {isGoalReached && (
          <Badge className="bg-green-500/20 text-green-400 border-0 w-full justify-center mb-4 py-2">
            ✓ Meta do dia concluída!
          </Badge>
        )}

        <div className="grid grid-cols-4 gap-2">
          {quickAddButtons.map((btn) => (
            <Button
              key={btn.amount}
              onClick={() => handleAddWater(btn.amount)}
              className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
              disabled={isGoalReached}
            >
              {btn.label}
            </Button>
          ))}
          <Button
            onClick={() => setShowIntakeModal(true)}
            className="bg-[#CEF17B]/20 hover:bg-[#CEF17B]/30 text-[#CEF17B] border border-[#CEF17B]/30"
            disabled={isGoalReached}
          >
            <Plus className="w-4 h-4 mr-1" />
            Outro
          </Button>
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-blue-300 text-center">
            {getBodyTypeMessage() || "💡 Beba água regularmente ao longo do dia para melhores resultados"}
          </p>
        </div>
      </Card>

      <WaterGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        currentGoal={goalAmount}
        onSave={handleSaveGoal}
      />

      <WaterIntakeModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        onAdd={handleAddWater}
      />
    </>
  );
}