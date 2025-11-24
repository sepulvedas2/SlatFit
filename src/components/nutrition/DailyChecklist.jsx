import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function DailyChecklist({ userEmail }) {
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

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      if (nutritionData) {
        const score = calculateScore({...nutritionData, ...updates});
        return base44.entities.NutritionData.update(nutritionData.id, {
          ...updates,
          consistency_score: score
        });
      } else {
        const score = calculateScore(updates);
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          ...updates,
          consistency_score: score
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
    },
  });

  const calculateScore = (data) => {
    let score = 0;
    if (data.slept_well) score += 12;
    if (data.had_breakfast) score += 12;
    if (data.had_lunch) score += 12;
    if (data.had_dinner) score += 12;
    if (data.ate_mindfully) score += 12;
    if (data.energy_level >= 3) score += 12;
    if (data.mood && data.mood !== 'low' && data.mood !== 'tired') score += 12;
    if (data.water_goal_reached) score += 16;
    return score;
  };

  const habits = [
    { key: 'slept_well', label: 'Dormiu bem?', emoji: '😴', value: nutritionData?.slept_well },
    { key: 'had_breakfast', label: 'Café da manhã?', emoji: '☕', value: nutritionData?.had_breakfast },
    { key: 'had_lunch', label: 'Almoço?', emoji: '🍽️', value: nutritionData?.had_lunch },
    { key: 'had_dinner', label: 'Jantar?', emoji: '🌙', value: nutritionData?.had_dinner },
    { key: 'ate_mindfully', label: 'Comeu com atenção?', emoji: '🧘', value: nutritionData?.ate_mindfully },
  ];

  const completedCount = habits.filter(h => h.value).length;
  const progressPercentage = (completedCount / habits.length) * 100;
  const allComplete = completedCount === habits.length;

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Missões do Dia</h3>
        <div className="text-sm font-semibold text-[#CEF17B]">
          {completedCount}/{habits.length}
        </div>
      </div>

      <Progress value={progressPercentage} className="h-3 mb-6" />

      <div className="grid gap-3">
        {habits.map((habit) => (
          <motion.button
            key={habit.key}
            onClick={() => updateMutation.mutate({ [habit.key]: !habit.value })}
            whileTap={{ scale: 0.98 }}
            animate={habit.value ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 0.3 }}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
              habit.value
                ? 'bg-green-500/20 border-2 border-green-500/40'
                : 'bg-white/5 border-2 border-white/10 hover:border-[#CEF17B]/30'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              habit.value ? 'bg-green-500' : 'bg-white/10'
            }`}>
              {habit.value ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <span className="text-lg">{habit.emoji}</span>
              )}
            </div>
            <span className={`text-sm font-medium ${habit.value ? 'text-white' : 'text-white/80'}`}>
              {habit.label}
            </span>
          </motion.button>
        ))}
      </div>

      {allComplete && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 text-center"
        >
          <p className="text-2xl mb-2">🏆</p>
          <p className="text-sm font-bold text-green-400">
            Parabéns! Todas as missões completas!
          </p>
        </motion.div>
      )}
    </Card>
  );
}