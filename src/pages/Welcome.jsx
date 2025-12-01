import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dumbbell, Sparkles, ChevronRight, Activity, Target, Flame } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Welcome() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          // User is logged in, check if first visit
          const hasSeenWelcome = localStorage.getItem('fitlens_welcome_seen');
          if (hasSeenWelcome) {
            navigate(createPageUrl("Dashboard"));
            return;
          }
        }
      } catch {
        // Not logged in, show welcome screen
      }
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 500);
    };
    checkAuth();
  }, [navigate]);

  const handleGetStarted = async () => {
    localStorage.setItem('fitlens_welcome_seen', 'true');
    
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      navigate(createPageUrl("Dashboard"));
    } else {
      base44.auth.redirectToLogin(createPageUrl("Dashboard"));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Dumbbell className="w-12 h-12 text-cyan-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : -30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(34, 211, 238, 0.3)",
                  "0 0 40px rgba(34, 211, 238, 0.5)",
                  "0 0 20px rgba(34, 211, 238, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
            >
              <Dumbbell className="w-12 h-12 text-white" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </motion.div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-3">
            Fit<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Lens</span>
          </h1>
          <p className="text-gray-400 text-lg">Evolua todos os dias</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-3 gap-4 mb-12 max-w-md w-full"
        >
          {[
            { icon: Activity, label: "Treinos", desc: "Personalizados" },
            { icon: Target, label: "Nutrição", desc: "Inteligente" },
            { icon: Flame, label: "Resultados", desc: "Reais" },
          ].map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="text-center p-4 rounded-xl bg-white/5 border border-cyan-500/20 backdrop-blur-sm"
            >
              <feature.icon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm">{feature.label}</p>
              <p className="text-gray-500 text-xs">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <Button
            onClick={handleGetStarted}
            className="w-full h-14 text-lg font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
          >
            Começar Agora
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            Transforme seu corpo e mente
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showContent ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-gray-600 text-xs">
            FitLens — Seu parceiro de evolução fitness
          </p>
        </motion.div>
      </div>
    </div>
  );
}