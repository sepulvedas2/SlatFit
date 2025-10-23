import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function AIFitLensCoach({ userName, streakDays, todayCalories, calorieTarget }) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    generateMotivationalMessage();
  }, [streakDays, todayCalories]);

  const generateMotivationalMessage = () => {
    const messages = {
      morning: [
        `Bom dia, ${userName}! 🌅 Hoje é dia de superar limites!`,
        `Acorda campeão(a)! 💪 O treino de hoje vai ser incrível!`,
        `Novo dia, novas conquistas! Vamos nessa, ${userName}! ⚡`
      ],
      goodProgress: [
        `Incrível, ${userName}! Você já consumiu ${Math.round((todayCalories/calorieTarget)*100)}% da meta! 🎯`,
        `Que progresso sensacional! Continue assim! 🚀`,
        `Você está arrasando hoje! Orgulho do seu esforço! 🏆`
      ],
      streak: [
        `${streakDays} treinos essa semana! Você é IMPARÁVEL! 🔥`,
        `Sequência de ${streakDays} dias! Isso é determinação pura! 💎`,
        `Consistência de campeão! ${streakDays} dias seguidos! 👑`
      ],
      motivation: [
        `Cada rep, cada série te aproxima do seu objetivo! 💪`,
        `Você não está competindo com ninguém, só com você de ontem! 📈`,
        `O corpo alcança o que a mente acredita! Acredite! ✨`
      ]
    };

    let selectedMessage;
    const hour = new Date().getHours();
    const calorieProgress = todayCalories / calorieTarget;

    if (hour < 12) {
      selectedMessage = messages.morning[Math.floor(Math.random() * messages.morning.length)];
    } else if (streakDays >= 3) {
      selectedMessage = messages.streak[Math.floor(Math.random() * messages.streak.length)];
    } else if (calorieProgress > 0.5 && calorieProgress < 1.2) {
      selectedMessage = messages.goodProgress[Math.floor(Math.random() * messages.goodProgress.length)];
    } else {
      selectedMessage = messages.motivation[Math.floor(Math.random() * messages.motivation.length)];
    }

    setMessage(selectedMessage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden gradient-card border-0 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        
        <div className="flex items-start gap-4 relative z-10">
          {/* AI Avatar */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
            className="flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#084734] to-[#CEF17B] p-1">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <div className="text-3xl">🤖</div>
              </div>
            </div>
          </motion.div>

          {/* Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#084734]" />
              <h3 className="font-bold text-[#084734]">FitLens IA</h3>
            </div>
            <p className="text-[#084734] font-medium leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Animated decoration */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#084734] to-[#CEF17B]"
          animate={{ 
            scaleX: [0.3, 1, 0.3],
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </Card>
    </motion.div>
  );
}