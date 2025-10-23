import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Check, Gift } from "lucide-react";
import { addMonths, format } from "date-fns";
import { motion } from "framer-motion";

export default function WelcomeModal({ user, onClose }) {
  const [activating, setActivating] = useState(false);
  const queryClient = useQueryClient();

  const activateTrialMutation = useMutation({
    mutationFn: async () => {
      const startDate = new Date();
      const endDate = addMonths(startDate, 1);
      
      return base44.entities.Subscription.create({
        user_email: user.email,
        plan: "free_trial",
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        is_active: true,
        auto_renew: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setTimeout(() => {
        onClose();
      }, 1500);
    },
  });

  const handleActivate = async () => {
    setActivating(true);
    await activateTrialMutation.mutateAsync();
  };

  const benefits = [
    "Scanner de alimentos ilimitado",
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
              <Gift className="w-10 h-10 text-[#084734]" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo ao FitLens AI! 🎉
            </h2>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-[#CEF17B]/30 text-lg px-4 py-2 mb-3">
              <Crown className="w-4 h-4 mr-2" />
              30 Dias Premium Grátis
            </Badge>
            <p className="text-[#CEEDB2] text-sm">
              Experimente todos os recursos sem compromisso!
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-white font-semibold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#CEF17B]" />
              Incluso no seu teste:
            </p>
            <div className="space-y-2">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-[#CEEDB2]"
                >
                  <Check className="w-4 h-4 text-[#CEF17B] flex-shrink-0" />
                  <span className="text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-[#CEF17B]/10 rounded-lg p-4 border border-[#CEF17B]/20">
            <p className="text-xs text-[#CEEDB2] text-center">
              Após 30 dias: <span className="font-bold text-white">R$ 19,90/mês</span>
              <br />
              Cancele quando quiser, sem taxas!
            </p>
          </div>

          <Button
            onClick={handleActivate}
            disabled={activating || activateTrialMutation.isSuccess}
            className="w-full h-12 gradient-button text-[#084734] font-bold text-lg"
          >
            {activating ? (
              "Ativando seu período grátis..."
            ) : activateTrialMutation.isSuccess ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Ativado! Redirecionando...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Ativar Teste Grátis
              </>
            )}
          </Button>

          <p className="text-xs text-center text-white/60">
            Não solicitamos cartão para o teste grátis
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}