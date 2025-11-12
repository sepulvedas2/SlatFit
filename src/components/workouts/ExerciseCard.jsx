import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import LottieAnimation from "./LottieAnimation";

export default function ExerciseCard({ exercise, index, onClick }) {
  const hasAnimation = exercise.lottie_url || exercise.gif_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card 
        onClick={onClick}
        className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden relative"
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E9E4D]/5 to-[#59F394]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="relative z-10 space-y-4">
          {/* Animation Icon */}
          <div className="flex justify-center">
            {hasAnimation ? (
              exercise.lottie_url ? (
                <LottieAnimation 
                  url={exercise.lottie_url} 
                  className="w-28 h-28"
                />
              ) : exercise.gif_url ? (
                <img 
                  src={exercise.gif_url} 
                  alt={exercise.name}
                  className="w-28 h-28 object-contain"
                />
              ) : null
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#0E9E4D] to-[#59F394] flex items-center justify-center">
                <Play className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Exercise Info */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-[#09142D] group-hover:text-[#0E9E4D] transition-colors">
              {exercise.name}
            </h3>
            
            <p className="text-sm text-[#3B5EED] leading-relaxed min-h-[40px]">
              {exercise.short_description || exercise.series_suggestion || `${exercise.reps_suggestion} — Mantenha a postura correta`}
            </p>

            {/* Difficulty Badge */}
            {exercise.difficulty && (
              <Badge 
                className="bg-gradient-to-r from-[#0E9E4D]/10 to-[#59F394]/10 text-[#0E9E4D] border-0"
              >
                {exercise.difficulty}
              </Badge>
            )}
          </div>

          {/* Button */}
          <Button
            className="w-full bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white hover:shadow-lg transition-all duration-300 rounded-xl group-hover:scale-105"
          >
            Ver Detalhes
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}