import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Droplet, Plus, Check, Edit3, Trophy, Calendar, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HydrationTracker({ userEmail, today }) {
  const queryClient = useQueryClient();
  const [customAmount, setCustomAmount] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

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

  const waterGoal = nutritionData?.water_goal_ml || 2000;
  const waterIntake = nutritionData?.water_intake_ml || 0;
  const progress = (waterIntake / waterGoal) * 100;
  const wasGoalReached = nutritionData?.water_goal_reached || false;
  const isGoalReached = waterIntake >= waterGoal;

  // Show celebration when goal is reached for the first time
  useEffect(() => {
    if (isGoalReached && !wasGoalReached) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }
  }, [isGoalReached, wasGoalReached]);

  const updateHydrationMutation = useMutation({
    mutationFn: async (amount) => {
      if (!userEmail) throw new Error("User email is required");
      
      const currentIntake = nutritionData?.water_intake_ml || 0;
      const newIntake = currentIntake + amount;
      const goalReached = newIntake >= waterGoal;
      
      if (nutritionData) {
        return base44.entities.NutritionData.update(nutritionData.id, {
          water_intake_ml: newIntake,
          water_goal_reached: goalReached
        });
      } else {
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          water_intake_ml: newIntake,
          water_goal_ml: waterGoal,
          water_goal_reached: goalReached
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
      setCustomAmount("");
      setShowCustomInput(false);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async (newGoal) => {
      if (!userEmail) throw new Error("User email is required");
      
      if (nutritionData) {
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
      setEditingGoal(false);
      setGoalInput("");
    },
  });

  const handleCustomAdd = () => {
    const amount = parseInt(customAmount);
    if (amount > 0 && amount <= 5000) {
      updateHydrationMutation.mutate(amount);
    }
  };

  const handleGoalUpdate = () => {
    const newGoal = parseInt(goalInput);
    if (newGoal > 0 && newGoal <= 10000) {
      updateGoalMutation.mutate(newGoal);
    }
  };

  if (!userEmail) {
    return (
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <p className="text-white/60 text-center">Carregando...</p>
      </Card>
    );
  }

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20 relative overflow-hidden">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-gradient-to-br from-[#CEF17B]/90 to-emerald-500/90 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
            >
              <Trophy className="w-24 h-24 text-[#084734] mb-4" />
            </motion.div>
            <motion.h3
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-[#084734] mb-2"
            >
              🏆 MISSÃO CUMPRIDA!
            </motion.h3>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[#084734] text-center px-4"
            >
              Excelente! Seu corpo agradece — manter a constância é o segredo.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-white">Hidratação Diária</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#CEEDB2]">
          <Calendar className="w-3 h-3" />
          <span>{format(new Date(), "dd/MM/yyyy", { locale: ptBR })}</span>
        </div>
      </div>

      {isGoalReached && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-semibold text-sm">Meta Atingida! 🎉</span>
        </div>
      )}

      {/* Stats Display */}
      <div className="mb-4 p-4 bg-white/5 rounded-lg">
        <div className="flex justify-between items-baseline mb-2">
          <div>
            <p className="text-xs text-white/60">Ingerido</p>
            <p className="text-3xl font-bold text-[#CEF17B]">{waterIntake}ml</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60">Meta</p>
            {!editingGoal ? (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-white">{waterGoal}ml</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingGoal(true);
                    setGoalInput(waterGoal.toString());
                  }}
                  className="h-6 w-6 text-white/60 hover:text-white"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-24 h-8 bg-white/5 border-white/10 text-white text-right"
                  min="100"
                  max="10000"
                />
                <Button
                  size="icon"
                  onClick={handleGoalUpdate}
                  disabled={!goalInput || updateGoalMutation.isPending}
                  className="h-6 w-6 bg-[#CEF17B] hover:bg-[#CEF17B]/90 text-[#084734]"
                >
                  <Check className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-3 bg-white/10" />
        <p className="text-xs text-center text-[#CEEDB2] mt-2">
          {isGoalReached 
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
          Inserir Manualmente
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

      {/* Status Badge */}
      <div className="mt-4 text-center">
        <Badge className={isGoalReached ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}>
          {isGoalReached ? "✓ Missão Cumprida" : "⏳ Em Andamento"}
        </Badge>
      </div>
    </Card>
  );
}