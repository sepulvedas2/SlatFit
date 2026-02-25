import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LevelUpModal({ newRank, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!newRank) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="text-center px-8 py-10 max-w-sm mx-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#CEF17B]"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i * 30 * Math.PI) / 180) * 120,
                y: Math.sin((i * 30 * Math.PI) / 180) * 120,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 1.2, delay: 0.3 }}
              style={{ position: "absolute", top: "50%", left: "50%", marginLeft: -4, marginTop: -4 }}
            />
          ))}

          <motion.div
            animate={{ rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-8xl mb-6"
          >
            {newRank.icon}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-sm uppercase tracking-widest font-semibold mb-2"
          >
            Novo Rank Desbloqueado!
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`text-5xl font-black mb-4 ${newRank.color}`}
          >
            {newRank.label}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white/50 text-sm mb-8"
          >
            Você está evoluindo com disciplina real. Continue assim!
          </motion.p>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <Button
              onClick={onClose}
              className="bg-[#CEF17B] text-black font-bold px-8 py-3 rounded-2xl hover:bg-[#b8d960] text-base"
            >
              Continuar 🔥
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}