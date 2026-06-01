import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, X, Dumbbell, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const dayLabels = {
  segunda: "Segunda-feira", terca: "Terça-feira", quarta: "Quarta-feira",
  quinta: "Quinta-feira", sexta: "Sexta-feira", sabado: "Sábado", domingo: "Domingo"
};

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  color: "white",
  padding: "0 14px",
  height: "46px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
};

export default function CustomWorkoutModal({ isOpen, onClose, userId, editingWorkout = null, existingExercises = [] }) {
  const [workoutData, setWorkoutData] = useState({ nome_treino: "", dia_semana: "segunda", observacoes: "" });
  const [exercises, setExercises] = useState([{ exercise_name: "", series: "3", repeticoes: "10", observacoes: "" }]);
  const [activeInput, setActiveInput] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (editingWorkout) {
      setWorkoutData({ nome_treino: editingWorkout.nome_treino, dia_semana: editingWorkout.dia_semana, observacoes: editingWorkout.observacoes || "" });
      if (existingExercises.length > 0) {
        setExercises(existingExercises.map(ex => ({ id: ex.id, exercise_name: ex.exercise_name, series: ex.series, repeticoes: ex.repeticoes, observacoes: ex.observacoes || "" })));
      }
    } else {
      resetForm();
    }
  }, [editingWorkout, existingExercises, isOpen]);

  const saveWorkoutMutation = useMutation({
    mutationFn: async (data) => {
      let workout;
      if (editingWorkout) {
        workout = await db.CustomWorkout.update(editingWorkout.id, data.workout);
        await Promise.all(existingExercises.map(ex => db.CustomWorkoutExercise.delete(ex.id)));
      } else {
        workout = await db.CustomWorkout.create({ user_id: userId, ...data.workout });
      }
      await Promise.all(data.exercises.map((ex, idx) =>
        db.CustomWorkoutExercise.create({
          custom_workout_id: editingWorkout ? editingWorkout.id : workout.id,
          exercise_name: ex.exercise_name,
          series: ex.series,
          repeticoes: ex.repeticoes,
          observacoes: ex.observacoes,
          ordem: idx,
        })
      ));
      return workout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customWorkouts']);
      queryClient.invalidateQueries(['customWorkoutExercises']);
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setWorkoutData({ nome_treino: "", dia_semana: "segunda", observacoes: "" });
    setExercises([{ exercise_name: "", series: "3", repeticoes: "10", observacoes: "" }]);
  };

  const addExercise = () => setExercises([...exercises, { exercise_name: "", series: "3", repeticoes: "10", observacoes: "" }]);
  const removeExercise = (i) => setExercises(exercises.filter((_, idx) => idx !== i));
  const updateExercise = (i, field, value) => {
    const next = [...exercises];
    next[i][field] = value;
    setExercises(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const valid = exercises.filter(ex => ex.exercise_name.trim() !== "");
    if (!workoutData.nome_treino || valid.length === 0) return;
    saveWorkoutMutation.mutate({ workout: workoutData, exercises: valid });
  };

  const focusStyle = (key) => activeInput === key
    ? { ...inputStyle, border: "1.5px solid rgba(206,241,123,0.5)", background: "rgba(255,255,255,0.08)" }
    : inputStyle;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0D2B22 0%, #08211A 100%)",
              border: "1px solid rgba(206,241,123,0.15)",
              borderRadius: "24px",
              maxHeight: "88vh",
            }}
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(206,241,123,0.1)", border: "1px solid rgba(206,241,123,0.2)" }}>
                    <Dumbbell className="w-5 h-5 text-[#CEF17B]" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white leading-tight">
                      {editingWorkout ? "Editar Treino" : "Criar Treino"}
                    </h2>
                    <p className="text-xs text-white/40">Monte seu treino e acompanhe sua evolução</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <X className="w-4 h-4 text-white/50" />
                </button>
              </div>
            </div>

            {/* Conteúdo com scroll */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>

              {/* Nome + Dia */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Nome do treino</label>
                  <input
                    placeholder="Ex: Peito + Tríceps"
                    value={workoutData.nome_treino}
                    onChange={e => setWorkoutData({ ...workoutData, nome_treino: e.target.value })}
                    onFocus={() => setActiveInput('nome')}
                    onBlur={() => setActiveInput(null)}
                    style={focusStyle('nome')}
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Dia da semana</label>
                  <Select value={workoutData.dia_semana} onValueChange={v => setWorkoutData({ ...workoutData, dia_semana: v })}>
                    <SelectTrigger style={{ ...inputStyle, height: "46px" }} className="text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(dayLabels).map(([k, l]) => (
                        <SelectItem key={k} value={k}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observações do treino */}
              <div>
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Observações</label>
                <textarea
                  placeholder="Ex: Foco em hipertrofia, descanso de 60–90s"
                  value={workoutData.observacoes}
                  onChange={e => setWorkoutData({ ...workoutData, observacoes: e.target.value })}
                  onFocus={() => setActiveInput('obs')}
                  onBlur={() => setActiveInput(null)}
                  rows={2}
                  style={{
                    ...inputStyle,
                    height: "auto",
                    padding: "12px 14px",
                    resize: "none",
                    lineHeight: "1.5",
                    ...(activeInput === 'obs' ? { border: "1.5px solid rgba(206,241,123,0.5)", background: "rgba(255,255,255,0.08)" } : {}),
                  }}
                />
              </div>

              {/* Exercícios */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Exercícios</span>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                    style={{ background: "rgba(206,241,123,0.12)", border: "1px solid rgba(206,241,123,0.25)", color: "#CEF17B" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar
                  </button>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {exercises.map((exercise, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-2xl p-4 space-y-3"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        {/* Header do card */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-[#CEF17B]/60 uppercase tracking-wider">
                            Exercício {idx + 1}
                          </span>
                          {exercises.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExercise(idx)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{ background: "rgba(239,68,68,0.1)" }}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}
                        </div>

                        {/* Nome do exercício */}
                        <input
                          placeholder="Nome do exercício"
                          value={exercise.exercise_name}
                          onChange={e => updateExercise(idx, 'exercise_name', e.target.value)}
                          onFocus={() => setActiveInput(`name_${idx}`)}
                          onBlur={() => setActiveInput(null)}
                          style={focusStyle(`name_${idx}`)}
                        />

                        {/* Séries + Reps */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">Séries</label>
                            <input
                              placeholder="3"
                              value={exercise.series}
                              onChange={e => updateExercise(idx, 'series', e.target.value)}
                              onFocus={() => setActiveInput(`series_${idx}`)}
                              onBlur={() => setActiveInput(null)}
                              style={{ ...focusStyle(`series_${idx}`), textAlign: "center", fontSize: "18px", fontWeight: "800" }}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">Repetições</label>
                            <input
                              placeholder="10"
                              value={exercise.repeticoes}
                              onChange={e => updateExercise(idx, 'repeticoes', e.target.value)}
                              onFocus={() => setActiveInput(`reps_${idx}`)}
                              onBlur={() => setActiveInput(null)}
                              style={{ ...focusStyle(`reps_${idx}`), textAlign: "center", fontSize: "18px", fontWeight: "800" }}
                            />
                          </div>
                        </div>

                        {/* Observações */}
                        <input
                          placeholder="Observações (opcional)"
                          value={exercise.observacoes}
                          onChange={e => updateExercise(idx, 'observacoes', e.target.value)}
                          onFocus={() => setActiveInput(`obs_${idx}`)}
                          onBlur={() => setActiveInput(null)}
                          style={focusStyle(`obs_${idx}`)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Botão CTA fixo */}
            <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <button
                onClick={handleSubmit}
                disabled={saveWorkoutMutation.isPending || !workoutData.nome_treino}
                className="w-full flex items-center justify-center gap-2.5 font-black text-base transition-all active:scale-[0.98] disabled:opacity-60"
                style={{
                  height: "52px",
                  borderRadius: "14px",
                  background: "#CEF17B",
                  color: "#084734",
                  boxShadow: "0 4px 20px rgba(206,241,123,0.25)",
                  border: "none",
                }}
              >
                {saveWorkoutMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {editingWorkout ? "Salvar Alterações" : "Criar Treino"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}