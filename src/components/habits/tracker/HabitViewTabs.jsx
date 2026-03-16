import React from "react";

const views = [
  { key: "plan", label: "Plano de hábitos" },
  { key: "week", label: "Planilha da semana" },
  { key: "month", label: "Planilha do mês" },
];

export default function HabitViewTabs({ activeView, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {views.map((view) => (
        <button
          key={view.key}
          onClick={() => onChange(view.key)}
          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
            activeView === view.key
              ? "border-[#CEF17B]/40 bg-[#CEF17B]/12 text-[#CEF17B]"
              : "border-white/10 bg-white/[0.03] text-white/65"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}