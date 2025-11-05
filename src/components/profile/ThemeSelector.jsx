import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Check, Sparkles, Sun, Moon, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSelector({ currentTheme, onThemeChange, isPremium }) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme || "default");
  const [previewTheme, setPreviewTheme] = useState(null);

  const themes = [
    {
      id: "default",
      name: "Verde Original",
      icon: "🌱",
      gradient: "from-[#084734] to-[#CEF17B]",
      bgColor: "#084734",
      isPremium: false
    },
    {
      id: "orange",
      name: "Energia",
      icon: "🔥",
      gradient: "from-orange-600 to-yellow-500",
      bgColor: "#ea580c",
      isPremium: false
    },
    {
      id: "purple",
      name: "Moderno",
      icon: "✨",
      gradient: "from-purple-600 to-pink-500",
      bgColor: "#9333ea",
      isPremium: false
    },
    {
      id: "red",
      name: "Força",
      icon: "💪",
      gradient: "from-red-600 to-rose-500",
      bgColor: "#dc2626",
      isPremium: false
    },
    {
      id: "yellow",
      name: "Vibrante",
      icon: "⚡",
      gradient: "from-yellow-500 to-amber-400",
      bgColor: "#eab308",
      isPremium: false
    },
    {
      id: "blue",
      name: "Serenidade",
      icon: "🌊",
      gradient: "from-blue-600 to-cyan-500",
      bgColor: "#2563eb",
      isPremium: false
    },
    {
      id: "dark",
      name: "Dark Premium",
      icon: "🌙",
      gradient: "from-gray-900 to-gray-800",
      bgColor: "#111827",
      isPremium: true
    },
    {
      id: "light",
      name: "Clean Light",
      icon: "☀️",
      gradient: "from-gray-100 to-white",
      bgColor: "#f3f4f6",
      isPremium: true
    },
  ];

  const handleThemeSelect = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme.isPremium && !isPremium) return;

    setSelectedTheme(themeId);
    onThemeChange(themeId);
  };

  const handlePreview = (themeId) => {
    setPreviewTheme(themeId);
  };

  const clearPreview = () => {
    setPreviewTheme(null);
  };

  const displayTheme = previewTheme || selectedTheme;

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-5 h-5 text-[#CEF17B]" />
        <h3 className="text-xl font-bold text-white">Personalizar Visual</h3>
        <Badge className="ml-auto bg-[#CEF17B]/20 text-[#CEF17B] border-0">
          <Sparkles className="w-3 h-3 mr-1" />
          Novo
        </Badge>
      </div>

      <p className="text-sm text-[#CEEDB2] mb-6">
        Escolha o tema que combina com você
      </p>

      {/* Theme Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.id;
          const isPreview = previewTheme === theme.id;
          const isLocked = theme.isPremium && !isPremium;

          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: themes.indexOf(theme) * 0.05
              }}
              className="relative"
            >
              <motion.button
                onClick={() => handleThemeSelect(theme.id)}
                onMouseEnter={() => !isLocked && handlePreview(theme.id)}
                onMouseLeave={clearPreview}
                disabled={isLocked}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`relative w-full aspect-square rounded-2xl bg-gradient-to-br ${theme.gradient} 
                  flex flex-col items-center justify-center gap-2 transition-all duration-300
                  ${isSelected ? 'ring-4 ring-white shadow-2xl' : 'ring-1 ring-white/20'}
                  ${isPreview && !isSelected ? 'ring-2 ring-white/50' : ''}
                  ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
                `}
              >
                <span className="text-3xl">{theme.icon}</span>
                
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </motion.div>
                )}

                {isLocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  >
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </motion.div>
                )}
              </motion.button>

              <p className={`text-xs text-center mt-2 font-medium ${
                theme.id === 'light' ? 'text-gray-800' : 'text-white'
              }`}>
                {theme.name}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Preview Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayTheme}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-2xl bg-gradient-to-br ${
            themes.find(t => t.id === displayTheme)?.gradient
          } relative overflow-hidden`}
        >
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />

          <div className="relative z-10">
            <h4 className={`text-lg font-bold mb-2 ${
              displayTheme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>
              {themes.find(t => t.id === displayTheme)?.name}
            </h4>
            <p className={`text-sm ${
              displayTheme === 'light' ? 'text-gray-600' : 'text-white/80'
            }`}>
              {previewTheme ? 'Prévia do tema' : 'Tema atual aplicado'}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Premium Unlock CTA */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-sm font-semibold text-white">Desbloqueie todos os temas</p>
                <p className="text-xs text-white/70">Com FitLens Premium</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
            >
              Assinar
            </Button>
          </div>
        </motion.div>
      )}

      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-xs text-[#CEEDB2] text-center">
          💡 Dica: As cores afetam o fundo, botões e elementos do app
        </p>
      </div>
    </Card>
  );
}