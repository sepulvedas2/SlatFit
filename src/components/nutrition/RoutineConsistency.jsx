import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Check } from "lucide-react";
import { format, subDays } from "date-fns";

export default function RoutineConsistency({ userEmail }) {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

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

  // Get last 7 days data
  const { data: weekData } = useQuery({
    queryKey: ['weekNutritionData', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      const sevenDaysAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const data = await base44.entities.NutritionData.filter({
        user_email: userEmail
      });
      return data.filter(d => d.log_date >= sevenDaysAgo);
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const updateRoutineMutation = useMutation({
    mutationFn: async (updates) => {
      if (!userEmail) throw new Error("User email is required");
      
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
      queryClient.invalidateQueries(['weekNutritionData']);
    },
  });

  const calculateScore = (data) => {
    let score = 0;
    if (data.had_breakfast) score += 20;
    if (data.had_lunch) score += 20;
    if (data.had_dinner) score += 20;
    if (data.ate_mindfully) score += 20;
    if (data.slept_well) score += 20;
    return score;
  };

  if (!userEmail) {
    return (
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <p className="text-white/60 text-center">Carregando...</p>
      </Card>
    );
  }

  const currentScore = nutritionData?.consistency_score || 0;
  const weekAverage = weekData.length > 0
    ? Math.round(weekData.reduce((sum, d) => sum + (d.consistency_score || 0), 0) / weekData.length)
    : 0;

  const habits = [
    { key: 'slept_well', label: 'Dormiu bem?', value: nutritionData?.slept_well },
    { key: 'had_breakfast', label: 'Café da manhã?', value: nutritionData?.had_breakfast },
    { key: 'had_lunch', label: 'Almoço?', value: nutritionData?.had_lunch },
    { key: 'had_dinner', label: 'Jantar?', value: nutritionData?.had_dinner },
    { key: 'ate_mindfully', label: 'Comeu com atenção?', value: nutritionData?.ate_mindfully },
  ];

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="font-bold text-white">Constância</h3>
        </div>
        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
          {weekAverage}% média semanal
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        {habits.map((habit) => (
          <button
            key={habit.key}
            onClick={() => updateRoutineMutation.mutate({ [habit.key]: !habit.value })}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              habit.value
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            <span className="text-sm text-white">{habit.label}</span>
            {habit.value && <Check className="w-4 h-4 text-green-400" />}
          </button>
        ))}
      </div>

      <div className="p-4 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/20">
        <div className="text-center">
          <p className="text-3xl font-bold text-white mb-1">{currentScore}%</p>
          <p className="text-xs text-[#CEEDB2]">Score de Hoje</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <p className="text-xs text-purple-300 text-center">
          💬 Seu Assistente Personal: "Constância constrói resultados. Continue assim!"
        </p>
      </div>
    </Card>
  );
}