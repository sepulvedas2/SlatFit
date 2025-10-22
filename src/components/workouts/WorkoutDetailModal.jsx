import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, Check, Loader2, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WorkoutDetailModal({ workout, onClose, userEmail }) {
  const [completing, setCompleting] = useState(false);
  const queryClient = useQueryClient();

  const completeWorkoutMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.WorkoutLog.create({
        user_email: userEmail,
        workout_id: workout.id,
        workout_name: workout.name,
        completed_date: new Date().toISOString().split('T')[0],
        duration_minutes: workout.duration_minutes,
        calories_burned: workout.calories_burned,
        rating: 5
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekWorkouts'] });
      onClose();
    },
  });

  const handleComplete = async () => {
    setCompleting(true);
    await completeWorkoutMutation.mutateAsync();
    setCompleting(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {workout.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {workout.difficulty === 'beginner' ? 'Iniciante' : 
               workout.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
            </Badge>
            <div className="flex items-center gap-1 text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{workout.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <Flame className="w-4 h-4" />
              <span>{workout.calories_burned} kcal</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300">{workout.description}</p>

          {/* Equipment */}
          {workout.equipment_needed?.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-2">Equipamentos Necessários:</h3>
              <div className="flex flex-wrap gap-2">
                {workout.equipment_needed.map((eq, i) => (
                  <Badge key={i} variant="outline" className="bg-slate-800/50 border-white/10">
                    {eq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          <div>
            <h3 className="font-semibold text-white mb-3">Exercícios:</h3>
            <div className="space-y-3">
              {workout.exercises?.map((exercise, index) => (
                <Card key={index} className="bg-slate-800/50 border-white/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{exercise.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {exercise.sets} séries • {exercise.reps} • {exercise.rest_seconds}s descanso
                      </p>
                      {exercise.instructions && (
                        <p className="text-sm text-gray-300 mt-2">{exercise.instructions}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleComplete}
              disabled={completing || !userEmail}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {completing ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Check className="w-5 h-5 mr-2" />
              )}
              Marcar como Concluído
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-white/10"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}