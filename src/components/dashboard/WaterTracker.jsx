import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Droplet, Settings, Check } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function WaterTracker({ userEmail }) {
  const [showSettings, setShowSettings] = useState(false);
  const [customGoal, setCustomGoal] = useState("");
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', userEmail, today],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({
        user_email: userEmail,
        log_date: today
      });
      return data[0] || null;
    },
    enabled: !!userEmail,
  });

  const updateWaterMutation = useMutation({
    mutationFn: async ({ amount, isGoal = false }) => {
      if (nutritionData) {
        const updates = isGoal 
          ? { water_goal_ml: amount }
          : { 
              water_intake_ml: (nutritionData.water_intake_ml || 0) + amount,
              water_goal_reached: ((nutritionData.water_intake_ml || 0) + amount) >= (nutritionData.water_goal_ml || 2000)
            };
        return base44.entities.NutritionData.update(nutritionData.id, updates);
      } else {
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          water_intake_ml: isGoal ? 0 : amount,
          water_goal_ml: isGoal ? amount : 2000,
          water_goal_reached: false
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
    },
  });

  const handleAddWater = (amount) => {
    updateWaterMutation.mutate({ amount });
  };

  const handleSetGoal = () => {
    const goal = parseInt(customGoal);
    if (goal >= 500 && goal <= 5000) {
      updateWaterMutation.mutate({ amount: goal, isGoal: true });
      setShowSettings(false);
      setCustomGoal("");
    }
  };

  const currentIntake = nutritionData?.water_intake_ml || 0;
  const goalAmount = nutritionData?.water_goal_ml || 2000;
  const percentage = Math.min((currentIntake / goalAmount) * 100, 100);
  const isCompleted = percentage >= 100;

  const getFeedback = () => {
    if (percentage >= 100) return "Meta concluída! Excelente hidratação! 🎉";
    if (percentage >= 60) return "Quase lá! Continue assim! 💪";
    if (percentage >= 30) return "Ótimo! Continue se hidratando 💧";
    return "Boa! Vamos começar o dia hidratado 🌊";
  };

  const quickAmounts = [
    { value: 100, label: "100ml" },
    { value: 200, label: "200ml" },
    { value: 300, label: "300ml" }
  ];

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Droplet className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">Hidratação Diária</h3>
            <p className="text-xs text-[#CEEDB2]">
              {currentIntake} ml / {goalAmount} ml
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="p-4 bg-white/5 rounded-xl space-y-3">
              <p className="text-sm text-white font-medium">Definir Meta Diária</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="2000"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10 text-white"
                />
                <Button
                  onClick={handleSetGoal}
                  disabled={!customGoal || parseInt(customGoal) < 500}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <Check className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                {[1500, 2000, 2500].map((goal) => (
                  <Button
                    key={goal}
                    onClick={() => {
                      updateWaterMutation.mutate({ amount: goal, isGoal: true });
                      setShowSettings(false);
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/10 hover:bg-white/10 text-xs"
                  >
                    {goal}ml
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="mb-4">
        <Progress value={percentage} className="h-3 mb-2" />
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#CEF17B]">
            {Math.round(percentage)}%
          </span>
          {isCompleted && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-lg"
            >
              ✅
            </motion.span>
          )}
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {quickAmounts.map((amount) => (
          <motion.div key={amount.value} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleAddWater(amount.value)}
              disabled={isCompleted}
              className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300"
            >
              +{amount.label}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Feedback Message */}
      <div className={`p-3 rounded-xl text-center transition-all ${
        isCompleted 
          ? 'bg-green-500/20 border border-green-500/30' 
          : 'bg-blue-500/10 border border-blue-500/20'
      }`}>
        <p className={`text-sm font-medium ${
          isCompleted ? 'text-green-400' : 'text-blue-300'
        }`}>
          {getFeedback()}
        </p>
      </div>
    </Card>
  );
}