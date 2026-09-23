import React, { useEffect, useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const publishableKey =
  typeof import.meta !== "undefined"
    ? import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    : "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const DEFAULT_PLANS = [
  {
    key: "monthly",
    label: "Mensal",
    intervalLabel: "Renovação mensal",
    highlight: false,
  },
  {
    key: "semester",
    label: "Semestral",
    intervalLabel: "Renovação a cada 6 meses",
    highlight: true,
  },
  {
    key: "annual",
    label: "Anual",
    intervalLabel: "Renovação anual",
    highlight: false,
  },
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatDate(value) {
  if (!value) return "indisponivel";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function SubscriptionPaymentForm({ onComplete }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!stripe || !elements) return;

    setSubmitting(true);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/Subscription?payment=return`,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message || "Nao foi possivel confirmar o pagamento.");
      setSubmitting(false);
      return;
    }

    await onComplete();
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || !elements || submitting}
        className="h-12 w-full rounded-lg bg-[#CEF17B] font-bold text-[#080626] hover:bg-[#ddff91]"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Confirmando
          </>
        ) : (
          <>
            Confirmar pagamento
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function Subscription() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState("semester");
  const [clientSecret, setClientSecret] = useState("");
  const [notice, setNotice] = useState("");

  const plansQuery = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: api.billing.getPlans,
    retry: false,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: api.billing.getSubscription,
    retry: false,
  });
  const refetchSubscription = subscriptionQuery.refetch;

  const plans = useMemo(() => {
    const remote = plansQuery.data?.plans;
    if (Array.isArray(remote) && remote.length > 0) {
      return remote.map((plan) => ({
        ...plan,
        highlight: plan.key === "semester",
      }));
    }
    return DEFAULT_PLANS;
  }, [plansQuery.data]);

  const subscription = subscriptionQuery.data;
  const hasAccess = subscription?.hasAccess === true;

  useEffect(() => {
    if (searchParams.get("payment") === "return") {
      setNotice("Pagamento recebido. Estamos atualizando seu acesso.");
      refetchSubscription();
    }
  }, [searchParams, refetchSubscription]);

  const createSubscriptionMutation = useMutation({
    mutationFn: api.billing.createSubscription,
    onSuccess: (result) => {
      if (result?.subscription?.hasAccess) {
        queryClient.setQueryData(["billing", "subscription"], result.subscription);
        navigate("/Dashboard", { replace: true });
        return;
      }
      setClientSecret(result?.clientSecret ?? "");
      setNotice("");
    },
  });

  const portalMutation = useMutation({
    mutationFn: api.billing.createPortalSession,
    onSuccess: (result) => {
      if (result?.url) window.location.assign(result.url);
    },
    onError: (error) => {
      setNotice(error?.message || 'Nao foi possivel abrir o portal de cobranca.');
    },
  });

  const refundMutation = useMutation({
    mutationFn: api.billing.requestRefund,
    onSuccess: async (result) => {
      setClientSecret("");
      queryClient.setQueryData(["billing", "subscription"], result?.subscription ?? null);
      await subscriptionQuery.refetch();
      setNotice("Reembolso solicitado. Seu acesso foi encerrado.");
    },
  });

  const refreshUntilPaid = async () => {
    setNotice("Pagamento confirmado. Liberando seu acesso.");
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const result = await subscriptionQuery.refetch();
      if (result.data?.hasAccess) {
        queryClient.setQueryData(["billing", "subscription"], result.data);
        navigate("/Dashboard", { replace: true });
        return;
      }
      await delay(1500);
    }
    setNotice("Pagamento enviado. Se o acesso nao liberar em instantes, atualize a pagina.");
  };

  const startCheckout = (planKey) => {
    setSelectedPlan(planKey);
    setClientSecret("");
    createSubscriptionMutation.mutate(planKey);
  };

  const selectedPlanLabel =
    plans.find((plan) => plan.key === selectedPlan)?.label ?? "Selecionado";

  return (
    <div className="min-h-screen px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#CEF17B]/30 px-3 py-1 text-sm text-[#CEF17B]">
            <Crown className="h-4 w-4" />
            SlatFit Premium
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">Escolha seu plano</h1>
              <p className="mt-2 max-w-2xl text-sm text-[#CEEDB2] md:text-base">
                Entre na sua conta, assine com pagamento protegido pela Stripe e acesse o app completo.
              </p>
            </div>
            {hasAccess && (
              <Button
                onClick={() => navigate("/Dashboard")}
                className="h-11 rounded-lg bg-[#CEF17B] font-bold text-[#080626] hover:bg-[#ddff91]"
              >
                Ir para o Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {notice && (
          <div className="rounded-lg border border-[#CEF17B]/30 bg-[#CEF17B]/10 px-4 py-3 text-sm text-[#F3FFD5]">
            {notice}
          </div>
        )}

        {plansQuery.error && (
          <div className="rounded-lg border border-yellow-300/30 bg-yellow-300/10 px-4 py-3 text-sm text-yellow-100">
            Nao foi possivel carregar os planos do servidor.
          </div>
        )}

        {hasAccess ? (
          <Card className="border-[#CEF17B]/25 bg-white/95 p-6 text-[#0F1C1B]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0B3936]">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Acesso ativo
                </div>
                <h2 className="text-2xl font-bold">Seu SlatFit esta liberado</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Plano {subscription?.plan ?? "ativo"} ate {formatDate(subscription?.currentPeriodEnd)}.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  className="h-11 rounded-lg border-[#0B3936]/20"
                >
                  {portalMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
                  )}
                  {portalMutation.isPending ? 'Abrindo...' : 'Gerenciar'}
                </Button>
                {subscription?.refundEligible && (
                  <Button
                    variant="outline"
                    onClick={() => refundMutation.mutate()}
                    disabled={refundMutation.isPending}
                    className="h-11 rounded-lg border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {refundMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    Reembolsar
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr]">
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              {plans.map((plan) => {
                const selected = selectedPlan === plan.key;
                const available = plan.available !== false;
                return (
                  <button
                    key={plan.key}
                    type="button"
                    onClick={() => setSelectedPlan(plan.key)}
                    className={`rounded-lg border p-5 text-left transition ${
                      selected
                        ? "border-[#CEF17B] bg-[#CEF17B]/15"
                        : "border-white/15 bg-white/10 hover:border-[#CEF17B]/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold">{plan.label}</h2>
                          {plan.highlight && (
                            <span className="rounded-full bg-[#CEF17B] px-2 py-0.5 text-xs font-bold text-[#080626]">
                              Popular
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-[#CEEDB2]">{plan.intervalLabel}</p>
                      </div>
                      <CalendarClock className="h-5 w-5 text-[#CEF17B]" />
                    </div>
                    {!available && (
                      <p className="mt-4 text-xs text-yellow-100">
                        Configure este preco no backend para habilitar.
                      </p>
                    )}
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#CEF17B]">
                      <ShieldCheck className="h-4 w-4" />
                      Pagamento tokenizado
                    </div>
                  </button>
                );
              })}
            </div>

            <Card className="border-[#CEF17B]/25 bg-white/95 p-6 text-[#0F1C1B]">
              <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#0B3936]/70">
                  Plano {selectedPlanLabel}
                </p>
                <h2 className="mt-1 text-2xl font-bold">Finalizar assinatura</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Reembolso automático disponível por 7 dias após a compra.
                </p>
              </div>

              {!publishableKey && (
                <div className="rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  Configure VITE_STRIPE_PUBLISHABLE_KEY para exibir o formulario de pagamento.
                </div>
              )}

              {createSubscriptionMutation.error && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createSubscriptionMutation.error.message}
                </div>
              )}

              {!clientSecret && publishableKey && (
                <Button
                  onClick={() => startCheckout(selectedPlan)}
                  disabled={createSubscriptionMutation.isPending}
                  className="h-12 w-full rounded-lg bg-[#0B3936] font-bold text-white hover:bg-[#114b47]"
                >
                  {createSubscriptionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Preparando
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}

              {clientSecret && stripePromise && (
                <Elements
                  key={clientSecret}
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        borderRadius: "8px",
                        colorPrimary: "#0B3936",
                      },
                    },
                  }}
                >
                  <SubscriptionPaymentForm onComplete={refreshUntilPaid} />
                </Elements>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
