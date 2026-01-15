import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Zap, Smile, Meh, Frown, Coffee } from "lucide-react";

export default function EnergyMoodLog({ userEmail, today }) {
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
    enabled: !!userEmail && !!today,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates) => {
      if (!userEmail) throw new Error("User email is required");
      
      if (nutritionData) {
        return base44.entities.NutritionData.update(nutritionData.id, updates);
      } else {
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          ...updates
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
        <p className="text-white/60 text-center">Carregando...</p>
      </Card>
    );
  }

  const moods = [
    { value: 'great', label: 'Ótimo', icon: Smile, color: 'text-green-400' },
    { value: 'good', label: 'Bom', icon: Smile, color: 'text-blue-400' },
    { value: 'ok', label: 'Ok', icon: Meh, color: 'text-yellow-400' },
    { value: 'tired', label: 'Cansado', icon: Coffee, color: 'text-orange-400' },
    { value: 'low', label: 'Baixo', icon: Frown, color: 'text-red-400' },
  ];

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        <h3 className="font-bold text-white">Como está sua energia hoje?</h3>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => updateMutation.mutate({ energy_level: level })}
            disabled={updateMutation.isPending}
            className={`py-3 rounded-lg transition-all ${
              nutritionData?.energy_level === level
                ? 'bg-[#CEF17B] text-[#084734] scale-110'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <span className="font-bold">{level}</span>
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-3">E seu humor?</h4>
        <div className="grid grid-cols-5 gap-2">
          {moods.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.value}
                onClick={() => updateMutation.mutate({ mood: mood.value })}
                disabled={updateMutation.isPending}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                  nutritionData?.mood === mood.value
                    ? 'bg-[#CEF17B]/20 border-2 border-[#CEF17B]'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                }`}
              >
                <Icon className={`w-6 h-6 ${mood.color}`} />
                <span className="text-xs text-white">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {nutritionData?.energy_level && nutritionData?.mood && (
        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-xs text-green-300 text-center">
            ✓ Registrado! Seu Assistente Personal irá usar esses dados para personalizar suas dicas.
          </p>
        </div>
      )}
    </Card>
  );
}