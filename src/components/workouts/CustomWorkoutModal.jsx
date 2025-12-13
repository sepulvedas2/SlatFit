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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CustomWorkoutModal({ isOpen, onClose, userEmail }) {
  const [workoutData, setWorkoutData] = useState({
    nome_treino: "",
    dia_semana: "segunda",
    observacoes: ""
  });

  const [exercises, setExercises] = useState([
    { exercise_name: "", series: "3", repeticoes: "10", descanso: "60s", observacoes: "" }
  ]);

  const queryClient = useQueryClient();

  const createWorkoutMutation = useMutation({
    mutationFn: async (data) => {
      const workout = await base44.entities.CustomWorkout.create({
        user_email: userEmail,
        ...data.workout
      });

      const exercisePromises = data.exercises.map((exercise, index) =>
        base44.entities.CustomWorkoutExercise.create({
          custom_workout_id: workout.id,
          ...exercise,
          ordem: index
        })
      );

      await Promise.all(exercisePromises);
      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customWorkouts']);
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setWorkoutData({
      nome_treino: "",
      dia_semana: "segunda",
      observacoes: ""
    });
    setExercises([
      { exercise_name: "", series: "3", repeticoes: "10", descanso: "60s", observacoes: "" }
    ]);
  };

  const addExercise = () => {
    setExercises([...exercises, { exercise_name: "", series: "3", repeticoes: "10", descanso: "60s", observacoes: "" }]);
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validExercises = exercises.filter(ex => ex.exercise_name.trim() !== "");
    
    if (!workoutData.nome_treino || validExercises.length === 0) return;

    createWorkoutMutation.mutate({
      workout: workoutData,
      exercises: validExercises
    });
  };

  const dayLabels = {
    segunda: "Segunda-feira",
    terca: "Terça-feira",
    quarta: "Quarta-feira",
    quinta: "Quinta-feira",
    sexta: "Sexta-feira",
    sabado: "Sábado",
    domingo: "Domingo"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#084734] to-[#062A1F] border-[#CEF17B]/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Criar Treino Personalizado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#CEEDB2]">Nome do Treino *</Label>
              <Input
                placeholder="Ex: Peito + Tríceps"
                value={workoutData.nome_treino}
                onChange={(e) => setWorkoutData({...workoutData, nome_treino: e.target.value})}
                className="bg-white/10 border-[#CEF17B]/20 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-[#CEEDB2]">Dia da Semana *</Label>
              <Select value={workoutData.dia_semana} onValueChange={(value) => setWorkoutData({...workoutData, dia_semana: value})}>
                <SelectTrigger className="bg-white/10 border-[#CEF17B]/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dayLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-[#CEEDB2]">Observações</Label>
            <Textarea
              placeholder="Ex: Foco em hipertrofia, 60-90s de descanso..."
              value={workoutData.observacoes}
              onChange={(e) => setWorkoutData({...workoutData, observacoes: e.target.value})}
              className="bg-white/10 border-[#CEF17B]/20 text-white h-20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-[#CEEDB2] text-lg">Exercícios *</Label>
              <Button
                type="button"
                onClick={addExercise}
                size="sm"
                className="bg-[#CEF17B]/20 hover:bg-[#CEF17B]/30 text-[#CEF17B]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg border border-[#CEF17B]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                      Exercício {index + 1}
                    </Badge>
                    {exercises.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeExercise(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <Input
                    placeholder="Nome do exercício *"
                    value={exercise.exercise_name}
                    onChange={(e) => updateExercise(index, 'exercise_name', e.target.value)}
                    className="bg-white/10 border-[#CEF17B]/20 text-white"
                    required
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Séries"
                      value={exercise.series}
                      onChange={(e) => updateExercise(index, 'series', e.target.value)}
                      className="bg-white/10 border-[#CEF17B]/20 text-white"
                    />
                    <Input
                      placeholder="Reps"
                      value={exercise.repeticoes}
                      onChange={(e) => updateExercise(index, 'repeticoes', e.target.value)}
                      className="bg-white/10 border-[#CEF17B]/20 text-white"
                    />
                    <Input
                      placeholder="Descanso"
                      value={exercise.descanso}
                      onChange={(e) => updateExercise(index, 'descanso', e.target.value)}
                      className="bg-white/10 border-[#CEF17B]/20 text-white"
                    />
                  </div>

                  <Input
                    placeholder="Observações (opcional)"
                    value={exercise.observacoes}
                    onChange={(e) => updateExercise(index, 'observacoes', e.target.value)}
                    className="bg-white/10 border-[#CEF17B]/20 text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createWorkoutMutation.isPending || !workoutData.nome_treino}
              className="flex-1 bg-[#CEF17B] hover:bg-[#CEF17B]/90 text-[#084734] font-bold"
            >
              {createWorkoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Criar Treino
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-[#CEF17B]/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}