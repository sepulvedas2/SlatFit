import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import * as ai from "@/api/ai";
import { useMutation } from "@tanstack/react-query";
import AIChatInput from "./AIChatInput";

export default function PersonalAIChatModal({ user, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Sou o Seu Assistente Personal do FitnessLynx. Como posso te ajudar hoje? Posso orientar sobre treinos, nutrição, recuperação e hábitos saudáveis! 💪"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);

  const feedbackMutation = useMutation({
    mutationFn: async ({ messageIndex, feedbackType, message }) => {
      const userQuestion = messages[messageIndex - 1]?.content || "";
      return base44.entities.AIFeedback.create({
        user_id: user.id,
        message_content: message.content,
        user_question: userQuestion,
        feedback_type: feedbackType,
        feedback_date: new Date().toISOString(),
        context: `timestamp: ${message.timestamp || new Date().toISOString()}`
      });
    }
  });

  const handleFeedback = (messageIndex, feedbackType) => {
    const message = messages[messageIndex];
    feedbackMutation.mutate({ messageIndex, feedbackType, message });
    setFeedbackGiven(prev => ({ ...prev, [messageIndex]: feedbackType }));
  };

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
      // Buscar contexto do usuário
      const [profile, trainingProfile, todayNutrition, recentWorkouts] = await Promise.all([
        base44.entities.UserProfile.filter({ id: user.id }).then(p => p[0]),
        base44.entities.TrainingProfile.filter({ user_id: user.id }).then(t => t[0]).catch(() => null),
        base44.entities.NutritionData.filter({ user_id: user.id, log_date: new Date().toISOString().split('T')[0] }).then(n => n[0]).catch(() => null),
        base44.entities.WorkoutLog.filter({ user_id: user.id }).then(w => w.slice(0, 3)).catch(() => [])
      ]);

      const userContext = {
        nome: user.full_name,
        idade: profile?.age,
        objetivo: profile?.goal === 'weight_loss' ? 'Emagrecimento' : profile?.goal === 'muscle_gain' ? 'Hipertrofia' : 'Manutenção',
        nivel: profile?.fitness_level || 'Iniciante',
        peso: profile?.current_weight,
        altura: profile?.height,
        restricoes: profile?.dietary_restrictions || [],
        frequenciaTreino: profile?.training_frequency || trainingProfile?.dias_treino?.length,
        divisaoTreino: trainingProfile?.divisao_treino,
        lesoes: trainingProfile?.lesoes_ou_limitacoes || [],
        metaProteina: profile?.protein_target,
        aguaHoje: todayNutrition?.water_intake_ml,
        ultimosTreinos: recentWorkouts.map(w => w.workout_name)
      };

      const response = await ai.chat({
        persona: "personal",
        message: userMessage,
        context: {
          name: userContext.nome,
          age: userContext.idade,
          goal: profile?.goal,
          level: userContext.nivel,
          weight: userContext.peso,
          height: userContext.altura,
          restrictions: userContext.restricoes,
          frequency: userContext.frequenciaTreino,
          division: userContext.divisaoTreino,
          injuries: userContext.lesoes,
          proteinTarget: userContext.metaProteina,
          waterToday: userContext.aguaHoje,
          recentWorkouts: userContext.ultimosTreinos,
        },
      });

      const assistantMessage = { 
        role: "assistant", 
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
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
                Seu Assistente Personal
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

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-[#CEF17B] text-[#084734]'
                    : 'bg-white/10 text-white'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
                {/* Feedback buttons for assistant messages */}
                {message.role === 'assistant' && index > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs text-white/60">Foi útil?</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFeedback(index, 'positive')}
                      disabled={feedbackGiven[index]}
                      className={`h-7 px-2 ${
                        feedbackGiven[index] === 'positive' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleFeedback(index, 'negative')}
                      disabled={feedbackGiven[index]}
                      className={`h-7 px-2 ${
                        feedbackGiven[index] === 'negative' 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl p-4">
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
            Orientações gerais. Não substitui acompanhamento profissional.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}