import React from "react";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ALL_ACHIEVEMENTS = [
  { key: "first_workout",       icon: "🏆", title: "Batismo de Suor",       desc: "Concluiu o primeiro treino" },
  { key: "streak_7",            icon: "🔥", title: "Semana Blindada",       desc: "7 dias sem interrupção" },
  { key: "streak_30",           icon: "💎", title: "Inquebrável",           desc: "30 dias seguidos" },
  { key: "early_bird",          icon: "🌅", title: "Madrugador",            desc: "Treinou antes das 07:00" },
  { key: "night_owl",           icon: "🦉", title: "Lobo Solitário",        desc: "Treinou após as 22:00" },
  { key: "hydro_master",        icon: "💧", title: "Hidro-Mestre",          desc: "Meta de água por 5 dias" },
  { key: "1000_calories",       icon: "⚡", title: "Queima Épica",          desc: "+1000 kcal em um dia" },
  { key: "phoenix",             icon: "🦅", title: "Fênix",                 desc: "Voltou após 7 dias de hiato" },
  { key: "weekend_warrior",     icon: "🛡️", title: "Guerreiro de FDS",      desc: "Treinou sábado e domingo" },
  { key: "perfect_week",        icon: "⭐", title: "Fiel ao Plano",         desc: "Completou todos os treinos da semana" },
  { key: "mass_master",         icon: "💪", title: "Mestre da Massa",       desc: "5000 XP em Ganho de Massa" },
  { key: "consistency_bronze",  icon: "🥉", title: "Consistência Bronze",   desc: "15 treinos totais" },
  { key: "consistency_silver",  icon: "🥈", title: "Consistência Prata",    desc: "50 treinos totais" },
  { key: "100_workouts",        icon: "🥇", title: "Consistência Ouro",     desc: "100 treinos totais" },
  { key: "explorer",            icon: "🗺️", title: "Explorador",            desc: "Testou 3 tipos de treinos" },
  { key: "level_elite",         icon: "👑", title: "Nível Elite",           desc: "Alcançou o Nível 10" },
];

export default function AchievementsGrid({ achievements = [] }) {
  const unlockedKeys = new Set(achievements.map(a => a.achievement_type));
  const unlockedCount = ALL_ACHIEVEMENTS.filter(a => unlockedKeys.has(a.key)).length;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white font-bold">Conquistas</h3>
        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs ml-auto">
          {unlockedCount}/{ALL_ACHIEVEMENTS.length}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ALL_ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedKeys.has(ach.key);
          return (
            <div
              key={ach.key}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                unlocked
                  ? "bg-[#CEF17B]/10 border border-[#CEF17B]/20"
                  : "bg-white/3 border border-white/5 opacity-40"
              }`}
            >
              <span className={`text-2xl ${unlocked ? "" : "grayscale"}`} style={{ filter: unlocked ? "none" : "grayscale(1)" }}>
                {ach.icon}
              </span>
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${unlocked ? "text-white" : "text-white/50"}`}>{ach.title}</p>
                <p className="text-[10px] text-[#CEEDB2]/60 truncate">{ach.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}