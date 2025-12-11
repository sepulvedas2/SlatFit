import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplet } from "lucide-react";

export default function WaterIntakeModal({ isOpen, onClose, onAdd }) {
  const [customAmount, setCustomAmount] = useState("");

  const handleAdd = () => {
    const amount = Number(customAmount);
    if (amount > 0 && amount <= 2000) {
      onAdd(amount);
      setCustomAmount("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#054D3B] border-[#CEF17B]/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Droplet className="w-5 h-5 text-blue-400" />
            Adicionar quantidade personalizada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm text-[#CEEDB2] mb-2 block">
              Quantidade (ml)
            </label>
            <Input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Ex: 300"
              min={1}
              max={2000}
              className="bg-white/10 border-white/20 text-white text-xl text-center"
            />
          </div>

          <Button
            onClick={handleAdd}
            disabled={!customAmount || Number(customAmount) <= 0}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
          >
            Adicionar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}