import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronDown, Minus, Sparkles, Send, Dumbbell, Utensils, Zap, Brain, Home } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import AIChatInput from "./AIChatInput";

const QUICK_ACTIONS = [
  { icon: "🍽️", label: "Montar refeição para meu objetivo" },
  { icon: "💪", label: "Ajustar meu treino" },
  { icon: "😣", label: "Estou com dor após treino" },
  { icon: "🔥", label: "Quantas calorias devo consumir" },
  { icon: "🥗", label: "Sugestão de refeição com o que tenho em casa" },
];

export default function SlatFitAssistant({ user, userProfile, context = "geral" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMemory, setUserMemory] = useState({});
  const endRef = useRef(null);

  const userName = user?.full_name?.split(" ")[0] || "você";
  const goal = userProfile?.goal === "weight_loss" ? "Emagrecimento"
    : userProfile?.goal === "muscle_gain" ? "Hipertrofia"
    : "Manutenção";

  const initialMessage = {
    role: "assistant",
    content: `Olá, ${userName}! Eu sou o Assistente SlatFit.\n\nPosso ajudar você com alimentação, treinos, recuperação muscular ou estratégias para atingir seu objetivo fitness.\n\nVocê pode me perguntar qualquer coisa relacionada a dieta, hipertrofia, emagrecimento ou dores pós-treino. 💪`,
  };

  const [messages, setMessages] = useState([initialMessage]);

  // Show hint after 3 seconds of being visible
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setShowHint(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Hide hint after 4 seconds
  useEffect(() => {
    if (showHint) {
      const timer = setTimeout(() => setShowHint(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showHint]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isOpen]);

  // Extract user info from messages to build memory
  const extractMemory = (text) => {
    const updated = { ...userMemory };
    const nameMatch = text.match(/meu nome [eé] ([A-Za-zÀ-ú]+)/i) || text.match(/me chamo ([A-Za-zÀ-ú]+)/i);
    if (nameMatch) updated.name = nameMatch[1];
    if (/hipertrofia|ganhar massa|ganho muscular/i.test(text)) updated.goal = "hipertrofia";
    if (/emagrecer|perder peso|emagrecimento/i.test(text)) updated.goal = "emagrecimento";
    if (/vegano|vegetariano/i.test(text)) updated.diet = text.match(/vegano|vegetariano/i)[0];
    const weightMatch = text.match(/peso\s+(\d{2,3})\s*kg/i);
    if (weightMatch) updated.weight = weightMatch[1] + "kg";
    const heightMatch = text.match(/(\d{1,3})\s*cm/i);
    if (heightMatch) updated.height = heightMatch[1] + "cm";
    setUserMemory(updated);
    return updated;
  };

  const buildMemoryContext = (mem) => {
    const parts = [];
    if (mem.name) parts.push(`Nome: ${mem.name}`);
    if (mem.goal) parts.push(`Objetivo declarado: ${mem.goal}`);
    if (mem.diet) parts.push(`Dieta: ${mem.diet}`);
    if (mem.weight) parts.push(`Peso: ${mem.weight}`);
    if (mem.height) parts.push(`Altura: ${mem.height}`);
    return parts.length ? `\nInformações memorizadas do usuário:\n${parts.join("\n")}` : "";
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const memory = extractMemory(msg);
    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    const history = newMessages
      .slice(-8)
      .map(m => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`)
      .join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Você é o Assistente SlatFit, um personal trainer digital especialista em fitness, nutrição e bem-estar.
Responda sempre em português brasileiro, de forma clara, motivadora e personalizada.
Seja breve e direto (máximo 4-5 linhas). Use o nome do usuário quando souber.

Dados do usuário:
- Nome: ${memory.name || userName}
- Objetivo principal: ${memory.goal || goal}
- Peso atual: ${userProfile?.current_weight ? userProfile.current_weight + "kg" : memory.weight || "não informado"}
- Altura: ${userProfile?.height ? userProfile.height + "cm" : memory.height || "não informada"}
- Contexto atual: ${context === "nutrition" ? "Aba de Nutrição" : context === "workout" ? "Aba de Treinos" : "Geral"}
${buildMemoryContext(memory)}

Histórico recente:
${history}

Assistente:`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: res }]);
    setLoading(false);
  };

  const panelHeight = isExpanded ? "82vh" : "52vh";

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ position: "fixed", bottom: "90px", right: "20px", zIndex: 9998 }}
          >
            {/* Hint bubble */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  style={{
                    position: "absolute",
                    right: "68px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "#084734",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                    border: "1px solid rgba(206,241,123,0.3)",
                  }}
                >
                  💬 Precisa de ajuda?
                  <div style={{
                    position: "absolute", right: "-6px", top: "50%", transform: "translateY(-50%)",
                    width: 0, height: 0,
                    borderTop: "6px solid transparent", borderBottom: "6px solid transparent",
                    borderLeft: "6px solid #084734"
                  }} />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => { setIsOpen(true); setShowHint(false); }}
              whileTap={{ scale: 0.92 }}
              style={{
                width: "56px", height: "56px", borderRadius: "50%",
                background: "linear-gradient(135deg, #CEF17B, #b8d96a)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(206,241,123,0.4), 0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <Sparkles style={{ width: "24px", height: "24px", color: "#084734" }} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 9999,
                background: "rgba(0,0,0,0.5)"
              }}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0,
                zIndex: 10000,
                height: panelHeight,
                background: "linear-gradient(180deg, #0a5a40 0%, #073d2b 100%)",
                borderTopLeftRadius: "24px",
                borderTopRightRadius: "24px",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.4)",
                border: "1px solid rgba(206,241,123,0.2)",
                borderBottom: "none",
                transition: "height 0.3s ease",
              }}
            >
              {/* Drag handle */}
              <div
                style={{ display: "flex", justifyContent: "center", padding: "10px 0 0" }}
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <div style={{ width: "40px", height: "4px", borderRadius: "2px", background: "rgba(206,241,123,0.3)", cursor: "pointer" }} />
              </div>

              {/* Header */}
              <div style={{
                padding: "12px 20px 12px",
                borderBottom: "1px solid rgba(206,241,123,0.15)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "42px", height: "42px", borderRadius: "50%",
                    background: "linear-gradient(135deg, #CEF17B, #b8d96a)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <Sparkles style={{ width: "20px", height: "20px", color: "#084734" }} />
                  </div>
                  <div>
                    <p style={{ color: "white", fontWeight: 700, fontSize: "15px", margin: 0, lineHeight: 1.2 }}>
                      Assistente SlatFit
                    </p>
                    <p style={{ color: "rgba(206,241,123,0.7)", fontSize: "11px", margin: 0 }}>
                      Nutrição • Treino • Recuperação
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                      background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
                      width: "32px", height: "32px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Minus style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.6)" }} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: "rgba(255,255,255,0.08)", border: "none", cursor: "pointer",
                      width: "32px", height: "32px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <X style={{ width: "16px", height: "16px", color: "rgba(255,255,255,0.6)" }} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1, overflowY: "auto", padding: "16px",
                display: "flex", flexDirection: "column", gap: "12px",
              }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    {m.role === "assistant" && (
                      <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "rgba(206,241,123,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginRight: "8px", flexShrink: 0, marginTop: "2px",
                      }}>
                        <Sparkles style={{ width: "14px", height: "14px", color: "#CEF17B" }} />
                      </div>
                    )}
                    <div style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: m.role === "user"
                        ? "linear-gradient(135deg, #CEF17B, #b8d96a)"
                        : "rgba(255,255,255,0.08)",
                      color: m.role === "user" ? "#084734" : "#CEEDB2",
                      fontSize: "14px", lineHeight: "1.55",
                      fontWeight: m.role === "user" ? 500 : 400,
                      whiteSpace: "pre-wrap",
                    }}>
                      {m.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "rgba(206,241,123,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Sparkles style={{ width: "14px", height: "14px", color: "#CEF17B" }} />
                    </div>
                    <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.08)", borderRadius: "4px 18px 18px 18px", display: "flex", gap: "4px" }}>
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                          style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#CEF17B" }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions — show only after first message */}
                {messages.length === 1 && !loading && (
                  <div style={{ marginTop: "4px" }}>
                    <p style={{ color: "rgba(206,237,178,0.5)", fontSize: "11px", marginBottom: "8px", textAlign: "center" }}>
                      Sugestões rápidas
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {QUICK_ACTIONS.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(action.label)}
                          style={{
                            background: "rgba(206,241,123,0.08)",
                            border: "1px solid rgba(206,241,123,0.2)",
                            borderRadius: "12px",
                            padding: "9px 14px",
                            color: "#CEEDB2",
                            fontSize: "13px",
                            cursor: "pointer",
                            textAlign: "left",
                            display: "flex", alignItems: "center", gap: "8px",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(206,241,123,0.14)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(206,241,123,0.08)"}
                        >
                          <span style={{ fontSize: "16px" }}>{action.icon}</span>
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: "10px 16px",
                paddingBottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
                borderTop: "1px solid rgba(206,241,123,0.15)",
                flexShrink: 0,
              }}>
                <AIChatInput
                  value={input}
                  onChange={setInput}
                  onSend={() => sendMessage()}
                  loading={loading}
                  placeholder="Pergunte sobre treino ou alimentação…"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}