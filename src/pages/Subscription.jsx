
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles, Zap, Target, Trophy, ArrowLeft, AlertCircle, Shield } from "lucide-react";
import { differenceInDays, addMonths } from "date-fns";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

export default function Subscription() {
  const [user, setUser] = useState(null);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const startDate = new Date();
      const endDate = addMonths(startDate, 1);
      
      return base44.entities.Subscription.create({
        user_email: user.email,
        plan: "free_trial",
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        is_active: true,
        auto_renew: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.Subscription.update(subscription.id, {
        auto_renew: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });

  const handleStartTrial = async () => {
    setProcessing(true);
    await createSubscriptionMutation.mutateAsync();
    setProcessing(false);
    navigate(createPageUrl("Dashboard"));
  };

  const handleUpgrade = () => {
    navigate(createPageUrl("Checkout"));
  };

  const handleCancelSubscription = async () => {
    if (window.confirm("Tem certeza que deseja cancelar a renovação automática?")) {
      setProcessing(true);
      await cancelSubscriptionMutation.mutateAsync();
      setProcessing(false);
    }
  };

  const isPremium = subscription?.plan === "premium";
  const isFreeTrial = subscription?.plan === "free_trial";
  const daysLeft = subscription?.end_date 
    ? differenceInDays(new Date(subscription.end_date), new Date())
    : 30;
  const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;

  const features = [
    { icon: Sparkles, text: "Scanner de alimentos ilimitado com IA" },
    { icon: Zap, text: "105 treinos personalizados" },
    { icon: Target, text: "Planos alimentares customizados" },
    { icon: Trophy, text: "Sistema de conquistas e gamificação" },
    { icon: Crown, text: "Suporte prioritário 24/7" },
    { icon: Check, text: "Relatórios detalhados de progresso" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="glass-effect border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Assinatura Premium</h1>
            <p className="text-[#CEEDB2] mt-1">Evolua seu treino com FitLens IA</p>
          </div>
        </div>

        {/* Alerta de expiração */}
        {isExpiringSoon && isFreeTrial && (
          <Alert className="bg-yellow-500/20 border-yellow-500/30">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400">
              Seu teste grátis expira em {daysLeft} dias! Assine agora para continuar aproveitando todos os benefícios.
            </AlertDescription>
          </Alert>
        )}

        {subscription && (
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#CEF17B]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {isPremium ? 'Plano Premium Ativo' : 'Teste Grátis Ativo'}
                  </h3>
                  <p className="text-sm text-[#CEEDB2]">
                    {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Expirou'}
                  </p>
                  {subscription.auto_renew && isPremium && (
                    <p className="text-xs text-[#CEEDB2] mt-1">
                      Renovação automática: {format(new Date(subscription.end_date), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
              </div>
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-lg px-4 py-2">
                {isPremium ? 'R$ 19,90/mês' : 'Grátis'}
              </Badge>
            </div>

            {isPremium && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <Button
                  onClick={handleCancelSubscription}
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                  disabled={!subscription.auto_renew}
                >
                  {subscription.auto_renew ? 'Cancelar Renovação' : 'Renovação Cancelada'}
                </Button>
              </div>
            )}
          </Card>
        )}

        <Card className="relative overflow-hidden border-[#CEF17B]/20">
          <div className="absolute top-0 right-0 w-64 h-64 gradient-card rounded-full -mr-32 -mt-32 opacity-30" />
          
          <div className="relative z-10 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#CEF17B]/20 mb-4">
                <Sparkles className="w-4 h-4 text-[#CEF17B]" />
                <span className="text-sm font-semibold text-white">Plano Premium</span>
              </div>
              
              <h2 className="text-5xl font-bold text-white mb-2">
                R$ 19,90
                <span className="text-lg text-[#CEEDB2]">/mês</span>
              </h2>
              <p className="text-[#CEEDB2]">
                {!subscription ? '1 mês grátis para começar' : 'Cancele quando quiser'}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#CEF17B]/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#CEF17B]" />
                    </div>
                    <p className="text-white">{feature.text}</p>
                  </div>
                );
              })}
            </div>

            {!subscription && (
              <Button
                onClick={handleStartTrial}
                disabled={processing}
                className="w-full h-14 text-lg font-bold gradient-button text-[#084734] hover:opacity-90"
              >
                {processing ? 'Ativando...' : 'Começar Teste Grátis'}
              </Button>
            )}

            {isFreeTrial && (
              <Button
                onClick={handleUpgrade}
                disabled={processing}
                className="w-full h-14 text-lg font-bold gradient-button text-[#084734] hover:opacity-90"
              >
                {processing ? 'Processando...' : 'Assinar Agora'}
              </Button>
            )}

            {isPremium && subscription.auto_renew && (
              <div className="text-center">
                <Badge className="bg-green-500/20 text-green-400 border-0 px-6 py-3">
                  ✓ Você já é Premium!
                </Badge>
              </div>
            )}

            <p className="text-center text-xs text-[#CEEDB2] mt-4">
              Pagamento seguro • Cancele a qualquer momento
            </p>
          </div>
        </Card>

        {/* Success Stories / Testimonials */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Junte-se a mais de 10.000 usuários! 🎉
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-[#CEF17B] mb-2">98%</p>
              <p className="text-sm text-[#CEEDB2]">Satisfação</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-[#CEF17B] mb-2">-8kg</p>
              <p className="text-sm text-[#CEEDB2]">Média em 3 meses</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold text-[#CEF17B] mb-2">24/7</p>
              <p className="text-sm text-[#CEEDB2]">Suporte</p>
            </div>
          </div>
        </Card>

        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="text-xl font-bold text-white mb-4">Perguntas Frequentes</h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-white mb-1">Como funciona o teste grátis?</p>
              <p className="text-sm text-[#CEEDB2]">
                Você tem 30 dias para testar todas as funcionalidades Premium sem custo. 
                Após esse período, será cobrado R$ 19,90/mês.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Posso cancelar quando quiser?</p>
              <p className="text-sm text-[#CEEDB2]">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">Quais formas de pagamento aceitam?</p>
              <p className="text-sm text-[#CEEDB2]">
                Aceitamos cartão de crédito e PIX. Pagamento 100% seguro com criptografia.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-1">O que acontece após o teste grátis?</p>
              <p className="text-sm text-[#CEEDB2]">
                7 dias antes do fim do teste, você receberá um lembrete. Se não assinar, 
                seu acesso às funcionalidades premium será bloqueado, mas seus dados serão mantidos.
              </p>
            </div>
          </div>
        </Card>

        {/* Guarantee */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#CEF17B]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Garantia de 30 dias
          </h3>
          <p className="text-sm text-[#CEEDB2]">
            Não gostou? Devolvemos 100% do seu dinheiro, sem perguntas!
          </p>
        </Card>

      </div>
    </div>
  );
}
