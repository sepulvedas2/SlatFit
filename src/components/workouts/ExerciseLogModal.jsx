import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Save, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ExerciseLogModal({ 
  isOpen, 
  onClose, 
  exerciseName, 
  userEmail, 
  weekNumber, 
  workoutDay 
}) {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    weight_kg: "",
    reps: "",
    sets_completed: "",
    notes: ""
  });

  // Fetch history for this exercise
  const { data: exerciseHistory = [] } = useQuery({
    queryKey: ['exerciseHistory', userEmail, exerciseName],
    queryFn: async () => {
      const logs = await base44.entities.ExerciseLog.filter({
        user_email: userEmail,
        exercise_name: exerciseName
      });
      return logs.sort((a, b) => new Date(b.log_date) - new Date(a.log_date)).slice(0, 5);
    },
    enabled: !!userEmail && !!exerciseName,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.ExerciseLog.create({
        user_email: userEmail,
        exercise_name: exerciseName,
        workout_day: workoutDay,
        week_number: weekNumber,
        log_date: today,
        weight_kg: parseFloat(formData.weight_kg) || 0,
        reps: parseInt(formData.reps) || 0,
        sets_completed: parseInt(formData.sets_completed) || 0,
        notes: formData.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exerciseHistory']);
      onClose();
      setFormData({ weight_kg: "", reps: "", sets_completed: "", notes: "" });
    },
  });

  const lastLog = exerciseHistory[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#084734] border-[#CEF17B]/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            📊 Log de Carga
          </DialogTitle>
          <p className="text-[#CEEDB2] text-sm">{exerciseName}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Last Performance */}
          {lastLog && (
            <Card className="bg-white/5 border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-[#CEF17B]" />
                <span className="text-sm font-medium text-white">Último treino</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-[#CEF17B]">{lastLog.weight_kg || 0}kg</p>
                  <p className="text-xs text-[#CEEDB2]">Peso</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#CEF17B]">{lastLog.reps || 0}</p>
                  <p className="text-xs text-[#CEEDB2]">Reps</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#CEF17B]">{lastLog.sets_completed || 0}</p>
                  <p className="text-xs text-[#CEEDB2]">Séries</p>
                </div>
              </div>
            </Card>
          )}

          {/* Form */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-[#CEEDB2] text-xs mb-1 block">Peso (kg)</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-center"
              />
            </div>
            <div>
              <Label className="text-[#CEEDB2] text-xs mb-1 block">Reps</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-center"
              />
            </div>
            <div>
              <Label className="text-[#CEEDB2] text-xs mb-1 block">Séries</Label>
              <Input
                type="number"
                placeholder="0"
                value={formData.sets_completed}
                onChange={(e) => setFormData({ ...formData, sets_completed: e.target.value })}
                className="bg-white/5 border-white/10 text-white text-center"
              />
            </div>
          </div>

          <div>
            <Label className="text-[#CEEDB2] text-xs mb-1 block">Observações</Label>
            <Textarea
              placeholder="Como foi o treino? Alguma dor? Anotações..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="bg-white/5 border-white/10 text-white resize-none h-20"
            />
          </div>

          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full gradient-button text-[#084734] h-12 font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Salvando...' : 'Salvar Log'}
          </Button>

          {/* History */}
          {exerciseHistory.length > 1 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-[#CEEDB2] mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Histórico
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {exerciseHistory.slice(1).map((log, idx) => (
                  <div key={idx} className="flex justify-between text-xs p-2 bg-white/5 rounded-lg">
                    <span className="text-[#CEEDB2]">{log.log_date}</span>
                    <span className="text-white">{log.weight_kg}kg • {log.reps} reps • {log.sets_completed} séries</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}