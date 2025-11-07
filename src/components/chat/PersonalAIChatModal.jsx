import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function PersonalAIChatModal({ user, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Sou o Seu Personal IA do FitLens. Como posso te ajudar hoje? Posso orientar sobre treinos, nutrição, recuperação e hábitos saudáveis!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é "Seu Personal IA", o assistente de fitness e nutrição do FitLens. Você é empático, motivador e especialista em fitness, nutrição e bem-estar.

Contexto do usuário: ${user?.full_name || 'Usuário'} está usando o FitLens para melhorar sua saúde e fitness.

Pergunta do usuário: ${userMessage}

Instruções:
- Seja breve, direto e motivador
- Use emojis quando apropriado
- Se a pergunta for sobre treino, nutrição ou saúde, responda com base científica mas de forma didática
- Se não souber, seja honesto mas sempre tente ajudar
- Mantenha tom amigável e encorajador
- Máximo 4-5 linhas de resposta
- Finalize com uma sugestão simples de ação ou reflexão
- Evite linguagem técnica demais, seja acessível

Responda de forma natural, humana e útil:`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?" 
      }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full md:max-w-2xl h-[90vh] md:h-[600px] bg-[#084734] md:rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#CEF17B]/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Seu Personal IA
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                  Online
                </Badge>
              </h3>
              <p className="text-xs text-[#CEEDB2]">Seu assistente de fitness e nutrição</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#CEF17B]/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* ... keep existing code (Messages and Input sections) */}

        {/* Input */}
        <div className="p-4 border-t border-[#CEF17B]/20">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua pergunta..."
              disabled={loading}
              className="flex-1 bg-white/10 border-[#CEF17B]/20 text-white placeholder:text-white/50"
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="gradient-button text-[#084734]"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-[#CEEDB2] mt-2 text-center">
            <Sparkles className="w-3 h-3 inline mr-1" />
            Orientações gerais. Não substitui acompanhamento profissional.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}