import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Loader2 } from "lucide-react";

export default function PRModal({ isOpen, onClose, exerciseName, onSave, currentPR }) {
  const [formData, setFormData] = useState({
    weight_kg: currentPR?.weight_kg || "",
    reps: currentPR?.reps || "",
    notes: currentPR?.notes || "",
    pr_date: currentPR?.pr_date || new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.weight_kg || !formData.reps) return;

    setSaving(true);
    await onSave(formData);
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-[#CEF17B]/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            Registrar PR - {exerciseName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Peso (kg) *</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="80"
                value={formData.weight_kg}
                onChange={(e) => setFormData({...formData, weight_kg: e.target.value})}
                className="bg-slate-800/50 border-white/10 text-white"
              />
            </div>

            <div>
              <Label className="text-gray-300">Repetições *</Label>
              <Input
                type="number"
                placeholder="12"
                value={formData.reps}
                onChange={(e) => setFormData({...formData, reps: e.target.value})}
                className="bg-slate-800/50 border-white/10 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-300">Data do PR</Label>
            <Input
              type="date"
              value={formData.pr_date}
              onChange={(e) => setFormData({...formData, pr_date: e.target.value})}
              className="bg-slate-800/50 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300">Observações (opcional)</Label>
            <Textarea
              placeholder="Ex: Execução perfeita, sem ajuda..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="bg-slate-800/50 border-white/10 text-white h-20"
            />
          </div>

          {currentPR && (
            <div className="p-3 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/20">
              <p className="text-xs text-[#CEEDB2]">PR Anterior:</p>
              <p className="text-white font-semibold">
                {currentPR.weight_kg}kg x {currentPR.reps} reps
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSave}
              disabled={saving || !formData.weight_kg || !formData.reps}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trophy className="w-4 h-4 mr-2" />
              )}
              Salvar PR
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-white/10"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}