import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AnalyzingLoader({ imagePreview }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative overflow-hidden rounded-3xl"
      style={{ background: "rgba(8,71,52,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.2)" }}
    >
      {imagePreview && (
        <div className="relative">
          <img src={imagePreview} alt="Food" className="w-full aspect-video object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(8,71,52,0.9))" }} />
        </div>
      )}

      <div className="p-8 flex flex-col items-center gap-5 text-center">
        {/* Pulsing brain icon */}
        <div className="relative">
          <motion.div
            className="w-20 h-20 rounded-full bg-[#CEF17B]/10 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-9 h-9 text-[#CEF17B]" />
          </motion.div>
          {/* Orbiting dots */}
          {[0, 120, 240].map((deg, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-[#CEF17B]"
              style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "linear" }}
              initial={{ rotate: deg, translateX: 40 }}
            />
          ))}
        </div>

        <div>
          <p className="text-white font-bold text-xl">Analisando sua refeição com IA...</p>
          <p className="text-[#CEEDB2] text-sm mt-1">Consultando base TACO/USDA</p>
        </div>

        {/* Progress steps */}
        <div className="w-full space-y-2">
          {["Identificando o alimento", "Calculando macronutrientes", "Gerando insights personalizados"].map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.6 }}
              className="flex items-center gap-3"
            >
              <motion.div
                className="w-4 h-4 rounded-full bg-[#CEF17B]/20 border border-[#CEF17B]/40 flex items-center justify-center flex-shrink-0"
                animate={{ backgroundColor: ["rgba(206,241,123,0.1)", "rgba(206,241,123,0.4)", "rgba(206,241,123,0.1)"] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#CEF17B]" />
              </motion.div>
              <p className="text-sm text-white/70">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}