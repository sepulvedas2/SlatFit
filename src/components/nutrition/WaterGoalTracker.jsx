import React, { useState } from "react";
import { Droplets, Settings, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import WaterGoalModal from "./WaterGoalModal";

const calculateWaterGoalByBodyType = (bodyType, weight = 70) => {
  const baseWater = weight * 35;
  const multipliers = { ectomorph: 1.15, mesomorph: 1.0, endomorph: 0.95 };
  return Math.round(baseWater * (multipliers[bodyType] || 1.0));
};

export default function WaterGoalTracker({ userEmail, nutritionData, userProfile }) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [celebrateGoal, setCelebrateGoal] = useState(false);
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const defaultGoal = userProfile?.body_type
    ? calculateWaterGoalByBodyType(userProfile.body_type, userProfile.current_weight)
    : 2000;

  const currentIntake = nutritionData?.water_intake_ml || 0;
  const goalAmount = nutritionData?.water_goal_ml || defaultGoal;
  const percentage = Math.min((currentIntake / goalAmount) * 100, 100);
  const isGoalReached = percentage >= 100;

  const bodyTypeMessages = {
    ectomorph: "Seu metabolismo rápido exige mais hidratação.",
    mesomorph: "Meta equilibrada para o seu biotipo.",
    endomorph: "Hidratação ajustada para o seu metabolismo.",
  };
  const bodyMessage = userProfile?.body_type
    ? bodyTypeMessages[userProfile.body_type]
    : "Beba água regularmente ao longo do dia.";

  const getMotivationalMessage = () => {
    if (percentage >= 100) return "Meta concluída! Parabéns 🎉";
    if (percentage >= 75) return "Quase lá, continue firme! 💪";
    if (percentage >= 50) return "Você está na metade da meta! 💧";
    if (percentage >= 25) return "Bom começo! Continue se hidratando 💧";
    return "Vamos começar a se hidratar! 💦";
  };

  const updateWaterMutation = useMutation({
    mutationFn: async (newIntake) => {
      if (nutritionData?.id) {
        return db.NutritionData.update(nutritionData.id, {
          water_intake_ml: newIntake,
          water_goal_reached: newIntake >= goalAmount,
        });
      }
      return db.NutritionData.create({
        user_email: userEmail,
        log_date: today,
        water_intake_ml: newIntake,
        water_goal_ml: goalAmount,
        water_goal_reached: newIntake >= goalAmount,
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['nutritionData']),
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (newGoal) => {
      if (nutritionData?.id) {
        return db.NutritionData.update(nutritionData.id, { water_goal_ml: newGoal });
      }
      return db.NutritionData.create({
        user_email: userEmail,
        log_date: today,
        water_goal_ml: newGoal,
        water_intake_ml: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
      toast.success("Meta de água atualizada!");
    },
  });

  const handleAddWater = async (amount) => {
    const newIntake = currentIntake + amount;
    const wasNotReached = !isGoalReached;
    await updateWaterMutation.mutateAsync(newIntake);
    if (wasNotReached && newIntake >= goalAmount) {
      setCelebrateGoal(true);
      await base44.functions.invoke('addXP', { amount: 20, source: 'challenge', reference_id: 'water-goal' });
      queryClient.invalidateQueries(['userPoints']);
      toast.success("🎉 Meta de água concluída! +20 XP");
      setTimeout(() => setCelebrateGoal(false), 3000);
    } else {
      toast.success(`+${amount}ml adicionado!`);
    }
  };

  return (
    <>
      <div className="rounded-3xl overflow-hidden relative" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(96,165,250,0.2)" }}>

        {/* Celebrate overlay */}
        <AnimatePresence>
          {celebrateGoal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl"
              style={{ background: "rgba(59,130,246,0.15)", backdropFilter: "blur(4px)" }}
            >
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-2 animate-pulse" />
                <p className="text-xl font-black text-white">Meta Concluída! 🎉</p>
                <p className="text-sm text-[#CEF17B] font-semibold mt-1">+20 XP</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(96,165,250,0.15)" }}>
              <Droplets className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Meta de Água</h3>
              <p className="text-xs text-white/40">
                <span className="text-blue-300 font-semibold">{currentIntake}</span>
                <span> / {goalAmount} ml</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGoalModal(true)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            <Settings className="w-4 h-4 text-white/40" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">{getMotivationalMessage()}</span>
            <span className="text-xs font-bold" style={{ color: isGoalReached ? "#4ade80" : "#60a5fa" }}>
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(96,165,250,0.1)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: isGoalReached ? "linear-gradient(90deg,#4ade80,#22d3ee)" : "linear-gradient(90deg,#3b82f6,#06b6d4)" }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          {isGoalReached && (
            <div className="flex items-center justify-center gap-2 py-1.5 rounded-xl" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <span className="text-xs font-semibold text-green-400">✓ Meta do dia concluída!</span>
            </div>
          )}
        </div>

        {/* Quick add buttons */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {[100, 250, 500].map(amount => (
              <button
                key={amount}
                onClick={() => handleAddWater(amount)}
                disabled={isGoalReached}
                className="py-3 rounded-2xl text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
                style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.25)", color: "#93c5fd" }}
              >
                +{amount}ml
              </button>
            ))}
          </div>
        </div>

        {/* Info tip */}
        <div className="mx-5 mb-5 px-4 py-3 rounded-2xl" style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.12)" }}>
          <p className="text-xs text-blue-300/70 text-center">💧 {bodyMessage}</p>
        </div>
      </div>

      <WaterGoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        currentGoal={goalAmount}
        onSave={(g) => updateGoalMutation.mutate(g)}
        userProfile={userProfile}
        waterStreak={0}
      />

    </>
  );
}