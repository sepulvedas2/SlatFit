import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, Loader2, Sparkles, Mic, 
  Dumbbell, Apple, Heart, Brain, X
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function IAGOChatModal({ user, onClose }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['iagoConversation', user.email],
    queryFn: async () => {
      const convs = await base44.entities.IAGOConversation.filter({ 
        user_email: user.email 
      });
      return convs[0] || null;
    },
  });

  // Fetch user context
  const { data: profile } = useQuery({
    queryKey: ['userProfile', user.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayCheckIn } = useQuery({
    queryKey: ['checkIn', user.email, today],
    queryFn: async () => {
      const checkIns = await base44.entities.DailyCheckIn.filter({
        user_email: user.email,
        check_in_date: today
      });
      return checkIns[0] || null;
    },
  });

  const { data: recentWorkouts } = useQuery({
    queryKey: ['recentWorkouts', user.email],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.slice(0, 5);
    },
    initialData: [],
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage) => {
      // Build context for AI
      const contextPrompt = `
Você é IAGO, o assistente personal trainer do FitLens AI.

CONTEXTO DO USUÁRIO:
- Nome: ${user.full_name?.split(' ')[0]}
- Objetivo: ${profile?.goal || 'não definido'}
- Peso atual: ${profile?.current_weight || '--'}kg
- Meta de peso: ${profile?.target_weight || '--'}kg
- Check-in hoje: ${todayCheckIn ? `Energia ${todayCheckIn.energy_level}/5, Humor ${todayCheckIn.mood}` : 'Não fez'}
- Últimos treinos: ${recentWorkouts.length} completados recentemente

HISTÓRICO DA CONVERSA:
${(conversation?.messages || []).slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

MENSAGEM DO USUÁRIO:
${userMessage}

INSTRUÇÕES:
1. Responda de forma CURTA e DIRETA (máximo 3 linhas)
2. Seja empático e motivador como um personal trainer
3. Use o nome do usuário naturalmente
4. Se for pergunta técnica, seja objetivo
5. Se for motivacional, seja encorajador mas realista
6. Termine com uma sugestão de ação quando apropriado
7. SEM emojis excessivos (máximo 1)

Responda ao usuário:`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: false
      });

      const newMessages = [
        ...(conversation?.messages || []),
        {
          role: "user",
          content: userMessage,
          timestamp: new Date().toISOString()
        },
        {
          role: "assistant",
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ];

      if (conversation) {
        return base44.entities.IAGOConversation.update(conversation.id, {
          messages: newMessages,
          last_message_date: new Date().toISOString(),
          context_snapshot: {
            profile,
            todayCheckIn,
            recentWorkouts: recentWorkouts.length
          }
        });
      } else {
        return base44.entities.IAGOConversation.create({
          user_email: user.email,
          messages: newMessages,
          last_message_date: new Date().toISOString(),
          context_snapshot: {
            profile,
            todayCheckIn,
            recentWorkouts: recentWorkouts.length
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['iagoConversation']);
      setMessage("");
    },
  });

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    setSending(true);
    try {
      await sendMessageMutation.mutateAsync(message);
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  const quickQuestions = [
    { icon: Dumbbell, text: "Qual treino fazer hoje?", query: "Qual treino você recomenda para hoje?" },
    { icon: Apple, text: "O que comer pós-treino?", query: "O que devo comer depois do treino?" },
    { icon: Heart, text: "Estou sem motivação", query: "Estou sem motivação para treinar hoje" },
    { icon: Brain, text: "Dicas de recuperação", query: "Me dê dicas de recuperação muscular" },
  ];

  const handleQuickQuestion = (query) => {
    setMessage(query);
  };

  const messages = conversation?.messages || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full md:max-w-2xl h-[90vh] md:h-[600px] bg-[#084734] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="gradient-card p-4 flex items-center justify-between border-b border-[#084734]/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#084734] flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h3 className="font-bold text-[#084734]">IAGO</h3>
              <p className="text-xs text-[#084734]/70">Seu Personal AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-[#084734]/10"
          >
            <X className="w-5 h-5 text-[#084734]" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#084734]/5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-[#CEF17B]" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-24 h-24 rounded-full gradient-card flex items-center justify-center"
              >
                <span className="text-5xl">🤖</span>
              </motion.div>
              
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Olá, {user.full_name?.split(' ')[0]}! 👋
                </h3>
                <p className="text-[#CEEDB2] text-sm mb-6">
                  Sou o IAGO, seu assistente fitness. Como posso ajudar?
                </p>
              </div>

              {/* Quick Questions */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {quickQuestions.map((q, i) => {
                  const Icon = q.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleQuickQuestion(q.query)}
                      className="p-3 rounded-lg glass-effect hover:bg-[#CEF17B]/10 transition-all text-left"
                    >
                      <Icon className="w-5 h-5 text-[#CEF17B] mb-2" />
                      <p className="text-xs text-white font-medium">{q.text}</p>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-[#CEF17B] text-[#084734]'
                        : 'glass-effect text-white'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3 h-3 text-[#CEF17B]" />
                        <span className="text-xs font-semibold text-[#CEF17B]">IAGO</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-[#084734]/60' : 'text-white/60'
                    }`}>
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </p>
                  </div>
                </motion.div>
              ))}

              {sending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="glass-effect rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-[#CEF17B]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-[#084734]/10 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-[#CEF17B]/10"
              title="Mensagem de voz (em breve)"
            >
              <Mic className="w-5 h-5 text-white/60" />
            </Button>
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre treino, nutrição..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              disabled={sending}
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="gradient-button text-[#084734]"
              size="icon"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>

          <p className="text-xs text-white/40 mt-2 text-center">
            IAGO pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}