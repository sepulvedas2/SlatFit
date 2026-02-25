import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function WelcomeModal({ user, onClose }) {
  const highlights = [
    "Scanner de alimentos com IA",
    "105 treinos personalizados",
    "Planos alimentares exclusivos",
    "IA FitLens Coach motivacional",
    "Sistema de conquistas",
    "Relatórios detalhados"
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[#084734] border-[#CEF17B]/30">
        <DialogHeader>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full gradient-card flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-[#084734]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo ao FitLens AI! 🎉
            </h2>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-[#CEEDB2] text-sm text-center">
            Seu perfil foi criado! Explore todos os recursos disponíveis.
          </p>

          <div className="space-y-3">
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CEF17B]" />
              O que você pode fazer:
            </p>
            <div className="space-y-2">
              {highlights.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 text-[#CEEDB2]"
                >
                  <Check className="w-4 h-4 text-[#CEF17B] flex-shrink-0" />
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-12 bg-[#CEF17B] hover:bg-[#b8e05a] text-[#084734] font-bold text-lg"
          >
            Começar Agora 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}