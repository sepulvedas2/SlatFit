import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell, Trophy, Trash2, ChevronDown, ChevronUp, Edit, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomWorkoutModal from "./CustomWorkoutModal";
import PRModal from "./PRModal";
import AIWorkoutWizard from "./AIWorkoutWizard";
import CompleteWorkoutButton from "./CompleteWorkoutButton";

export default function MyWorkouts({ userEmail }) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [aiWizardOpen, setAiWizardOpen] = useState(false);
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editingExercises, setEditingExercises] = useState([]);

  const queryClient = useQueryClient();

  const { data: customWorkouts = [] } = useQuery({
    queryKey: ['customWorkouts', userEmail],
    queryFn: () => base44.entities.CustomWorkout.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: workoutExercises = [] } = useQuery({
    queryKey: ['customWorkoutExercises', userEmail],
    queryFn: async () => {
      const workouts = await base44.entities.CustomWorkout.filter({ user_email: userEmail });
      const workoutIds = workouts.map(w => w.id);
      
      if (workoutIds.length === 0) return [];
      
      const allExercises = await base44.entities.CustomWorkoutExercise.list();
      return allExercises.filter(ex => workoutIds.includes(ex.custom_workout_id));
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: prRecords = [] } = useQuery({
    queryKey: ['prRecords', userEmail],
    queryFn: () => base44.entities.PRRecord.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: [],
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId) => {
      const exercises = workoutExercises.filter(ex => ex.custom_workout_id === workoutId);
      await Promise.all(exercises.map(ex => base44.entities.CustomWorkoutExercise.delete(ex.id)));
      await base44.entities.CustomWorkout.delete(workoutId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customWorkouts']);
      queryClient.invalidateQueries(['customWorkoutExercises']);
    },
  });

  const getLatestPR = (exerciseName) => {
    const exercisePRs = prRecords.filter(pr => pr.exercise_name === exerciseName);
    if (exercisePRs.length === 0) return null;
    return exercisePRs.sort((a, b) => new Date(b.data_pr) - new Date(a.data_pr))[0];
  };

  const handleOpenPRModal = (exerciseName) => {
    setSelectedExercise({ id: exerciseName, name: exerciseName });
    setPrModalOpen(true);
  };

  const handleDeleteWorkout = (workoutId) => {
    if (window.confirm("Deseja excluir este treino?")) {
      deleteWorkoutMutation.mutate(workoutId);
    }
  };

  const handleEditWorkout = (e, workout) => {
    e.stopPropagation();
    const exercises = workoutExercises
      .filter(ex => ex.custom_workout_id === workout.id)
      .sort((a, b) => a.ordem - b.ordem);
    setEditingWorkout(workout);
    setEditingExercises(exercises);
    setCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingWorkout(null);
    setEditingExercises([]);
  };

  const dayLabels = {
    segunda: "Segunda",
    terca: "Terça",
    quarta: "Quarta",
    quinta: "Quinta",
    sexta: "Sexta",
    sabado: "Sábado",
    domingo: "Domingo"
  };

  const groupedWorkouts = customWorkouts.reduce((acc, workout) => {
    if (!acc[workout.dia_semana]) acc[workout.dia_semana] = [];
    acc[workout.dia_semana].push(workout);
    return acc;
  }, {});

  const days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Meus Treinos</h2>
          <p className="text-[#CEEDB2]">Personalizados para você</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAiWizardOpen(true)}
            className="bg-gradient-to-r from-[#CEF17B] to-[#CEEDB2] hover:opacity-90 text-[#084734] font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Criar com IA
          </Button>
          <Button
            onClick={() => setCreateModalOpen(true)}
            variant="outline"
            className="border-[#CEF17B]/30 text-[#CEF17B] hover:bg-[#CEF17B]/10"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {customWorkouts.length === 0 ? (
        <Card className="glass-effect border-[#CEF17B]/20 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#CEF17B]/10 flex items-center justify-center mx-auto mb-4">
            <Dumbbell className="w-8 h-8 text-[#CEF17B]/60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum treino ainda</h3>
          <p className="text-[#CEEDB2] mb-6 text-sm">
            Use a IA para criar um plano completo personalizado para você
          </p>
          <Button
            onClick={() => setAiWizardOpen(true)}
            className="bg-gradient-to-r from-[#CEF17B] to-[#CEEDB2] hover:opacity-90 text-[#084734] font-bold"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Criar com IA
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const dayWorkouts = groupedWorkouts[day] || [];
            if (dayWorkouts.length === 0) return null;

            return (
              <div key={day} className="space-y-3">
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-sm px-3 py-1">
                  {dayLabels[day]}
                </Badge>
                {dayWorkouts.map((workout) => {
                  const exercises = workoutExercises
                    .filter(ex => ex.custom_workout_id === workout.id)
                    .sort((a, b) => a.ordem - b.ordem);
                  
                  const isExpanded = expandedWorkout === workout.id;

                  return (
                    <motion.div
                      key={workout.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                    >
                      <Card className="glass-effect border-[#CEF17B]/20 overflow-hidden">
                        <div
                          className="p-6 cursor-pointer"
                          onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                                <Dumbbell className="w-6 h-6 text-[#CEF17B]" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">
                                  {workout.nome_treino}
                                </h3>
                                <p className="text-sm text-[#CEEDB2]">
                                  {exercises.length} exercícios
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => handleEditWorkout(e, workout)}
                                className="text-[#CEF17B] hover:text-[#CEF17B]/80 hover:bg-[#CEF17B]/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteWorkout(workout.id);
                                }}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-[#CEF17B]" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-[#CEF17B]" />
                              )}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="px-6 pb-6 border-t border-white/10 pt-4 space-y-3">
                                 {exercises.map((exercise, idx) => {
                                   const latestPR = getLatestPR(exercise.exercise_name);

                                   return (
                                     <div
                                       key={idx}
                                       className="p-4 bg-white/5 rounded-lg border border-white/10"
                                     >
                                       <div className="flex items-center justify-between gap-4">
                                         <div className="flex-1">
                                           <h4 className="font-semibold text-white">
                                             {exercise.exercise_name}
                                           </h4>
                                           <div className="flex items-center gap-2 mt-1 text-sm text-[#CEEDB2]">
                                             <span>{exercise.series} séries</span>
                                             <span>•</span>
                                             <span>{exercise.repeticoes} reps</span>
                                           </div>
                                           {latestPR && (
                                             <p className="text-xs text-[#CEF17B] mt-1 flex items-center gap-1">
                                               <Trophy className="w-3 h-3" />
                                               Último PR: {latestPR.peso_kg}kg x {latestPR.repeticoes} reps
                                             </p>
                                           )}
                                           {exercise.observacoes && (
                                             <p className="text-xs text-white/60 mt-1">
                                               {exercise.observacoes}
                                             </p>
                                           )}
                                         </div>
                                         <Button
                                           size="sm"
                                           onClick={() => handleOpenPRModal(exercise.exercise_name)}
                                           className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 text-xs h-8 px-3"
                                         >
                                           <Trophy className="w-3 h-3 mr-1" />
                                           PR
                                         </Button>
                                       </div>
                                     </div>
                                   );
                                 })}
                                 <div className="pt-2">
                                   <CompleteWorkoutButton
                                     workout={workout}
                                     exercises={exercises}
                                     userEmail={userEmail}
                                     onCompleted={() => setExpandedWorkout(null)}
                                   />
                                 </div>
                               </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      <CustomWorkoutModal
        isOpen={createModalOpen}
        onClose={handleCloseModal}
        userEmail={userEmail}
        editingWorkout={editingWorkout}
        existingExercises={editingExercises}
      />

      {aiWizardOpen && (
        <AIWorkoutWizard
          userEmail={userEmail}
          onClose={() => setAiWizardOpen(false)}
          onWorkoutsGenerated={() => setAiWizardOpen(false)}
        />
      )}

      {prModalOpen && selectedExercise && (
        <PRModal
          isOpen={prModalOpen}
          onClose={() => {
            setPrModalOpen(false);
            setSelectedExercise(null);
          }}
          exercise={selectedExercise}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}