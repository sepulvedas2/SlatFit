import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Clock, CheckCircle, Zap, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function WorkoutSummary({ totalTime, blocksCompleted, caloriesBurned, onRestart }) {
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}min ${secs}s`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="max-w-2xl w-full"
      >
        <Card className="relative overflow-hidden border-[#CEF17B]/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#CEF17B]/20 to-transparent rounded-full -mr-32 -mt-32" />
          
          <div className="relative z-10 p-8 text-center">
            
            {/* Trophy Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold text-white mb-2">
              Treino Concluído! 🎉
            </h1>
            <p className="text-[#CEEDB2] mb-8">
              Parabéns! Você arrasou no HIIT para emagrecimento!
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-white/5 rounded-lg">
                <Clock className="w-8 h-8 text-[#CEF17B] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatTime(totalTime)}</p>
                <p className="text-xs text-[#CEEDB2]">Tempo Total</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <Flame className="w-8 h-8 text-[#CEF17B] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{caloriesBurned}</p>
                <p className="text-xs text-[#CEEDB2]">Calorias</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <CheckCircle className="w-8 h-8 text-[#CEF17B] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{blocksCompleted}</p>
                <p className="text-xs text-[#CEEDB2]">Blocos</p>
              </div>
            </div>

            {/* XP Reward */}
            <div className="mb-8 p-4 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/30">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-6 h-6 text-[#CEF17B]" />
                <div className="text-left">
                  <p className="text-lg font-bold text-white">+50 XP Ganhos!</p>
                  <p className="text-sm text-[#CEEDB2]">Continue assim para subir de nível</p>
                </div>
              </div>
            </div>

            {/* Achievements Unlocked */}
            <div className="mb-8">
              <h3 className="font-bold text-white mb-3">🏆 Conquistas</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 px-4 py-2">
                  💪 Guerreiro HIIT
                </Badge>
                <Badge className="bg-orange-500/20 text-orange-400 border-0 px-4 py-2">
                  🔥 Queimador de Gordura
                </Badge>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="mb-8 p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-[#CEEDB2] italic">
                "Seu corpo pode fazer qualquer coisa. É a sua mente que você precisa convencer."
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                variant="outline"
                className="flex-1 border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
              >
                <Home className="w-5 h-5 mr-2" />
                Voltar ao Início
              </Button>
              <Button
                onClick={onRestart}
                className="flex-1 gradient-button text-[#084734]"
              >
                Repetir Treino
              </Button>
            </div>

          </div>
        </Card>
      </motion.div>
    </div>
  );
}