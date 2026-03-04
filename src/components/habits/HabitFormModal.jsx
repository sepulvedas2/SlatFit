import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { key: "treino", label: "Treino", emoji: "🏋️" },
  { key: "saude", label: "Saúde", emoji: "❤️" },
  { key: "nutricao", label: "Nutrição", emoji: "🥗" },
  { key: "mentalidade", label: "Mente", emoji: "🧘" },
  { key: "produtividade", label: "Foco", emoji: "⚡" },
];

const TYPES = [
  { key: "binary", label: "Sim/Não", desc: "Ex: Treinou hoje?" },
  { key: "quantitative", label: "Quantidade", desc: "Ex: 2 litros de água" },
  { key: "timed", label: "Tempo", desc: "Ex: 20 min de meditação" },
];

const EMOJI_OPTIONS = ["💧", "🏃", "🧘", "📚", "🥗", "😴", "💪", "🎯", "🔥", "⚡", "🌿", "🧠", "✅", "🚴", "🏊"];

const DEFAULT_HABITS = [
  { name: "Beber 2L de água", emoji: "💧", category: "saude", type: "quantitative", target_value: 2, target_unit: "litros" },
  { name: "Treinar", emoji: "💪", category: "treino", type: "binary" },
  { name: "Fazer cardio", emoji: "🏃", category: "treino", type: "timed", target_value: 30, target_unit: "min" },
  { name: "Estudar", emoji: "📚", category: "produtividade", type: "timed", target_value: 60, target_unit: "min" },
  { name: "Dormir 7h+", emoji: "😴", category: "saude", type: "timed", target_value: 420, target_unit: "min" },
  { name: "Meditar", emoji: "🧘", category: "mentalidade", type: "timed", target_value: 10, target_unit: "min" },
  { name: "Comer proteína adequada", emoji: "🥗", category: "nutricao", type: "binary" },
];

