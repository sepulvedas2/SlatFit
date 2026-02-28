import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AIChatInput from "./AIChatInput";

export default function AssistantChatModal({ user, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente pessoal do FitLens. Como posso te ajudar hoje? Posso responder sobre treinos, nutrição, recuperação e muito mais!"
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
        prompt: `Você é o assistente pessoal do FitLens. Você é amigável, motivador e especialista em fitness, nutrição e bem-estar.

Contexto do usuário: ${user?.full_name || 'Usuário'} está usando o FitLens para melhorar sua saúde e fitness.

Pergunta do usuário: ${userMessage}

Instruções:
- Seja breve, direto e motivador
- Use emojis quando apropriado
- Se a pergunta for sobre treino, nutrição ou saúde, responda com base científica
- Se não souber, seja honesto mas sempre tente ajudar
- Mantenha tom amigável e encorajador
- Máximo 3-4 linhas de resposta

Responda de forma natural e útil:`,
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
                Assistente Pessoal
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                  Online
                </Badge>
              </h3>
              <p className="text-xs text-[#CEEDB2]">Seu Personal AI Trainer</p>
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.role === "user"
                    ? "bg-[#CEF17B] text-[#084734]"
                    : "bg-white/10 text-white"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl p-3">
                <Loader2 className="w-5 h-5 animate-spin text-[#CEF17B]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-[#CEF17B]/20">
          <AIChatInput
            value={input}
            onChange={setInput}
            onSend={sendMessage}
            loading={loading}
            placeholder="Digite sua pergunta..."
          />
          <p className="text-xs text-[#CEEDB2] mt-2 text-center">
            <Sparkles className="w-3 h-3 inline mr-1" />
            O assistente usa IA para te ajudar, mas não substitui orientação profissional
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}