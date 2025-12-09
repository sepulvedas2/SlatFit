import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

export default function HIITTimer({ block, blockIndex, totalBlocks, onBlockComplete, onTimeUpdate }) {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isExerciseTime, setIsExerciseTime] = useState(true);
  const [timeLeft, setTimeLeft] = useState(block.exercises[0]?.duration || 30);
  const [isPaused, setIsPaused] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Initialize audio
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZQQ0PVKvi7bBaFgs9mNjvyH0pBSp+zPLaizsIGGS57OihUhELTqXh8bllHAU2jdXzzn8qBSp+zPLajzsIG2u+7eajUBELTqXh8bllHAU2jdXzzn8qBSp+zPLajzsIGmrA7+SZQQ0PVKvi7bBaFgs9mNjvyH0pBSp+zPLaizsIGGS57OihUhELT'); // Beep sound
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Play beep sound
            if (soundEnabled && audioRef.current) {
              audioRef.current.play().catch(() => {});
            }

            if (isExerciseTime) {
              // Switch to rest
              setIsExerciseTime(false);
              return 10; // 10 seconds rest
            } else {
              // Move to next exercise
              const nextIndex = currentExerciseIndex + 1;
              if (nextIndex < block.exercises.length) {
                setCurrentExerciseIndex(nextIndex);
                setIsExerciseTime(true);
                return block.exercises[nextIndex].duration;
              } else {
                // Block complete
                clearInterval(intervalRef.current);
                onBlockComplete();
                return 0;
              }
            }
          }
          return prev - 1;
        });

        setTotalElapsed(prev => {
          const newTotal = prev + 1;
          onTimeUpdate(newTotal);
          return newTotal;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, isExerciseTime, currentExerciseIndex, block, soundEnabled]);

  const currentExercise = block.exercises[currentExerciseIndex];
  const progress = isExerciseTime
    ? ((currentExercise.duration - timeLeft) / currentExercise.duration) * 100
    : ((10 - timeLeft) / 10) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="relative overflow-hidden border-[#CEF17B]/20" style={{ backgroundColor: '#054D3B' }}>
      <div className={`absolute inset-0 transition-all duration-500 ${
        isExerciseTime 
          ? 'bg-gradient-to-br from-[#084734]/40 to-[#0B6B54]/40' 
          : 'bg-gradient-to-br from-[#054D3B]/40 to-[#084734]/40'
      }`} />
      
      <div className="relative z-10 p-8">
        
        {/* Timer Display */}
        <div className="text-center mb-6">
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div className="w-48 h-48 mx-auto relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={isExerciseTime ? "#CEF17B" : "#60A5FA"}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-6xl font-bold text-white">{timeLeft}</p>
                <p className="text-sm text-white/60">segundos</p>
              </div>
            </div>
          </motion.div>

          <div className="mt-4">
            <p className={`text-2xl font-bold ${
              isExerciseTime ? 'text-[#CEF17B]' : 'text-blue-400'
            }`}>
              {isExerciseTime ? '🔥 EXERCITE-SE!' : '💧 DESCANSE'}
            </p>
          </div>
        </div>

        {/* Current Exercise */}
        {isExerciseTime && (
          <div className="text-center mb-6 p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-white/60 mb-1">Exercício Atual</p>
            <p className="text-xl font-bold text-white mb-1">{currentExercise.name}</p>
            <p className="text-lg text-[#CEF17B]">{currentExercise.reps}</p>
          </div>
        )}

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-white/60 mb-2">
            <span>Exercício {currentExerciseIndex + 1}/{block.exercises.length}</span>
            <span>Bloco {blockIndex + 1}/{totalBlocks}</span>
          </div>
          <Progress 
            value={(currentExerciseIndex / block.exercises.length) * 100} 
            className="h-2 bg-white/10"
          />
        </div>

        {/* Total Time */}
        <div className="text-center mb-6">
          <p className="text-sm text-white/60">Tempo Total</p>
          <p className="text-2xl font-bold text-white">{formatTime(totalElapsed)}</p>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setIsPaused(!isPaused)}
            size="lg"
            className="w-16 h-16 rounded-full gradient-button text-[#084734]"
          >
            {isPaused ? <Play className="w-6 h-6" /> : <Pause className="w-6 h-6" />}
          </Button>

          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6 text-white" />
            ) : (
              <VolumeX className="w-6 h-6 text-white/40" />
            )}
          </Button>
        </div>

      </div>
    </Card>
  );
}