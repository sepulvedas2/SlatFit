import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dumbbell, Trophy, Trash2, ChevronDown, Edit, Sparkles, Brain, Calendar, RotateCcw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CustomWorkoutModal from "./CustomWorkoutModal";
import PRModal from "./PRModal";
import AIWorkoutWizard from "./AIWorkoutWizard";
import CompleteWorkoutButton from "./CompleteWorkoutButton";

const dayLabels = {
  segunda: "Segunda-feira", terca: "Terça-feira", quarta: "Quarta-feira",
  quinta: "Quinta-feira", sexta: "Sexta-feira", sabado: "Sábado", domingo: "Domingo"
};
const days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

export default function MyWorkouts({ userEmail }) {
  const [activeTab, setActiveTab] = useState("ai");
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
      if (workouts.length === 0) return [];
      const allExercises = await base44.entities.CustomWorkoutExercise.list();
      return allExercises.filter(ex => workouts.map(w => w.id).includes(ex.custom_workout_id));
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
      toast.success("Treino excluído");
    },
  });

  const getLatestPR = (exerciseName) => {
    const prs = prRecords.filter(pr => pr.exercise_name === exerciseName);
    if (!prs.length) return null;
    return prs.sort((a, b) => new Date(b.data_pr) - new Date(a.data_pr))[0];
  };

  const handleOpenPRModal = (exerciseName) => {
    setSelectedExercise({ id: exerciseName, name: exerciseName });
    setPrModalOpen(true);
  };

  const handleDeleteWorkout = (workoutId) => {
    if (window.confirm("Deseja excluir este treino?")) deleteWorkoutMutation.mutate(workoutId);
  };

  const handleEditWorkout = (e, workout) => {
    e.stopPropagation();
    const exercises = workoutExercises.filter(ex => ex.custom_workout_id === workout.id).sort((a, b) => a.ordem - b.ordem);
    setEditingWorkout(workout);
    setEditingExercises(exercises);
    setCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingWorkout(null);
    setEditingExercises([]);
  };

  const groupedWorkouts = customWorkouts.reduce((acc, w) => {
    if (!acc[w.dia_semana]) acc[w.dia_semana] = [];
    acc[w.dia_semana].push(w);
    return acc;
  }, {});

  return (
    <div className="space-y-6 px-1">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Meus Treinos</h2>
        <p className="text-sm text-white/40 mt-0.5">Crie, organize e acompanhe sua evolução</p>
      </div>

      {/* Cards de ação */}
      <div className="space-y-3">

        {/* Card IA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setAiWizardOpen(true)}
          className="w-full text-left rounded-3xl p-5 flex items-center gap-4 transition-all"
          style={{
            background: "linear-gradient(135deg, rgba(206,241,123,0.12) 0%, rgba(206,241,123,0.05) 100%)",
            border: "1.5px solid rgba(206,241,123,0.25)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(206,241,123,0.15)", border: "1px solid rgba(206,241,123,0.3)" }}>
            <Brain className="w-6 h-6 text-[#CEF17B]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-base font-black text-white">Treino com IA</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-[#084734]"
                style={{ background: "#CEF17B" }}>NOVO</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">Deixe a IA montar um plano personalizado para seu objetivo e nível</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
        </motion.button>

        {/* Card Manual */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setCreateModalOpen(true)}
          className="w-full text-left rounded-3xl p-5 flex items-center gap-4 transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Dumbbell className="w-6 h-6 text-white/50" />
          </div>
          <div className="flex-1">
            <p className="text-base font-black text-white mb-0.5">Criar Treino Manual</p>
            <p className="text-xs text-white/40 leading-relaxed">Monte seu próprio treino e acompanhe sua evolução</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
        </motion.button>
      </div>

      {/* Biblioteca */}
      {customWorkouts.length > 0 ? (
        <div className="space-y-4">
          {/* Título da seção */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white/60 uppercase tracking-wider">
              Seus Treinos ({customWorkouts.length})
            </h3>
          </div>

          {days.map((day) => {
            const dayWorkouts = groupedWorkouts[day] || [];
            if (!dayWorkouts.length) return null;

            return (
              <div key={day} className="space-y-2">
                {/* Badge do dia */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#CEF17B]/60" />
                  <span className="text-xs font-bold text-[#CEF17B]/70 uppercase tracking-wider">{dayLabels[day]}</span>
                </div>

                {dayWorkouts.map((workout) => {
                  const exercises = workoutExercises
                    .filter(ex => ex.custom_workout_id === workout.id)
                    .sort((a, b) => a.ordem - b.ordem);
                  const isExpanded = expandedWorkout === workout.id;
                  const recentPR = exercises
                    .map(ex => getLatestPR(ex.exercise_name))
                    .filter(Boolean)
                    .sort((a, b) => new Date(b.data_pr) - new Date(a.data_pr))[0];

                  return (
                    <motion.div key={workout.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div
                        className="rounded-3xl overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        {/* Card header */}
                        <div
                          className="p-4 cursor-pointer flex items-center gap-3"
                          onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                        >
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(206,241,123,0.1)", border: "1px solid rgba(206,241,123,0.2)" }}>
                            <Dumbbell className="w-5 h-5 text-[#CEF17B]" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-black text-white text-sm truncate">{workout.nome_treino}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-white/40">{exercises.length} exercícios</span>
                              {recentPR && (
                                <>
                                  <span className="text-white/20">•</span>
                                  <Trophy className="w-3 h-3 text-orange-400" />
                                  <span className="text-xs text-orange-400 truncate">{recentPR.peso_kg}kg</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={e => handleEditWorkout(e, workout)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                              <Edit className="w-3.5 h-3.5 text-white/40" />
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); handleDeleteWorkout(workout.id); }}
                              className="w-8 h-8 rounded-xl flex items-center justify-center"
                              style={{ background: "rgba(239,68,68,0.08)" }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center">
                              <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>
                        </div>

                        {/* Exercícios expandidos */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                <div className="pt-3 space-y-2">
                                  {exercises.map((exercise, idx) => {
                                    const latestPR = getLatestPR(exercise.exercise_name);
                                    return (
                                      <div key={idx} className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl"
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-bold text-white truncate">{exercise.exercise_name}</p>
                                          <div className="flex items-center gap-1.5 mt-0.5">
                                            <RotateCcw className="w-3 h-3 text-white/30" />
                                            <span className="text-xs text-white/40">{exercise.series}x{exercise.repeticoes}</span>
                                            {latestPR && (
                                              <>
                                                <span className="text-white/20">•</span>
                                                <Trophy className="w-3 h-3 text-orange-400" />
                                                <span className="text-xs text-orange-400">{latestPR.peso_kg}kg</span>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleOpenPRModal(exercise.exercise_name)}
                                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold flex-shrink-0"
                                          style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", color: "#fb923c" }}
                                        >
                                          <Trophy className="w-3 h-3" />
                                          PR
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="pt-1">
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
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-3xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(206,241,123,0.08)", border: "1px solid rgba(206,241,123,0.15)" }}>
            <Dumbbell className="w-7 h-7 text-[#CEF17B]/40" />
          </div>
          <p className="text-base font-black text-white mb-1">Nenhum treino ainda</p>
          <p className="text-xs text-white/30 mb-5">Use a IA para criar um plano completo personalizado</p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setAiWizardOpen(true)}
            className="px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 mx-auto"
            style={{ background: "#CEF17B", color: "#084734" }}
          >
            <Sparkles className="w-4 h-4" />
            Gerar com IA
          </motion.button>
        </div>
      )}

      {/* Modals */}
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
          onClose={() => { setPrModalOpen(false); setSelectedExercise(null); }}
          exercise={selectedExercise}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}