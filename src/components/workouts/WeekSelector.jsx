import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, CheckCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function WeekSelector({ currentWeek, onSelectWeek, weekProgress = [] }) {
  const weeks = [
    { number: 1, title: "Planilha 1", subtitle: "Iniciante", unlocked: true },
    { number: 2, title: "Planilha 2", subtitle: "Intermediário", unlocked: currentWeek >= 2 },
    { number: 3, title: "Planilha 3", subtitle: "Avançado", unlocked: currentWeek >= 3 },
    { number: 4, title: "Planilha 4", subtitle: "Expert", unlocked: currentWeek >= 4 },
    { number: 5, title: "Planilha 5", subtitle: "Feminino | Inferiores (ABC)", unlocked: true },
  ];

  const getWeekProgress = (weekNumber) => {
    const progress = weekProgress.find(p => p.week_number === weekNumber);
    return progress?.progress_percentage || 0;
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {weeks.map((week, index) => {
        const progress = getWeekProgress(week.number);
        const isActive = currentWeek === week.number;

        return (
          <motion.div
            key={week.number}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              onClick={() => week.unlocked && onSelectWeek(week.number)}
              className={`glass-effect border-[#CEF17B]/20 p-6 transition-all cursor-pointer ${
                week.unlocked ? 'hover:scale-[1.02]' : 'opacity-50 cursor-not-allowed'
              } ${isActive ? 'ring-2 ring-[#CEF17B]' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    week.unlocked ? 'bg-[#CEF17B]/20' : 'bg-white/5'
                  }`}>
                    {week.unlocked ? (
                      <span className="text-[#CEF17B] font-bold text-xl">{week.number}</span>
                    ) : (
                      <Lock className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{week.title}</h3>
                    <p className="text-sm text-[#CEEDB2]">{week.subtitle}</p>
                  </div>
                </div>

                {isActive && (
                  <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                    Atual
                  </Badge>
                )}
              </div>

              {week.unlocked && (
                <>
                  <Progress value={progress} className="h-2 mb-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#CEEDB2]">{Math.round(progress)}% completo</span>
                    {progress === 100 && (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Concluído</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {!week.unlocked && (
                <p className="text-xs text-white/60 mt-2">
                  Complete a planilha anterior para desbloquear
                </p>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}