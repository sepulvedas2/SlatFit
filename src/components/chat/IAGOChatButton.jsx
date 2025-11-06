import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import IAGOChatModal from "./IAGOChatModal";

export default function IAGOChatButton({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('openIAGOChat', handleOpen);
    return () => window.removeEventListener('openIAGOChat', handleOpen);
  }, []);

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 right-6 z-[9998]"
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </Button>
        </motion.div>
      </AnimatePresence>

      <IAGOChatModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
      />
    </>
  );
}