import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Camera, Zap, BarChart3, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ScannerHero({ onScan, onGallery, fileInputRef }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Badge IA */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#CEF17B]/10 border border-[#CEF17B]/30">
          <span className="w-2 h-2 rounded-full bg-[#CEF17B] animate-pulse" />
          <span className="text-xs font-bold text-[#CEF17B]">IA ATIVA</span>
          <span className="text-white/30">•</span>
          <span className="text-xs text-white/70">Base TACO/USDA</span>
        </div>

        <h1 className="text-3xl font-bold text-white leading-tight">
          Scanner Nutricional<br />
          <span className="text-[#CEF17B]">Inteligente</span>
        </h1>

        <p className="text-[#CEEDB2] text-sm max-w-xs mx-auto leading-relaxed">
          Descubra em segundos se sua refeição está alinhada com sua meta.
        </p>
      </div>

      {/* Micro benefícios */}
      <div className="flex justify-center gap-4">
        {[
          { icon: Zap, label: "Calorias automáticas" },
          { icon: BarChart3, label: "Macros completos" },
          { icon: Sliders, label: "Ajuste de porção" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-xl bg-[#CEF17B]/10 border border-[#CEF17B]/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#CEF17B]" />
            </div>
            <span className="text-[10px] text-white/60 text-center leading-tight max-w-[60px]">{label}</span>
          </div>
        ))}
      </div>

      {/* CTA Principal */}
      <button
        onClick={onScan}
        className="w-full h-16 rounded-2xl font-bold text-lg text-[#084734] shadow-xl active:scale-95 transition-all"
        style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
      >
        <div className="flex items-center justify-center gap-3">
          <Camera className="w-6 h-6" />
          Escanear Agora
        </div>
      </button>

      {/* Opção galeria discreta */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full text-sm text-white/50 hover:text-white/80 transition-colors py-2"
      >
        Ou escolha da galeria
      </button>
    </motion.div>
  );
}