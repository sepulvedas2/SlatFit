import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplet } from "lucide-react";

export default function WaterGoalModal({ isOpen, onClose, currentGoal, onSave }) {
  const [goal, setGoal] = useState(currentGoal || 2000);

  const handleSave = () => {
    if (goal >= 500 && goal <= 10000) {
      onSave(goal);
      onClose();
    }
  };

  const presetGoals = [1500, 2000, 2500, 3000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#054D3B] border-[#CEF17B]/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplet className="w-6 h-6 text-blue-400" />
            Defina sua meta diária de hidratação
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div>
            <label className="text-sm text-[#CEEDB2] mb-2 block">
              Meta diária (ml)
            </label>
            <Input
              type="number"
              value={goal}
              onChange={(e) => setGoal(Number(e.target.value))}
              min={500}
              max={10000}
              step={100}
              className="bg-white/10 border-white/20 text-white text-xl text-center"
            />
          </div>

          <div>
            <p className="text-sm text-[#CEEDB2] mb-3">Sugestões:</p>
            <div className="grid grid-cols-2 gap-2">
              {presetGoals.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  onClick={() => setGoal(preset)}
                  className={`border-blue-400/30 hover:bg-blue-400/20 ${
                    goal === preset ? 'bg-blue-400/20 border-blue-400' : ''
                  }`}
                >
                  {preset} ml
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
            <p className="text-xs text-blue-300">
              💡 <strong>Dica:</strong> A recomendação geral é de 2 a 3 litros por dia. 
              Ajuste conforme seu peso e nível de atividade física.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={goal < 500 || goal > 10000}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          >
            Salvar Meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}