export default function HabitFormModal({ open, onClose, onSave, existingHabits = [] }) {
  const [mode, setMode] = useState("templates"); // templates | custom
  const [form, setForm] = useState({ name: "", emoji: "✅", category: "saude", type: "binary", target_value: "", target_unit: "", ideal_time: "" });
  const [saving, setSaving] = useState(false);

  const existingNames = existingHabits.map(h => h.name.toLowerCase());
  const availableDefaults = DEFAULT_HABITS.filter(h => !existingNames.includes(h.name.toLowerCase()));

  const handleSaveTemplate = async (template) => {
    setSaving(true);
    await onSave({ ...template, xp_per_completion: 10, is_native: true });
    setSaving(false);
  };

  const handleSaveCustom = async () => {
    if (!form.name) return;
    setSaving(true);
    await onSave({
      ...form,
      target_value: form.target_value ? parseFloat(form.target_value) : undefined,
      xp_per_completion: 10,
      is_native: false,
    });
    setForm({ name: "", emoji: "✅", category: "saude", type: "binary", target_value: "", target_unit: "", ideal_time: "" });
    setSaving(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg rounded-t-3xl overflow-hidden"
          style={{ background: "#0A2A20", border: "1px solid rgba(206,241,123,0.2)", maxHeight: "90vh", overflowY: "auto" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5 space-y-5 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-xl">Adicionar Hábito</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
              {[{ key: "templates", label: "⚡ Sugestões" }, { key: "custom", label: "✏️ Personalizado" }].map(t => (
                <button
                  key={t.key}
                  onClick={() => setMode(t.key)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: mode === t.key ? "rgba(206,241,123,0.15)" : "transparent",
                    color: mode === t.key ? "#CEF17B" : "rgba(255,255,255,0.5)",
                    border: mode === t.key ? "1px solid rgba(206,241,123,0.3)" : "1px solid transparent",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Templates */}
            {mode === "templates" && (
              <div className="space-y-2">
                {availableDefaults.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">Todos os hábitos sugeridos já foram adicionados!</p>
                )}
                {availableDefaults.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => handleSaveTemplate(h)}
                    disabled={saving}
                    className="w-full flex items-center justify-between p-4 rounded-2xl transition-all active:scale-98"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{h.emoji}</span>
                      <div className="text-left">
                        <p className="text-white font-semibold text-sm">{h.name}</p>
                        <p className="text-white/40 text-xs capitalize">{h.category} • {h.type === "binary" ? "Sim/Não" : h.type === "quantitative" ? `${h.target_value} ${h.target_unit}` : `${h.target_value} min`}</p>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-[#CEF17B]" />
                  </button>
                ))}
              </div>
            )}

            {/* Custom */}
            {mode === "custom" && (
              <div className="space-y-4">
                {/* Emoji picker */}
                <div>
                  <Label className="text-white/60 text-sm mb-2 block">Ícone</Label>
                  <div className="flex flex-wrap gap-2">
                    {EMOJI_OPTIONS.map(e => (
                      <button
                        key={e}
                        onClick={() => setForm(f => ({ ...f, emoji: e }))}
                        className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all"
                        style={{
                          background: form.emoji === e ? "rgba(206,241,123,0.2)" : "rgba(255,255,255,0.04)",
                          border: form.emoji === e ? "1px solid rgba(206,241,123,0.4)" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white/60 text-sm">Nome do hábito *</Label>
                  <Input placeholder="Ex: Ler 20 páginas" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1 h-12" />
                </div>

                {/* Categoria */}
                <div>
                  <Label className="text-white/60 text-sm mb-2 block">Categoria</Label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                      <button
                        key={c.key}
                        onClick={() => setForm(f => ({ ...f, category: c.key }))}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                        style={{
                          background: form.category === c.key ? "rgba(206,241,123,0.15)" : "rgba(255,255,255,0.04)",
                          color: form.category === c.key ? "#CEF17B" : "rgba(255,255,255,0.5)",
                          border: form.category === c.key ? "1px solid rgba(206,241,123,0.3)" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <span>{c.emoji}</span> {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <Label className="text-white/60 text-sm mb-2 block">Tipo</Label>
                  <div className="space-y-2">
                    {TYPES.map(t => (
                      <button
                        key={t.key}
                        onClick={() => setForm(f => ({ ...f, type: t.key }))}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                        style={{
                          background: form.type === t.key ? "rgba(206,241,123,0.1)" : "rgba(255,255,255,0.03)",
                          border: form.type === t.key ? "1px solid rgba(206,241,123,0.3)" : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <div className="text-left">
                          <p className="text-sm font-semibold" style={{ color: form.type === t.key ? "#CEF17B" : "rgba(255,255,255,0.7)" }}>{t.label}</p>
                          <p className="text-xs text-white/40">{t.desc}</p>
                        </div>
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: form.type === t.key ? "#CEF17B" : "rgba(255,255,255,0.2)" }}
                        >
                          {form.type === t.key && <div className="w-2 h-2 rounded-full bg-[#CEF17B]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meta */}
                {(form.type === "quantitative" || form.type === "timed") && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/60 text-sm">Meta</Label>
                      <Input type="number" placeholder="Ex: 2" value={form.target_value} onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1 h-12" />
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm">Unidade</Label>
                      <Input placeholder={form.type === "timed" ? "min" : "litros"} value={form.target_unit} onChange={e => setForm(f => ({ ...f, target_unit: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1 h-12" />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-white/60 text-sm">Horário ideal (opcional)</Label>
                  <Input type="time" value={form.ideal_time} onChange={e => setForm(f => ({ ...f, ideal_time: e.target.value }))} className="bg-white/5 border-white/10 text-white mt-1 h-12" />
                </div>

                <Button
                  onClick={handleSaveCustom}
                  disabled={saving || !form.name}
                  className="w-full h-14 rounded-2xl font-bold text-[#084734] text-base"
                  style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
                >
                  {saving ? "Salvando..." : "Criar Hábito"}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}