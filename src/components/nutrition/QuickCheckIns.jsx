import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, Coffee, Utensils, Moon, Apple } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickCheckIns({ userId, today }) {
  const checkIns = [
    { id: "sleep", icon: Moon, label: "Dormiu bem?", color: "purple" },
    { id: "breakfast", icon: Coffee, label: "Café da manhã", color: "orange" },
    { id: "lunch", icon: Utensils, label: "Almoço", color: "green" },
    { id: "dinner", icon: Apple, label: "Jantar", color: "blue" },
  ];

  const colorClasses = {
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
    green: "bg-green-500/20 text-green-400",
    blue: "bg-blue-500/20 text-blue-400"
  };

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm">Check-ins Rápidos</h3>
        <span className="text-xs text-white/60">2/4 completos</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {checkIns.map((item, index) => {
          const Icon = item.icon;
          const isChecked = index < 2; // Mock: primeiros 2 marcados

          return (
            <motion.button
              key={item.id}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-xl text-left transition-all hover:scale-105 ${
                isChecked 
                  ? 'bg-[#CEF17B]/20 border-2 border-[#CEF17B]' 
                  : 'bg-white/5 border-2 border-transparent hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${colorClasses[item.color]} flex items-center justify-center`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{item.label}</p>
                </div>
                {isChecked && (
                  <CheckCircle className="w-4 h-4 text-[#CEF17B] flex-shrink-0" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}