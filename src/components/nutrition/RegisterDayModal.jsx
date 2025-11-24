import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function RegisterDayModal({ isOpen, onClose, userEmail }) {
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

  const [energy, setEnergy] = useState(nutritionData?.energy_level || 3);
  const [mood, setMood] = useState(nutritionData?.mood || 'ok');

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (nutritionData) {
        return base44.entities.NutritionData.update(nutritionData.id, {
          energy_level: energy,
          mood: mood
        });
      } else {
        return base44.entities.NutritionData.create({
          user_email: userEmail,
          log_date: today,
          energy_level: energy,
          mood: mood
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['nutritionData']);
      onClose();
    },
  });

  const moods = [
    { value: 'great', emoji: '😄', label: 'Ótimo' },
    { value: 'good', emoji: '🙂', label: 'Bom' },
    { value: 'ok', emoji: '😐', label: 'Ok' },
    { value: 'tired', emoji: '😴', label: 'Cansado' },
    { value: 'low', emoji: '😔', label: 'Baixo' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#084734] border-[#CEF17B]/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Registrar Meu Dia</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Energy Level */}
          <div>
            <label className="text-sm text-[#CEEDB2] mb-3 block">
              Como está sua energia hoje? (1-5)
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((level) => (
                <motion.button
                  key={level}
                  onClick={() => setEnergy(level)}
                  whileTap={{ scale: 0.9 }}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all ${
                    energy >= level
                      ? 'bg-[#CEF17B] text-[#084734] scale-110'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  ⚡
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="text-sm text-[#CEEDB2] mb-3 block">
              Como está seu humor?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {moods.map((m) => (
                <motion.button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  whileTap={{ scale: 0.9 }}
                  className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-all ${
                    mood === m.value
                      ? 'bg-[#CEF17B] text-[#084734] scale-105'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-medium">{m.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full gradient-button text-[#084734] h-12 text-base font-semibold"
          >
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Registro'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}