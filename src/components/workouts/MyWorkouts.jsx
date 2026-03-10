import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
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
    queryFn: () => db.CustomWorkout.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: workoutExercises = [] } = useQuery({
    queryKey: ['customWorkoutExercises', userEmail],
    queryFn: async () => {
      const workouts = await db.CustomWorkout.filter({ user_email: userEmail });
      if (workouts.length === 0) return [];
      const allExercises = await db.CustomWorkoutExercise.list();
      return allExercises.filter(ex => workouts.map(w => w.id).includes(ex.custom_workout_id));
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: prRecords = [] } = useQuery({
    queryKey: ['prRecords', userEmail],
    queryFn: () => db.PRRecord.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: [],
  });

  const deleteWorkoutMutation = useMutation({
    mutationFn: async (workoutId) => {
      const exercises = workoutExercises.filter(ex => ex.custom_workout_id === workoutId);
      await Promise.all(exercises.map(ex => db.CustomWorkoutExercise.delete(ex.id)));
      await db.CustomWorkout.delete(workoutId);
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

  const handleDeleteWorkout = (e, workoutId) => {
    e.stopPropagation();
    deleteWorkoutMutation.mutate(workoutId);
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

  // Separar treinos por origem
  const aiWorkouts = customWorkouts.filter(w => w.source === "ai");
  const manualWorkouts = customWorkouts.filter(w => w.source === "manual" || !w.source);

  const activeWorkouts = activeTab === "ai" ? aiWorkouts : manualWorkouts;

  const groupedWorkouts = activeWorkouts.reduce((acc, w) => {
    if (!acc[w.dia_semana]) acc[w.dia_semana] = [];
    acc[w.dia_semana].push(w);
    return acc;
  }, {});

  return (
    <div className="space-y-5 px-1">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-white">Meus Treinos</h2>
        <p className="text-sm text-white/40 mt-0.5">Crie, organize e acompanhe sua evolução</p>
      </div>

      {/* Botões de ação */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setAiWizardOpen(true)}
          className="rounded-2xl p-4 flex flex-col gap-2 text-left"
          style={{ background: "linear-gradient(135deg, rgba(206,241,123,0.12), rgba(206,241,123,0.05))", border: "1.5px solid rgba(206,241,123,0.25)" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.15)" }}>
            <Brain className="w-5 h-5 text-[#CEF17B]" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight">Gerar com IA</p>
            <p className="text-[11px] text-white/40 mt-0.5">Plano personalizado</p>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setCreateModalOpen(true)}
          className="rounded-2xl p-4 flex flex-col gap-2 text-left"
          style={{ background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.1)" }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.07)" }}>
            <Dumbbell className="w-5 h-5 text-white/50" />
          </div>
          <div>
            <p className="text-sm font-black text-white leading-tight">Criar Manual</p>
            <p className="text-[11px] text-white/40 mt-0.5">Monte seu treino</p>
          </div>
        </motion.button>
      </div>

      {/* Abas */}
      <div className="flex rounded-2xl p-1 gap-1" style={{ background: "rgba(255,255,255,0.05)" }}>
        {[
          { key: "ai", label: "Treinos com IA", icon: Brain, count: aiWorkouts.length },
          { key: "manual", label: "Manuais", icon: Dumbbell, count: manualWorkouts.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={activeTab === tab.key
              ? { background: tab.key === "ai" ? "rgba(206,241,123,0.15)" : "rgba(255,255,255,0.1)", color: tab.key === "ai" ? "#CEF17B" : "white" }
              : { color: "rgba(255,255,255,0.35)" }
            }
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: activeTab === tab.key ? (tab.key === "ai" ? "rgba(206,241,123,0.2)" : "rgba(255,255,255,0.15)") : "rgba(255,255,255,0.08)", minWidth: "18px" }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de treinos */}
      {activeWorkouts.length > 0 ? (
        <div className="space-y-4">
          {days.map((day) => {
            const dayWorkouts = groupedWorkouts[day] || [];
            if (!dayWorkouts.length) return null;

            return (
              <div key={day} className="space-y-2">
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
                      <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div className="p-4 cursor-pointer flex items-center gap-3" onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}>
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: activeTab === "ai" ? "rgba(206,241,123,0.1)" : "rgba(255,255,255,0.07)", border: `1px solid ${activeTab === "ai" ? "rgba(206,241,123,0.2)" : "rgba(255,255,255,0.1)"}` }}>
                            {activeTab === "ai" ? <Brain className="w-5 h-5 text-[#CEF17B]" /> : <Dumbbell className="w-5 h-5 text-white/50" />}
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
                            <button onClick={e => handleEditWorkout(e, workout)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <Edit className="w-3.5 h-3.5 text-white/40" />
                            </button>
                            <button onClick={e => handleDeleteWorkout(e, workout.id)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
                              <Trash2 className="w-3.5 h-3.5 text-red-400/60" />
                            </button>
                            <div className="w-8 h-8 flex items-center justify-center">
                              <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </div>
                          </div>
                        </div>

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
                                  <CompleteWorkoutButton workout={workout} exercises={exercises} userEmail={userEmail} onCompleted={() => setExpandedWorkout(null)} />
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
        <div className="rounded-3xl p-8 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: activeTab === "ai" ? "rgba(206,241,123,0.08)" : "rgba(255,255,255,0.06)", border: `1px solid ${activeTab === "ai" ? "rgba(206,241,123,0.15)" : "rgba(255,255,255,0.1)"}` }}>
            {activeTab === "ai" ? <Brain className="w-7 h-7 text-[#CEF17B]/40" /> : <Dumbbell className="w-7 h-7 text-white/20" />}
          </div>
          <p className="text-base font-black text-white mb-1">
            {activeTab === "ai" ? "Nenhum treino com IA" : "Nenhum treino manual"}
          </p>
          <p className="text-xs text-white/30 mb-5">
            {activeTab === "ai" ? "Gere um plano personalizado com inteligência artificial" : "Crie seu próprio treino do zero"}
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => activeTab === "ai" ? setAiWizardOpen(true) : setCreateModalOpen(true)}
            className="px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 mx-auto"
            style={activeTab === "ai" ? { background: "#CEF17B", color: "#084734" } : { background: "rgba(255,255,255,0.1)", color: "white" }}
          >
            {activeTab === "ai" ? <><Sparkles className="w-4 h-4" /> Gerar com IA</> : <><Dumbbell className="w-4 h-4" /> Criar Treino</>}
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