import React, { useState, useEffect, useRef } from "react";
import * as ai from "@/api/ai";
import { MessageCircle, X } from "lucide-react";
import AIChatInput from "../chat/AIChatInput";

export default function NutritionChatButton({ userProfile }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Olá! Sou seu assistente de nutrição e treino. Me pergunte sobre alimentação, recuperação muscular, dores ou ajustes na dieta. 💪",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const res = await ai.chat({
      persona: "nutrition",
      message: userMsg.content,
      history: messages,
      context: { goal: userProfile?.goal },
    });

    setMessages(prev => [...prev, { role: "assistant", content: res }]);
    setLoading(false);
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          zIndex: 99998,
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#CEF17B",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        }}
      >
        <MessageCircle style={{ width: "26px", height: "26px", color: "#084734" }} />
      </button>

      {/* Modal deslizante */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}
        >
          {/* Overlay */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }}
          />

          {/* Panel */}
          <div
            style={{
              position: "relative",
              height: "70%",
              background: "#0a5a40",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(206,241,123,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p style={{ color: "#CEF17B", fontWeight: 700, fontSize: "16px", margin: 0 }}>
                  Assistente Nutricional
                </p>
                <p style={{ color: "rgba(206,237,178,0.7)", fontSize: "12px", margin: 0 }}>
                  Nutrição · Treino · Recuperação
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
              >
                <X style={{ width: "22px", height: "22px", color: "rgba(255,255,255,0.6)" }} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: m.role === "user" ? "#CEF17B" : "rgba(255,255,255,0.08)",
                      color: m.role === "user" ? "#084734" : "#CEEDB2",
                      fontSize: "14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex" }}>
                  <div style={{ padding: "10px 14px", background: "rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px" }}>
                    <span className="w-4 h-4 border-2 border-[#CEF17B]/40 border-t-[#CEF17B] rounded-full animate-spin block" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(206,241,123,0.2)", paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
              <AIChatInput
                value={input}
                onChange={setInput}
                onSend={send}
                loading={loading}
                placeholder="Pergunte sobre alimentação ou treino..."
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}