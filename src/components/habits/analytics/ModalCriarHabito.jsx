import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const COLORS = [
  { label: "Lima", value: "lime", hex: "#CEF17B" },
  { label: "Laranja", value: "orange", hex: "#FF6A00" },
  { label: "Azul", value: "blue", hex: "#60A5FA" },
  { label: "Roxo", value: "purple", hex: "#C084FC" },
  { label: "Rosa", value: "rose", hex: "#FB7185" },
  { label: "Turquesa", value: "teal", hex: "#2DD4BF" },
];

const TIMES = [
  { label: "Manhã", value: "morning" },
  { label: "Tarde", value: "afternoon" },
  { label: "Noite", value: "night" },
];

export default function ModalCriarHabito({ open, onClose, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    name: "",
    color: "lime",
    targetFrequency: 7,
    preferredTime: "morning",
    notes: "",
  });

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit(form);
    setForm({ name: "", color: "lime", targetFrequency: 7, preferredTime: "morning", notes: "" });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 24, stiffness: 240 }}
          className="flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-[28px] border border-white/10 bg-[#101716]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-5 flex items-center justify-between px-5 pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/35">Novo Hábito</p>
              <h3 className="mt-1 text-xl font-bold text-white">Adicionar hábito</h3>
            </div>
            <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white/60">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto px-5 pb-4">
            <div>
              <Label className="text-white/60">Nome do hábito</Label>
              <Input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} className="mt-2 border-white/10 bg-white/5 text-white" placeholder="Ex: Ler 10 páginas" />
            </div>
...
          </div>

          <div className="border-t border-white/10 bg-[#101716] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-4">
            <Button onClick={handleSubmit} disabled={isLoading || !form.name.trim()} className="h-12 w-full rounded-2xl bg-[#CEF17B] font-bold text-[#0B3936] hover:bg-[#bfe56b]">
              {isLoading ? "Salvando..." : "Criar hábito"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}