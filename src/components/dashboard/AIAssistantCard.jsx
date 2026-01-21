import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistantCard({ 
  message, 
  modeLabel, 
  loading, 
  icon: Icon,
  onExpand 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <Card className="border-0 p-6 shadow-xl relative overflow-hidden" style={{
        background: "linear-gradient(135deg, #0a5a42 0%, #084734 50%, #0a3d2e 100%)"
      }}>
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-[#CEF17B]" />
          <p className="text-white/80 text-sm font-medium">Analisando seu progresso...</p>
        </div>
      </Card>
    );
  }

  const isLongMessage = message.length > 120;
  const displayMessage = isExpanded || !isLongMessage 
    ? message 
    : message.substring(0, 120) + "...";

  return (
    <Card className="border-0 p-6 shadow-xl relative overflow-hidden rounded-2xl" style={{
      background: "linear-gradient(135deg, #0a5a42 0%, #084734 50%, #0a3d2e 100%)"
    }}>
      {/* Efeito de brilho sutil */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CEF17B]/50 to-transparent"></div>
      
      <div className="flex items-start gap-4">
        {/* Avatar diferenciado */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CEF17B]/30 to-[#CEF17B]/10 flex items-center justify-center backdrop-blur-sm border border-[#CEF17B]/20">
            <Icon className="w-6 h-6 text-[#CEF17B]" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-white text-base">Seu Assistente Pessoal</h3>
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs font-semibold">
              {modeLabel}
            </Badge>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={isExpanded ? 'expanded' : 'collapsed'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/95 text-sm leading-relaxed"
            >
              {displayMessage}
            </motion.p>
          </AnimatePresence>

          {isLongMessage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsExpanded(!isExpanded);
                if (onExpand) onExpand();
              }}
              className="mt-3 text-[#CEF17B] hover:text-[#CEF17B]/80 hover:bg-[#CEF17B]/10 text-xs font-semibold p-0 h-auto"
            >
              {isExpanded ? 'Ver menos' : 'Ver recomendação completa'}
              <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Indicador visual de IA */}
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 opacity-40">
        <Sparkles className="w-3 h-3 text-[#CEF17B]" />
        <span className="text-[#CEF17B] text-[10px] font-medium">IA</span>
      </div>
    </Card>
  );
}