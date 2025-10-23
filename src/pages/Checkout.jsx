import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Shield, 
  Check, 
  Loader2, 
  ArrowLeft,
  Crown,
  QrCode
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { addMonths, format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Checkout() {
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pixCode, setPixCode] = useState("");
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    cpf: ""
  });

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

  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData) => {
      // Simula processamento de pagamento (em produção, chamaria API real)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const startDate = new Date();
      const endDate = addMonths(startDate, 1);
      
      if (subscription) {
        return base44.entities.Subscription.update(subscription.id, {
          plan: "premium",
          payment_method: paymentData.method,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          is_active: true,
          auto_renew: true
        });
      } else {
        return base44.entities.Subscription.create({
          user_email: user.email,
          plan: "premium",
          payment_method: paymentData.method,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          is_active: true,
          auto_renew: true
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setSuccess(true);
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    },
    onError: () => {
      setError("Erro ao processar pagamento. Verifique seus dados e tente novamente.");
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProcessing(true);

    try {
      if (paymentMethod === "credit_card") {
        // Validação básica
        if (!formData.cardNumber || !formData.cardName || !formData.expiryDate || !formData.cvv) {
          setError("Por favor, preencha todos os campos do cartão.");
          setProcessing(false);
          return;
        }
        
        await processPaymentMutation.mutateAsync({
          method: "credit_card",
          ...formData
        });
      } else {
        // PIX
        const mockPixCode = "00020126580014BR.GOV.BCB.PIX0136" + Math.random().toString(36).substring(7);
        setPixCode(mockPixCode);
        
        // Simula confirmação de pagamento PIX após 5 segundos
        setTimeout(async () => {
          await processPaymentMutation.mutateAsync({
            method: "pix"
          });
        }, 5000);
      }
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
    }
    
    setProcessing(false);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Subscription"))}
            className="glass-effect border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Finalizar Assinatura</h1>
            <p className="text-[#CEEDB2] mt-1">FitLens AI Premium - R$ 19,90/mês</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-500/20 border-green-500/30">
            <Check className="w-4 h-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Pagamento confirmado! Redirecionando...
            </AlertDescription>
          </Alert>
        )}

        {/* Resumo da Compra */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-[#CEF17B]" />
              </div>
              <div>
                <h3 className="font-bold text-white">FitLens AI Premium</h3>
                <p className="text-sm text-[#CEEDB2]">Assinatura Mensal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">R$ 19,90</p>
              <p className="text-xs text-[#CEEDB2]">por mês</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-white/70">
              <span>Subtotal</span>
              <span>R$ 19,90</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>Desconto (primeiro mês)</span>
              <span className="text-green-400">- R$ 19,90</span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-white">
              <span>Total hoje</span>
              <span>R$ 0,00</span>
            </div>
            <p className="text-xs text-[#CEEDB2] mt-2">
              * Cobrança de R$ 19,90 a partir do dia {format(addMonths(new Date(), 1), 'dd/MM/yyyy')}
            </p>
          </div>
        </Card>

        {/* Método de Pagamento */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="font-bold text-white mb-4">Método de Pagamento</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              type="button"
              onClick={() => setPaymentMethod("credit_card")}
              variant={paymentMethod === "credit_card" ? "default" : "outline"}
              className={paymentMethod === "credit_card" 
                ? "gradient-button text-[#084734]" 
                : "border-white/10 hover:bg-[#CEF17B]/10"
              }
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Cartão de Crédito
            </Button>
            
            <Button
              type="button"
              onClick={() => setPaymentMethod("pix")}
              variant={paymentMethod === "pix" ? "default" : "outline"}
              className={paymentMethod === "pix" 
                ? "gradient-button text-[#084734]" 
                : "border-white/10 hover:bg-[#CEF17B]/10"
              }
            >
              <QrCode className="w-4 h-4 mr-2" />
              PIX
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {paymentMethod === "credit_card" ? (
              <>
                <div>
                  <Label className="text-white">Número do Cartão</Label>
                  <Input
                    placeholder="0000 0000 0000 0000"
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cardNumber: formatCardNumber(e.target.value)
                    })}
                    maxLength={19}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Nome no Cartão</Label>
                  <Input
                    placeholder="NOME COMPLETO"
                    value={formData.cardName}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cardName: e.target.value.toUpperCase()
                    })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Validade</Label>
                    <Input
                      placeholder="MM/AA"
                      value={formData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setFormData({...formData, expiryDate: value});
                      }}
                      maxLength={5}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">CVV</Label>
                    <Input
                      placeholder="000"
                      type="password"
                      value={formData.cvv}
                      onChange={(e) => setFormData({
                        ...formData, 
                        cvv: e.target.value.replace(/\D/g, '')
                      })}
                      maxLength={4}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">CPF</Label>
                  <Input
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 11) value = value.slice(0, 11);
                      if (value.length >= 9) {
                        value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9);
                      } else if (value.length >= 6) {
                        value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6);
                      } else if (value.length >= 3) {
                        value = value.slice(0, 3) + '.' + value.slice(3);
                      }
                      setFormData({...formData, cpf: value});
                    }}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {!pixCode ? (
                  <div className="text-center py-8">
                    <QrCode className="w-16 h-16 mx-auto mb-4 text-[#CEF17B]" />
                    <p className="text-white mb-2">Clique em confirmar para gerar o código PIX</p>
                    <p className="text-sm text-[#CEEDB2]">
                      O código será válido por 30 minutos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="w-32 h-32 text-gray-600" />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-white">Código PIX Copia e Cola</Label>
                      <div className="flex gap-2">
                        <Input
                          value={pixCode}
                          readOnly
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <Button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(pixCode)}
                          className="gradient-button text-[#084734]"
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>

                    <Alert className="bg-blue-500/20 border-blue-500/30">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      <AlertDescription className="text-blue-400">
                        Aguardando confirmação do pagamento...
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}

            {(!pixCode || paymentMethod === "credit_card") && (
              <Button
                type="submit"
                disabled={processing}
                className="w-full h-12 gradient-button text-[#084734] font-bold"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Confirmar Pagamento Seguro
                  </>
                )}
              </Button>
            )}
          </form>
        </Card>

        {/* Segurança */}
        <Card className="glass-effect p-4 border-[#CEF17B]/20">
          <div className="flex items-center gap-3 text-sm">
            <Shield className="w-5 h-5 text-[#CEF17B]" />
            <div>
              <p className="font-semibold text-white">Pagamento 100% Seguro</p>
              <p className="text-[#CEEDB2]">
                Seus dados são criptografados e protegidos
              </p>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}