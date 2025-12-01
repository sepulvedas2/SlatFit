import React from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, subValue, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
    >
      <Card className="glass-effect border-[#CEF17B]/20 p-4 hover:scale-[1.02] transition-transform">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-6 h-6" />
        </div>
        <p className="text-2xl font-bold text-white mb-1">{value}</p>
        {subValue && <p className="text-xs text-[#CEF17B]">{subValue}</p>}
        <p className="text-xs text-[#CEEDB2] mt-1">{label}</p>
      </Card>
    </motion.div>
  );
}