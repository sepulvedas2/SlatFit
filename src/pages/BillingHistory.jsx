import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Download, 
  Check, 
  Clock,
  CreditCard,
  Calendar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BillingHistory() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  // Mock payment history - in production, would fetch from database
  const paymentHistory = subscription ? [
    {
      id: "1",
      date: subscription.start_date,
      amount: 0,
      status: "completed",
      description: "Teste Grátis - 30 dias",
      method: "free_trial"
    }
  ] : [];

  const getStatusBadge = (status) => {
    switch(status) {
      case "completed":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Check className="w-3 h-3 mr-1" />
          Pago
        </Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Pendente
        </Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Profile"))}
            className="glass-effect border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Histórico de Pagamentos</h1>
            <p className="text-[#CEEDB2] mt-1">Visualize suas transações e faturas</p>
          </div>
        </div>

        {/* Current Subscription */}
        {subscription && (
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-lg mb-2">Assinatura Atual</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-[#CEEDB2]">
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {subscription.plan === "premium" ? "Plano Premium" : "Teste Grátis"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#CEEDB2]">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Válido até: {format(new Date(subscription.end_date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-lg px-4 py-2">
                {subscription.plan === "premium" ? "R$ 19,90/mês" : "Grátis"}
              </Badge>
            </div>
          </Card>
        )}

        {/* Payment History */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="font-bold text-white text-lg mb-4">Histórico de Transações</h3>
          
          {paymentHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#CEEDB2]">Nenhuma transação registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <Card key={payment.id} className="bg-white/5 border-white/10 p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">
                          {payment.description}
                        </h4>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-[#CEEDB2]">
                        {format(new Date(payment.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">
                          {payment.amount === 0 ? "Grátis" : `R$ ${payment.amount.toFixed(2)}`}
                        </p>
                        <p className="text-xs text-[#CEEDB2]">
                          {payment.method === "free_trial" ? "Teste Grátis" :
                           payment.method === "credit_card" ? "Cartão" : "PIX"}
                        </p>
                      </div>
                      {payment.status === "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Next Payment */}
        {subscription && subscription.plan === "premium" && subscription.auto_renew && (
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <h3 className="font-bold text-white text-lg mb-3">Próxima Cobrança</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#CEEDB2] text-sm mb-1">
                  Data prevista: {format(new Date(subscription.end_date), "dd/MM/yyyy")}
                </p>
                <p className="text-white font-semibold">R$ 19,90</p>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Automático
              </Badge>
            </div>
          </Card>
        )}

        {/* Help */}
        <Card className="glass-effect p-4 border-[#CEF17B]/20">
          <p className="text-sm text-[#CEEDB2] text-center">
            Dúvidas sobre pagamentos? Entre em contato com nosso suporte.
          </p>
        </Card>

      </div>
    </div>
  );
}