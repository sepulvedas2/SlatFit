import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, AlertCircle, X } from "lucide-react";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SubscriptionStatus() {
  const [user, setUser] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

  if (!subscription || dismissed) return null;

  const daysLeft = differenceInDays(new Date(subscription.end_date), new Date());
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft <= 0;
  const isFreeTrial = subscription.plan === "free_trial";

  if (!isExpiringSoon && !isExpired) return null;

  return (
    <Alert className={`${
      isExpired 
        ? "bg-red-500/20 border-red-500/30" 
        : "bg-yellow-500/20 border-yellow-500/30"
    } relative`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-white/60 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
      
      <AlertCircle className={`w-4 h-4 ${isExpired ? "text-red-400" : "text-yellow-400"}`} />
      <AlertDescription>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className={isExpired ? "text-red-400" : "text-yellow-400"}>
            {isExpired 
              ? "Sua assinatura expirou! Renove agora para continuar aproveitando." 
              : `Seu ${isFreeTrial ? "teste grátis" : "plano"} expira em ${daysLeft} dias.`}
          </p>
          <Link to={createPageUrl(isExpired || isFreeTrial ? "Checkout" : "Subscription")}>
            <Button 
              size="sm"
              className="gradient-button text-[#084734] whitespace-nowrap"
            >
              <Crown className="w-4 h-4 mr-1" />
              {isExpired ? "Renovar Agora" : "Assinar Premium"}
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}