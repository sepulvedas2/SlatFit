import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function HeroHeader({ user }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.full_name?.split(" ")[0] || "Atleta";
  const dateStr = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="pt-2 pb-1">
      <p className="text-[#CEEDB2] text-sm capitalize">{dateStr}</p>
      <h1 className="text-3xl font-black text-white mt-1">
        {greeting}, {firstName} 👋
      </h1>
    </div>
  );
}