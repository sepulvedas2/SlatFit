import React, { useState } from "react";
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

export default function HabitCreateScreen({ open, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    color: "lime",
    frequency: 7,
    preferredTime: "morning",
    notes: "",
  });

  if (!open) return null;

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form);
    setForm({ name: "", color: "lime", frequency: 7, preferredTime: "morning", notes: "" });
  };

  return (
    <div className="fixed inset-0 bg-[#0F1C1B]" style={{ zIndex: 100001 }}>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-6">
          <h2 className="text-2xl font-bold text-white">Adicionar hábito</h2>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-white/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
          <div className="space-y-5">
            <div>
              <Label className="text-white/60">Nome do hábito</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Ler 10 páginas"
                className="mt-2 border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Cor do hábito</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setForm((prev) => ({ ...prev, color: color.value }))}
                    className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm ${form.color === color.value ? "border-white/30 bg-white/10 text-white" : "border-white/10 bg-white/[0.03] text-white/60"}`}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color.hex }} />
                    {color.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/60">Frequência alvo (dias por semana)</Label>
              <Input
                type="number"
                min="1"
                max="7"
                value={form.frequency}
                onChange={(e) => setForm((prev) => ({ ...prev, frequency: Number(e.target.value) }))}
                className="mt-2 border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <Label className="text-white/60">Melhor horário do dia</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {TIMES.map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setForm((prev) => ({ ...prev, preferredTime: time.value }))}
                    className={`rounded-2xl border px-3 py-3 text-sm ${form.preferredTime === time.value ? "border-[#CEF17B]/40 bg-[#CEF17B]/12 text-[#CEF17B]" : "border-white/10 bg-white/[0.03] text-white/60"}`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-white/60">Observações (opcional)</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Escreva uma observação rápida sobre este hábito..."
                className="mt-2 min-h-[140px] border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#0F1C1B] px-5 pb-[calc(env(safe-area-inset-bottom,0px)+18px)] pt-4">
          <Button onClick={handleSave} disabled={isSaving || !form.name.trim()} className="h-14 w-full rounded-2xl bg-[#CEF17B] text-base font-black text-[#0B3936] hover:bg-[#bfe56b]">
            {isSaving ? "SALVANDO..." : "SALVAR HÁBITO"}
          </Button>
        </div>
      </div>
    </div>
  );
}