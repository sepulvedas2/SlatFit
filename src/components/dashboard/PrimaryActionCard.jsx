import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { CheckCircle, Sparkles } from "lucide-react";

export default function PrimaryActionCard({ hasCheckIn }) {
  if (hasCheckIn) {
    return (
      <Card className="gradient-card border-0 p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#084734]">Check-in Concluído!</h3>
            <p className="text-[#084734]/70 text-xs">
              Suas recomendações estão personalizadas para hoje
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Link to={createPageUrl("CheckIn")}>
      <Card className="gradient-card border-0 p-6 cursor-pointer hover:scale-[1.02] transition-all shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#084734]/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-7 h-7 text-[#084734]" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#084734] mb-1">
              Faça seu Check-in Diário
            </h3>
            <p className="text-[#084734]/80 text-sm">
              Personalize suas recomendações • <strong>+10 XP</strong>
            </p>
          </div>
          <Button className="bg-[#084734] text-[#CEF17B] hover:bg-[#084734]/90 font-semibold">
            Começar
          </Button>
        </div>
      </Card>
    </Link>
  );
}