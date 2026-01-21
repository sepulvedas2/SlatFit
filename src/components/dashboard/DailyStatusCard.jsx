import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DailyStatusCard({ completedGoals, totalGoals }) {
  const progress = (completedGoals / totalGoals) * 100;
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <Link to={createPageUrl("DailySummary")}>
      <Card className="glass-effect p-4 border-[#CEF17B]/20 cursor-pointer hover:bg-white/5 transition-all duration-200 active:scale-[0.98]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#CEEDB2]" />
            <p className="text-[#CEEDB2] text-xs capitalize">{today}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#CEF17B]" />
            <span className="text-white font-semibold text-xs">{completedGoals}/{totalGoals}</span>
          </div>
        </div>
        
        <Progress value={progress} className="h-1.5 bg-white/10" />
        
        <p className="text-white/60 text-[10px] mt-1.5 text-center">
          {completedGoals === totalGoals 
            ? "Todas as metas concluídas" 
            : `${totalGoals - completedGoals} restante${totalGoals - completedGoals > 1 ? 's' : ''}`
          }
        </p>
      </Card>
    </Link>
  );
}