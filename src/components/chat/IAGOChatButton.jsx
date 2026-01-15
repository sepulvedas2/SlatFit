import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IAGOChatModal from "./IAGOChatModal";

export default function IAGOChatButton({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Only render if user exists
  if (!user || !user.email) {
    return null;
  }

  // Pulsar a cada 5 minutos para lembrar o usuário
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setPulse(true);
        setTimeout(() => setPulse(false), 2000);
      }
    }, 300000); // 5 minutos

    return () => clearInterval(interval);
  }, [isOpen]);

  // Listen for custom event to open chat from dashboard
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };

    window.addEventListener('openIAGOChat', handleOpenChat);
    return () => window.removeEventListener('openIAGOChat', handleOpenChat);
  }, []);

  return (
    <>
      {/* Botão Flutuante */}
      <motion.div
        className="fixed bottom-24 right-6 z-40 md:bottom-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
          animate={pulse ? {
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 0 0 rgba(206, 241, 123, 0.7)",
              "0 0 0 10px rgba(206, 241, 123, 0)",
              "0 0 0 0 rgba(206, 241, 123, 0)"
            ]
          } : {}}
          transition={{ duration: 1.5 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="h-16 w-16 rounded-full shadow-2xl gradient-button hover:scale-110 transition-transform relative overflow-hidden group"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6 text-[#084734]" />
                </motion.div>
              ) : (
                <motion.div
                  key="message"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <MessageCircle className="w-6 h-6 text-[#084734]" />
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#CEF17B] to-[#CEEDB2] opacity-0 group-hover:opacity-20 transition-opacity" />
          </Button>
        </motion.div>

        {/* Tooltip */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-20 top-1/2 -translate-y-1/2 bg-[#084734] text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg pointer-events-none"
          >
            Pergunte ao Assistente
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-[#084734]" />
          </motion.div>
        )}
      </motion.div>

      {/* Modal do Chat */}
      <AnimatePresence>
        {isOpen && (
          <IAGOChatModal 
            user={user} 
            onClose={() => setIsOpen(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}