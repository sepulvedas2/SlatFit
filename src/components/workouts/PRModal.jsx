import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function PRModal({ isOpen, onClose, exercise, userEmail }) {
  const [formData, setFormData] = useState({
    peso_kg: "",
    repeticoes: "",
    observacao: "",
    data_pr: format(new Date(), 'yyyy-MM-dd')
  });

  const queryClient = useQueryClient();

  const savePRMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.PRRecord.create({
        user_email: userEmail,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['prRecords']);
      onClose();
      setFormData({
        peso_kg: "",
        repeticoes: "",
        observacao: "",
        data_pr: format(new Date(), 'yyyy-MM-dd')
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.peso_kg || !formData.repeticoes) return;
    
    savePRMutation.mutate({
      peso_kg: parseFloat(formData.peso_kg),
      repeticoes: parseInt(formData.repeticoes),
      observacao: formData.observacao,
      data_pr: formData.data_pr
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#084734] to-[#062A1F] border-[#CEF17B]/20 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="w-6 h-6 text-[#CEF17B]" />
            Registrar PR - {exercise?.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#CEEDB2]">Peso (kg) *</Label>
              <Input
                type="number"
                step="0.5"
                placeholder="80"
                value={formData.peso_kg}
                onChange={(e) => setFormData({...formData, peso_kg: e.target.value})}
                className="bg-white/10 border-[#CEF17B]/20 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-[#CEEDB2]">Repetições *</Label>
              <Input
                type="number"
                placeholder="10"
                value={formData.repeticoes}
                onChange={(e) => setFormData({...formData, repeticoes: e.target.value})}
                className="bg-white/10 border-[#CEF17B]/20 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-[#CEEDB2]">Data do PR</Label>
            <Input
              type="date"
              value={formData.data_pr}
              onChange={(e) => setFormData({...formData, data_pr: e.target.value})}
              className="bg-white/10 border-[#CEF17B]/20 text-white"
            />
          </div>

          <div>
            <Label className="text-[#CEEDB2]">Observações</Label>
            <Textarea
              placeholder="Ex: Execução perfeita, técnica impecável..."
              value={formData.observacao}
              onChange={(e) => setFormData({...formData, observacao: e.target.value})}
              className="bg-white/10 border-[#CEF17B]/20 text-white h-20"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={savePRMutation.isPending || !formData.peso_kg || !formData.repeticoes}
              className="flex-1 bg-[#CEF17B] hover:bg-[#CEF17B]/90 text-[#084734] font-bold"
            >
              {savePRMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trophy className="w-4 h-4 mr-2" />
              )}
              Salvar PR
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="border-[#CEF17B]/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}