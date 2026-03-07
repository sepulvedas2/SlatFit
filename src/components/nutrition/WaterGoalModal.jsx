import React, { useState } from "react";
import { X, Droplets, Sparkles, Check, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = [1500, 2000, 2500, 3000];

export default function WaterGoalModal({ isOpen, onClose, currentGoal, onSave, userProfile, waterStreak = 0 }) {
  const [goal, setGoal] = useState(currentGoal || 2000);
  const [saved, setSaved] = useState(false);
  const [focused, setFocused] = useState(false);

  const weight = userProfile?.current_weight;
  const recommended = weight ? Math.round(weight * 35) : null;

  const handleSave = () => {
    if (goal >= 500 && goal <= 10000) {
      onSave(goal);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: "linear-gradient(180deg, #0A1F2E 0%, #071828 100%)",
              border: "1px solid rgba(96,165,250,0.2)",
              maxHeight: "88vh",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(96,165,250,0.15)", border: "1px solid rgba(96,165,250,0.3)" }}>
                    <Droplets className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white leading-tight">Meta de Hidratação</h2>
                    <p className="text-xs text-white/40">Defina sua meta diária de água</p>
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

            {/* Conteúdo */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4" style={{ WebkitOverflowScrolling: "touch" }}>

              {/* Streak */}
              {waterStreak > 0 && (
                <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)" }}>
                  <Flame className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-black text-white">{waterStreak} dias consecutivos! 🔥</p>
                    <p className="text-[11px] text-white/40">Continue mantendo o hábito</p>
                  </div>
                </div>
              )}

              {/* Meta recomendada */}
              {recommended && (
                <button
                  onClick={() => setGoal(recommended)}
                  className="w-full rounded-2xl px-4 py-3 flex items-center justify-between transition-all active:scale-[0.98]"
                  style={{
                    background: goal === recommended ? "rgba(96,165,250,0.15)" : "rgba(96,165,250,0.06)",
                    border: `1.5px solid ${goal === recommended ? "rgba(96,165,250,0.5)" : "rgba(96,165,250,0.15)"}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-blue-300">Meta recomendada para você</p>
                      <p className="text-[11px] text-white/40">{weight} kg × 35 ml = {recommended} ml</p>
                    </div>
                  </div>
                  <span className="text-base font-black text-blue-300">{recommended} ml</span>
                </button>
              )}

              {/* Input da meta */}
              <div
                className="rounded-2xl p-4 transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${focused ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-2">
                  Meta diária (ml)
                </label>
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <input
                    type="number"
                    value={goal}
                    onChange={e => setGoal(Number(e.target.value))}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    min={500}
                    max={10000}
                    step={100}
                    className="flex-1 bg-transparent text-white text-3xl font-black outline-none text-center"
                  />
                  <span className="text-white/40 font-semibold text-sm">ml</span>
                </div>
              </div>

              {/* Presets */}
              <div>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">Sugestões rápidas</p>
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map(p => (
                    <motion.button
                      key={p}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setGoal(p)}
                      className="py-3 rounded-2xl text-xs font-black transition-all"
                      style={{
                        background: goal === p ? "rgba(96,165,250,0.25)" : "rgba(255,255,255,0.05)",
                        border: `1.5px solid ${goal === p ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.1)"}`,
                        color: goal === p ? "#93c5fd" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {p >= 1000 ? `${p / 1000}L` : `${p}`}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Barra de progresso visual */}
              <div className="rounded-2xl p-4 space-y-3" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.12)" }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300">Visualização da meta</span>
                  <span className="text-xs text-white/40">{(goal / 1000).toFixed(1)} litros/dia</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(96,165,250,0.1)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #3b82f6, #06b6d4)" }}
                    animate={{ width: `${Math.min((goal / 4000) * 100, 100)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/25">
                  <span>0</span><span>1L</span><span>2L</span><span>3L</span><span>4L+</span>
                </div>
              </div>

              {/* Dica educativa */}
              <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.1)" }}>
                <p className="text-xs text-blue-300/70 leading-relaxed">
                  💡 A recomendação geral é de <strong className="text-blue-300">2 a 3 litros</strong> por dia. Ajuste conforme seu peso e nível de atividade física.
                </p>
              </div>

            </div>

            {/* Botão fixo */}
            <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={goal < 500 || goal > 10000 || saved}
                className="w-full flex items-center justify-center gap-2.5 font-black text-base rounded-2xl transition-all disabled:opacity-60"
                style={{
                  height: "52px",
                  background: saved ? "rgba(74,222,128,0.8)" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
                  boxShadow: saved ? "none" : "0 4px 20px rgba(59,130,246,0.35)",
                }}
              >
                {saved ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span className="text-white">Meta salva!</span>
                  </>
                ) : (
                  <>
                    <Droplets className="w-5 h-5 text-white" />
                    <span className="text-white">Salvar Meta</span>
                  </>
                )}
              </motion.button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}