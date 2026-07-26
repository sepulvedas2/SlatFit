import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initialsFromName } from "@/components/profile/ProfileAvatarPicker";

export default function HeroHeader({ user, avatarUrl }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user?.full_name?.split(" ")[0] || "Atleta";
  const dateStr = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <Avatar className="h-12 w-12 shrink-0 ring-2 ring-[#CEF17B]/35">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={firstName} className="object-cover" />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-[#CEF17B]/35 to-[#084734] text-sm font-bold text-[#CEF17B]">
          {initialsFromName(user?.full_name || firstName)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-[#CEEDB2] text-sm capitalize">{dateStr}</p>
        <h1 className="text-3xl font-black text-white mt-1 truncate">
          {greeting}, {firstName}
        </h1>
      </div>
    </div>
  );
}
