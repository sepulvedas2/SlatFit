import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeSelector({ currentTheme, onThemeChange, isPremium }) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "default");

  const themes = [
    {
      id: "default",
      gradient: "from-[#084734] to-[#CEF17B]",
      isPremium: false
    },
    {
      id: "orange",
      gradient: "from-orange-600 to-yellow-500",
      isPremium: false
    },
    {
      id: "purple",
      gradient: "from-purple-600 to-pink-500",
      isPremium: false
    },
    {
      id: "red",
      gradient: "from-red-600 to-rose-500",
      isPremium: false
    },
    {
      id: "yellow",
      gradient: "from-yellow-500 to-amber-400",
      isPremium: false
    },
    {
      id: "blue",
      gradient: "from-blue-600 to-cyan-500",
      isPremium: false
    },
    {
      id: "pink",
      gradient: "from-pink-500 to-pink-400",
      isPremium: false
    },
    {
      id: "teal",
      gradient: "from-teal-500 to-teal-400",
      isPremium: false
    },
    {
      id: "indigo",
      gradient: "from-indigo-500 to-indigo-400",
      isPremium: false
    },
    {
      id: "emerald",
      gradient: "from-emerald-500 to-emerald-400",
      isPremium: false
    },
    {
      id: "dark",
      gradient: "from-gray-900 to-gray-800",
      isPremium: true
    },
    {
      id: "light",
      gradient: "from-gray-100 to-white",
      isPremium: true
    },
  ];

  const handleThemeSelect = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme.isPremium && !isPremium) return;

    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-5 h-5 text-[#CEF17B]" />
        <h3 className="text-xl font-bold text-white">Personalizar Tema</h3>
        <Badge className="ml-auto bg-[#CEF17B]/20 text-[#CEF17B] border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          Novo
        </Badge>
      </div>

      <p className="text-sm text-[#CEEDB2] mb-6">
        Escolha a cor do seu app
      </p>

      {/* Theme Grid - Smaller circles */}
      <div className="flex flex-wrap gap-3 mb-6">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const isLocked = theme.isPremium && !isPremium;

          return (
            <motion.button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              disabled={isLocked}
              whileHover={{ scale: isLocked ? 1 : 1.15 }}
              whileTap={{ scale: isLocked ? 1 : 0.95 }}
              className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${theme.gradient} 
                transition-all duration-300
                ${isSelected ? 'ring-4 ring-white shadow-2xl' : 'ring-2 ring-white/20'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
              `}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center"
                >
                  <Check className="w-6 h-6 text-white" />
                </motion.div>
              )}

              {isLocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  <Crown className="w-5 h-5 text-yellow-400" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Premium Unlock CTA */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30"
        >
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-sm font-semibold text-white">Desbloqueie temas exclusivos</p>
              <p className="text-xs text-white/70">Com FitLens Premium</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-xs text-[#CEEDB2] text-center">
          💡 As cores afetam o visual completo do app
        </p>
      </div>
    </Card>
  );
}