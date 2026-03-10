import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trophy, Loader2, X, Dumbbell, RotateCcw, Calendar, FileText, TrendingUp, Sparkles, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

function calc1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return null;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}

export default function PRModal({ isOpen, onClose, exercise, userEmail }) {
  const [formData, setFormData] = useState({
    peso_kg: "",
    repeticoes: "",
    observacao: "",
    data_pr: format(new Date(), 'yyyy-MM-dd'),
  });
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setSaved(false);
      setShowHistory(false);
      setFormData({ peso_kg: "", repeticoes: "", observacao: "", data_pr: format(new Date(), 'yyyy-MM-dd') });
    }
  }, [isOpen]);

  const { data: prHistory = [] } = useQuery({
    queryKey: ['prRecords', exercise?.id, userEmail],
    queryFn: () => db.PRRecord.filter({ user_email: userEmail, exercise_id: exercise.id }, '-data_pr', 5),
    enabled: !!exercise?.id && !!userEmail && isOpen,
  });

  const lastPR = prHistory[0] || null;

  const savePRMutation = useMutation({
    mutationFn: async (data) => db.PRRecord.create({
      user_email: userEmail,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      ...data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['prRecords']);
      setSaved(true);
      setTimeout(() => { onClose(); setSaved(false); }, 2000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.peso_kg || !formData.repeticoes) return;
    savePRMutation.mutate({
      peso_kg: parseFloat(formData.peso_kg),
      repeticoes: parseInt(formData.repeticoes),
      observacao: formData.observacao,
      data_pr: formData.data_pr,
    });
  };

  const oneRM = calc1RM(parseFloat(formData.peso_kg), parseInt(formData.repeticoes));
  const weightDiff = lastPR && formData.peso_kg ? parseFloat(formData.peso_kg) - lastPR.peso_kg : null;
  const isNewRecord = weightDiff !== null && weightDiff > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            {/* Modal centralizado */}
            <motion.div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: "linear-gradient(180deg, #0D2B22 0%, #08211A 100%)",
                border: "1px solid rgba(206,241,123,0.15)",
                maxHeight: "88vh",
              }}
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
            >
              {/* Header fixo */}
              <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.3)" }}>
                      <Trophy className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white leading-tight">Registrar Recorde</h2>
                      <p className="text-xs text-white/40">{exercise?.name}</p>
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

                {/* Último PR */}
                {lastPR && (
                  <div className="rounded-2xl p-3" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[11px] font-bold text-orange-300 uppercase tracking-wide">Último recorde</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-lg font-black text-white">{lastPR.peso_kg} kg</span>
                        <span className="text-white/40 text-sm ml-2">• {lastPR.repeticoes} reps</span>
                      </div>
                      {isNewRecord && (
                        <span className="text-xs font-bold text-green-400 ml-auto">⬆ +{weightDiff.toFixed(1)} kg</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-3" id="pr-form">

                  {/* Peso + Reps */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl p-3 transition-all" style={{ background: "rgba(255,255,255,0.05)", border: `1.5px solid ${activeField === 'peso' ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.1)'}` }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-orange-400" />
                        <label className="text-[11px] font-semibold text-white/50">Peso (kg)</label>
                      </div>
                      <input
                        type="number"
                        step="0.5"
                        placeholder="80"
                        value={formData.peso_kg}
                        onChange={e => setFormData({ ...formData, peso_kg: e.target.value })}
                        onFocus={() => setActiveField('peso')}
                        onBlur={() => setActiveField(null)}
                        className="w-full bg-transparent text-white text-2xl font-black outline-none placeholder:text-white/20"
                        required
                      />
                    </div>

                    <div className="rounded-2xl p-3 transition-all" style={{ background: "rgba(255,255,255,0.05)", border: `1.5px solid ${activeField === 'reps' ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.1)'}` }}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                        <label className="text-[11px] font-semibold text-white/50">Repetições</label>
                      </div>
                      <input
                        type="number"
                        placeholder="10"
                        value={formData.repeticoes}
                        onChange={e => setFormData({ ...formData, repeticoes: e.target.value })}
                        onFocus={() => setActiveField('reps')}
                        onBlur={() => setActiveField(null)}
                        className="w-full bg-transparent text-white text-2xl font-black outline-none placeholder:text-white/20"
                        required
                      />
                    </div>
                  </div>

                  {/* 1RM estimado */}
                  {oneRM && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl px-4 py-3 flex items-center justify-between"
                      style={{ background: "rgba(206,241,123,0.07)", border: "1px solid rgba(206,241,123,0.15)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#CEF17B]" />
                        <span className="text-xs text-white/50">Estimativa 1RM</span>
                      </div>
                      <span className="text-lg font-black text-[#CEF17B]">≈ {oneRM} kg</span>
                    </motion.div>
                  )}

                  {/* Data */}
                  <div className="rounded-2xl p-3 transition-all" style={{ background: "rgba(255,255,255,0.05)", border: `1.5px solid ${activeField === 'data' ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.1)'}` }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-400" />
                      <label className="text-[11px] font-semibold text-white/50">Data do PR</label>
                    </div>
                    <input
                      type="date"
                      value={formData.data_pr}
                      onChange={e => setFormData({ ...formData, data_pr: e.target.value })}
                      onFocus={() => setActiveField('data')}
                      onBlur={() => setActiveField(null)}
                      className="w-full bg-transparent text-white font-bold text-sm outline-none"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>

                  {/* Observações */}
                  <div className="rounded-2xl p-3 transition-all" style={{ background: "rgba(255,255,255,0.05)", border: `1.5px solid ${activeField === 'obs' ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.1)'}` }}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-orange-400" />
                      <label className="text-[11px] font-semibold text-white/50">Observações</label>
                    </div>
                    <textarea
                      placeholder="Ex: Técnica limpa, sem falhas."
                      value={formData.observacao}
                      onChange={e => setFormData({ ...formData, observacao: e.target.value })}
                      onFocus={() => setActiveField('obs')}
                      onBlur={() => setActiveField(null)}
                      rows={2}
                      className="w-full bg-transparent text-white text-sm outline-none resize-none placeholder:text-white/20 leading-relaxed"
                    />
                  </div>

                </form>

                {/* Histórico colapsável */}
                {prHistory.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-wider w-full"
                    >
                      <span>Histórico ({prHistory.length})</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {showHistory && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-2 space-y-2"
                        >
                          {prHistory.map((pr, i) => (
                            <div key={pr.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <div>
                                <p className="text-sm font-bold text-white">{pr.peso_kg} kg <span className="text-white/40 font-normal">• {pr.repeticoes} reps</span></p>
                                {pr.data_pr && <p className="text-[11px] text-white/30">{format(new Date(pr.data_pr + 'T00:00:00'), "dd 'de' MMM yyyy", { locale: ptBR })}</p>}
                              </div>
                              {i === 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.2)" }}>
                                  <Trophy className="w-3 h-3 text-orange-400" />
                                  <span className="text-[10px] font-bold text-orange-400">TOP</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

              </div>

              {/* Botão fixo no rodapé */}
              <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <button
                  type="submit"
                  form="pr-form"
                  disabled={savePRMutation.isPending || !formData.peso_kg || !formData.repeticoes || saved}
                  onClick={handleSubmit}
                  className="w-full h-13 rounded-2xl font-black text-base flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60"
                  style={{
                    height: "52px",
                    background: saved ? "rgba(74,222,128,0.8)" : "linear-gradient(135deg, #f97316, #ea580c)",
                    boxShadow: saved ? "none" : "0 4px 20px rgba(249,115,22,0.35)",
                  }}
                >
                  {savePRMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : saved ? (
                    <>
                      <Sparkles className="w-5 h-5 text-white" />
                      <span className="text-white">Recorde salvo! 🎉</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-5 h-5 text-white" />
                      <span className="text-white">Salvar Recorde</span>
                    </>
                  )}
                </button>
              </div>

            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}