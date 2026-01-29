import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, Play, Flame } from "lucide-react";

export default function PrimaryAction({ hasCheckIn, todayWorkouts, profile }) {
  // Se já fez check-in
  if (hasCheckIn) {
    return (
      <Card className="glass-effect border-[#CEF17B]/20 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">Check-in Completo</h3>
            <p className="text-sm text-[#CEEDB2]">Continue assim! Sua jornada está registrada</p>
          </div>
        </div>
      </Card>
    );
  }

  // Se não fez check-in - AÇÃO PRINCIPAL DO DIA
  return (
    <Link to={createPageUrl("CheckIn")}>
      <Card className="gradient-card p-8 text-center cursor-pointer hover:scale-[1.02] transition-all border-[#CEF17B]/30 shadow-lg">
        <div className="w-16 h-16 rounded-full bg-[#084734]/20 flex items-center justify-center mx-auto mb-4">
          <Flame className="w-8 h-8 text-[#084734]" />
        </div>
        <h3 className="text-2xl font-bold text-[#084734] mb-2">
          Check-in Diário
        </h3>
        <p className="text-[#084734]/70 mb-6">
          Como você está hoje? Registre sua energia e humor
        </p>
        <Button size="lg" className="bg-[#084734] hover:bg-[#084734]/90 text-white w-full">
          <Play className="w-5 h-5 mr-2" />
          Começar Check-in
        </Button>
      </Card>
    </Link>
  );
}