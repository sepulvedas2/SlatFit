import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Dumbbell, Flame } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Modal({ onClose, title, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />
      <div style={{
        position: "relative",
        background: "#0a5a40",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "70vh",
        overflowY: "auto",
        padding: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ color: "#CEF17B", fontWeight: 700, fontSize: 18, margin: 0 }}>{title}</p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X style={{ width: 22, height: 22, color: "rgba(255,255,255,0.6)" }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function WorkoutsModal({ logs, onClose }) {
  const sorted = [...logs].sort((a, b) => b.completed_date?.localeCompare(a.completed_date));
  return (
    <Modal onClose={onClose} title={`Treinos Feitos (${logs.length})`}>
      {sorted.length === 0 ? (
        <p style={{ color: "#CEEDB2", textAlign: "center", padding: "24px 0" }}>Nenhum treino registrado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sorted.map((log, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(206,241,123,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Dumbbell style={{ width: 20, height: 20, color: "#CEF17B" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "white", fontWeight: 600, fontSize: 14, margin: 0 }}>{log.workout_name}</p>
                <p style={{ color: "#CEEDB2", fontSize: 12, margin: 0 }}>
                  {log.completed_date ? format(new Date(log.completed_date), "dd 'de' MMM", { locale: ptBR }) : ""} · {log.duration_minutes || 0} min · {log.calories_burned || 0} kcal
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export function CaloriesModal({ logs, onClose }) {
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = format(d, "yyyy-MM-dd");
    const dayLogs = logs.filter(l => l.completed_date === key);
    const kcal = dayLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
    return { day: format(d, "EEE", { locale: ptBR }), kcal };
  });

  return (
    <Modal onClose={onClose} title="Kcal Queimadas (7 dias)">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={last7}>
          <XAxis dataKey="day" tick={{ fill: "#CEEDB2", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "#084734", border: "1px solid rgba(206,241,123,0.2)", borderRadius: 10, color: "#CEF17B" }}
            formatter={(v) => [`${v} kcal`, ""]}
          />
          <Bar dataKey="kcal" fill="#CEF17B" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Modal>
  );
}

export function StreakModal({ logs, onClose }) {
  const activeDates = new Set(logs.map(l => l.completed_date));
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const key = format(d, "yyyy-MM-dd");
    return { key, label: format(d, "dd"), active: activeDates.has(key) };
  });

  return (
    <Modal onClose={onClose} title="Histórico de Frequência">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 12 }}>
        {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
          <p key={d} style={{ color: "#CEEDB2", fontSize: 11, textAlign: "center", margin: 0 }}>{d}</p>
        ))}
        {days.map((d, i) => (
          <div key={i} style={{
            aspectRatio: "1",
            borderRadius: 8,
            background: d.active ? "#CEF17B" : "rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: d.active ? "#084734" : "rgba(255,255,255,0.4)" }}>{d.label}</span>
          </div>
        ))}
      </div>
      <p style={{ color: "#CEEDB2", fontSize: 12, textAlign: "center" }}>Últimos 28 dias · Verde = treino realizado</p>
    </Modal>
  );
}