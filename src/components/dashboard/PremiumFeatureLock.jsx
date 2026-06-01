import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Lock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInDays } from "date-fns";

export default function PremiumFeatureLock({ featureName, children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const subs = await base44.entities.Subscription.filter({ user_id: user.id });
      return subs[0] || null;
    },
    enabled: !!user?.id,
  });

  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";
  const isActive = subscription?.is_active && 
    differenceInDays(new Date(subscription.end_date), new Date()) > 0;

  if (isPremium && isActive) {
    return children;
  }

  return (
    <Card className="glass-effect p-8 border-[#CEF17B]/20 text-center">
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-[#CEF17B]" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {featureName} Premium
          </h3>
          <p className="text-[#CEEDB2]">
            Esta funcionalidade está disponível apenas para assinantes Premium
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Link to={createPageUrl("Subscription")}>
            <Button className="w-full gradient-button text-[#084734] font-bold">
              <Crown className="w-5 h-5 mr-2" />
              Assinar FitLens Premium
            </Button>
          </Link>
          
          <p className="text-sm text-[#CEEDB2]">
            R$ 19,90/mês • 30 dias grátis • Cancele quando quiser
          </p>
        </div>

        <div className="pt-4 space-y-2 text-left">
          <p className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#CEF17B]" />
            Benefícios Premium:
          </p>
          <ul className="text-sm text-[#CEEDB2] space-y-1 ml-6">
            <li>• Scanner de alimentos ilimitado</li>
            <li>• 105 treinos personalizados</li>
            <li>• Planos alimentares exclusivos</li>
            <li>• Relatórios detalhados</li>
            <li>• Suporte prioritário 24/7</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}