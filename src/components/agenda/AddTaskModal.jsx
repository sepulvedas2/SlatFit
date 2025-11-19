import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, X } from "lucide-react";

export default function AddTaskModal({ isOpen, onClose, onSave }) {
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");

  const handleSave = () => {
    if (description.trim()) {
      onSave({ description: description.trim(), time: time || "00:00" });
      setDescription("");
      setTime("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#084734] border-[#CEF17B]/20 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg">Nova Tarefa</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-[#CEEDB2] mb-2 block">Descrição da tarefa</label>
            <Input
              placeholder="Ex: Treino na academia"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm text-[#CEEDB2] mb-2 block flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horário (opcional)
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!description.trim()}
              className="flex-1 gradient-button text-[#084734]"
            >
              Salvar tarefa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}