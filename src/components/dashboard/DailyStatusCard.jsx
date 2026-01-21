import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, CheckCircle2 } from "lucide-react";

export default function DailyStatusCard({ completedGoals, totalGoals }) {
  const progress = (completedGoals / totalGoals) * 100;
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <Card className="glass-effect p-5 border-[#CEF17B]/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#CEEDB2]" />
          <p className="text-[#CEEDB2] text-sm capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#CEF17B]" />
          <span className="text-white font-bold text-sm">{completedGoals}/{totalGoals}</span>
        </div>
      </div>
      
      <Progress value={progress} className="h-2 bg-white/10" />
      
      <p className="text-white/70 text-xs mt-2 text-center">
        {completedGoals === totalGoals 
          ? "Todas as metas do dia concluídas!" 
          : `${totalGoals - completedGoals} meta${totalGoals - completedGoals > 1 ? 's' : ''} restante${totalGoals - completedGoals > 1 ? 's' : ''}`
        }
      </p>
    </Card>
  );
}