import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Play, Pause, Square, MapPin, Timer, Zap, 
  Target, TrendingUp, ArrowLeft, Flame, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function RunningTracker({ onFinish, userEmail }) {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activityType, setActivityType] = useState("corrida");
  const [gpsError, setGpsError] = useState(null);
  const [isMoving, setIsMoving] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState(true);
  const [lastVoiceKm, setLastVoiceKm] = useState(0);
  const [lastVoiceDistance, setLastVoiceDistance] = useState(0);
  
  // Goals
  const [goalDistance, setGoalDistance] = useState("");
  const [goalPace, setGoalPace] = useState("");
  
  // Live stats
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [movingTime, setMovingTime] = useState(0);
  const [currentPace, setCurrentPace] = useState("--:--");
  const [avgPace, setAvgPace] = useState("--:--");
  const [lastKmPace, setLastKmPace] = useState("--:--");
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  const [estimatedFinishTime, setEstimatedFinishTime] = useState("--:--");
  const [timeAhead, setTimeAhead] = useState(0);
  
  const [routePoints, setRoutePoints] = useState([]);
  const [lastPosition, setLastPosition] = useState(null);
  const timerRef = useRef(null);
  const gpsWatchId = useRef(null);
  const movingTimeRef = useRef(0);
  const lastKmDistanceRef = useRef(0);
  const lastKmTimeRef = useRef(0);
  const speedHistoryRef = useRef([]);
  const lastPaceCheckRef = useRef({ distance: 0, pace: null });
  
  const queryClient = useQueryClient();

  // Haversine formula to calculate distance between two GPS points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Format time helper
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate pace (min/km) with smoothing
  const calculatePace = (distKm, durationSec) => {
    if (distKm === 0 || durationSec === 0) return "--:--";
    const paceMinutes = durationSec / 60 / distKm;
    if (!isFinite(paceMinutes) || paceMinutes > 30) return "--:--"; // Cap at 30 min/km
    const mins = Math.floor(paceMinutes);
    const secs = Math.round((paceMinutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate smooth current pace using speed history
  const calculateSmoothPace = () => {
    if (speedHistoryRef.current.length < 3) return currentPace;
    
    // Average last 5 speeds
    const recentSpeeds = speedHistoryRef.current.slice(-5);
    const avgSpeed = recentSpeeds.reduce((sum, s) => sum + s, 0) / recentSpeeds.length;
    
    if (avgSpeed === 0) return "--:--";
    
    const paceMinutes = 60 / avgSpeed;
    if (!isFinite(paceMinutes) || paceMinutes > 30) return "--:--";
    
    const mins = Math.floor(paceMinutes);
    const secs = Math.round((paceMinutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle GPS position updates
  const handlePositionUpdate = (position) => {
    const { latitude, longitude, speed } = position.coords;
    const timestamp = Date.now();
    
    const newPoint = { lat: latitude, lng: longitude, timestamp };
    
    // Calculate speed in km/h (speed is in m/s)
    const speedKmh = speed ? speed * 3.6 : 0;
    setCurrentSpeed(speedKmh);
    
    // Add to speed history for smoothing
    speedHistoryRef.current.push(speedKmh);
    if (speedHistoryRef.current.length > 10) {
      speedHistoryRef.current.shift();
    }
    
    // Detect if user is moving (speed > 0.5 km/h)
    const moving = speedKmh > 0.5;
    setIsMoving(moving);
    
    if (lastPosition && moving) {
      // Calculate distance increment
      const distIncrement = calculateDistance(
        lastPosition.lat,
        lastPosition.lng,
        latitude,
        longitude
      );
      
      // Update distance
      setDistance(prev => {
        const newDist = prev + distIncrement;
        
        // Calculate avg pace based on total moving time
        const avgPaceValue = calculatePace(newDist, movingTimeRef.current);
        setAvgPace(avgPaceValue);
        
        // Update smooth current pace
        const smoothPace = calculateSmoothPace();
        setCurrentPace(smoothPace);
        
        // Calculate last km pace
        if (Math.floor(newDist) > Math.floor(lastKmDistanceRef.current)) {
          const kmDist = newDist - lastKmDistanceRef.current;
          const kmTime = movingTimeRef.current - lastKmTimeRef.current;
          const kmPace = calculatePace(kmDist, kmTime);
          setLastKmPace(kmPace);
          lastKmDistanceRef.current = newDist;
          lastKmTimeRef.current = movingTimeRef.current;
        }
        
        // Calculate avg speed
        if (movingTimeRef.current > 0) {
          const speed = (newDist / movingTimeRef.current) * 3600;
          setAvgSpeed(speed);
        }
        
        // Estimate calories (rough: 0.75 kcal per kg per km, assume 70kg)
        setCalories(Math.round(newDist * 70 * 0.75));
        
        // Calculate estimated finish time if goal is set
        if (goalDistance && movingTimeRef.current > 0) {
          const remainingDist = parseFloat(goalDistance) - newDist;
          if (remainingDist > 0) {
            const avgSpeed = (newDist / movingTimeRef.current) * 3600;
            const remainingTime = (remainingDist / avgSpeed) * 3600;
            const totalEstimatedTime = movingTimeRef.current + remainingTime;
            setEstimatedFinishTime(formatTime(Math.round(totalEstimatedTime)));
            
            // Calculate if ahead or behind
            if (goalPace) {
              const [goalMins, goalSecs] = goalPace.split(':').map(Number);
              const goalTotalTime = (goalMins * 60 + goalSecs) * parseFloat(goalDistance);
              const timeDiff = goalTotalTime - totalEstimatedTime;
              setTimeAhead(Math.round(timeDiff));
            }
          }
        }
        
        return newDist;
      });
    }
    
    setLastPosition(newPoint);
    setRoutePoints(prev => [...prev, newPoint]);
  };

  const handlePositionError = (error) => {
    console.error('GPS error:', error);
    setGpsError(error.message);
  };

  // Voice feedback function
  const speak = (text) => {
    if (!voiceFeedback || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Check for voice milestones and pace monitoring
  useEffect(() => {
    if (!isTracking || isPaused || !voiceFeedback) return;
    
    const currentKm = Math.floor(distance);
    
    // Every km completed
    if (currentKm > lastVoiceKm && currentKm > 0) {
      let message = `${currentKm} quilômetros completados. Pace médio: ${avgPace}.`;
      
      // Add time ahead/behind info
      if (goalDistance && timeAhead !== 0) {
        const absTime = Math.abs(timeAhead);
        const timeStr = formatTime(absTime);
        if (timeAhead > 0) {
          message += ` Você está ${timeStr} adiantado!`;
        } else {
          message += ` Você está ${timeStr} atrasado. Acelere!`;
        }
      }
      
      speak(message);
      setLastVoiceKm(currentKm);
    }
    
    // Monitor pace every 500m (if goal is set)
    if (goalPace && distance >= lastVoiceDistance + 0.5 && distance > 0.5) {
      const [goalMins, goalSecs] = goalPace.split(':').map(Number);
      const goalPaceSeconds = goalMins * 60 + goalSecs;
      
      if (currentPace !== "--:--") {
        const [currentMins, currentSecs] = currentPace.split(':').map(Number);
        const currentPaceSeconds = currentMins * 60 + currentSecs;
        
        // Check if pace dropped significantly (more than 20%)
        if (lastPaceCheckRef.current.pace) {
          const [lastMins, lastSecs] = lastPaceCheckRef.current.pace.split(':').map(Number);
          const lastPaceSeconds = lastMins * 60 + lastSecs;
          
          const paceDropPercent = ((currentPaceSeconds - lastPaceSeconds) / lastPaceSeconds) * 100;
          
          if (paceDropPercent > 15) {
            const targetPaceStr = goalPace.replace(':', ' minutos e ') + ' segundos';
            speak(`Atenção, seu ritmo caiu. Para atingir sua meta em ${estimatedFinishTime}, você precisa retomar o pace de ${targetPaceStr} por quilômetro.`);
          }
        }
        
        lastPaceCheckRef.current = { distance, pace: currentPace };
      }
      
      setLastVoiceDistance(distance);
    }
    
    // Halfway to goal
    if (goalDistance && distance >= parseFloat(goalDistance) / 2 && distance < parseFloat(goalDistance) / 2 + 0.1) {
      const remaining = parseFloat(goalDistance) - distance;
      speak(`Metade do percurso concluída! Faltam ${remaining.toFixed(1)} quilômetros. Mantenha o ritmo!`);
    }
    
    // Near goal (500m before)
    if (goalDistance && distance >= parseFloat(goalDistance) - 0.5 && distance < parseFloat(goalDistance) - 0.4) {
      speak(`Faltam apenas 500 metros! Acelere para a reta final!`);
    }
    
    // Goal completed
    if (goalDistance && distance >= parseFloat(goalDistance) && lastVoiceKm < parseFloat(goalDistance)) {
      speak(`Parabéns! Meta de ${goalDistance} quilômetros atingida em ${formatTime(movingTime)}!`);
      setLastVoiceKm(parseFloat(goalDistance) + 1);
    }
  }, [distance, currentPace, isTracking, isPaused, voiceFeedback]);

  // Start tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS não disponível neste dispositivo");
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    setGpsError(null);
    
    // Initial voice feedback
    speak('Atividade iniciada. Bom treino!');
    
    // Request GPS permission with optimized settings
    gpsWatchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000, // Battery optimization: accept 2s old positions
        distanceFilter: 3 // Only update when moved 3m (battery saver)
      }
    );
    
    // Timer - starts immediately, counts total time
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      
      // Count moving time only when actually moving
      if (isMoving) {
        movingTimeRef.current += 1;
        setMovingTime(movingTimeRef.current);
      }
    }, 1000);
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (gpsWatchId.current) navigator.geolocation.clearWatch(gpsWatchId.current);
  };

  const resumeTracking = () => {
    setIsPaused(false);
    
    // Resume GPS tracking
    if (!navigator.geolocation) {
      setGpsError("GPS não disponível");
      return;
    }

    gpsWatchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 2000,
        distanceFilter: 3
      }
    );
    
    // Resume timer
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      if (isMoving) {
        movingTimeRef.current += 1;
        setMovingTime(movingTimeRef.current);
      }
    }, 1000);
  };

  const stopMutation = useMutation({
    mutationFn: async (activityData) => {
      const activity = await db.RunningActivity.create(activityData);
      
      // Update city leaderboard
      const profiles = await db.UserProfile.filter({ user_email: userEmail });
      const userCity = profiles[0]?.city;
      const userName = profiles[0]?.user_email?.split('@')[0] || 'Anônimo';
      
      if (userCity) {
        const leaderboards = await db.CityLeaderboard.filter({ user_email: userEmail });
        
        if (leaderboards[0]) {
          // Update existing
          const current = leaderboards[0];
          await db.CityLeaderboard.update(current.id, {
            total_distance_km: (current.total_distance_km || 0) + activityData.distance_km,
            total_runs: (current.total_runs || 0) + 1,
            total_time_seconds: (current.total_time_seconds || 0) + activityData.duration_seconds,
            best_pace: !current.best_pace || activityData.pace_avg < current.best_pace ? activityData.pace_avg : current.best_pace,
            longest_run_km: Math.max(current.longest_run_km || 0, activityData.distance_km),
            week_distance_km: (current.week_distance_km || 0) + activityData.distance_km,
            month_distance_km: (current.month_distance_km || 0) + activityData.distance_km,
            points: (current.points || 0) + Math.round(activityData.distance_km * 10),
            last_activity_date: new Date().toISOString(),
            user_name: userName
          });
        } else {
          // Create new
          await db.CityLeaderboard.create({
            user_email: userEmail,
            user_name: userName,
            city: userCity,
            total_distance_km: activityData.distance_km,
            total_runs: 1,
            total_time_seconds: activityData.duration_seconds,
            best_pace: activityData.pace_avg,
            longest_run_km: activityData.distance_km,
            week_distance_km: activityData.distance_km,
            month_distance_km: activityData.distance_km,
            points: Math.round(activityData.distance_km * 10),
            last_activity_date: new Date().toISOString()
          });
        }

        // Update city challenges
        const activeChallenges = await db.CityChallenge.filter({ 
          city: userCity,
          status: 'active'
        });
        
        for (const challenge of activeChallenges) {
          if (challenge.participants?.includes(userEmail)) {
            await db.CityChallenge.update(challenge.id, {
              current_value: (challenge.current_value || 0) + activityData.distance_km
            });
          }
        }
      }
      
      return activity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['runningActivities']);
      queryClient.invalidateQueries(['cityLeaderboard']);
      queryClient.invalidateQueries(['cityChallenges']);
      onFinish();
    }
  });

  const stopTracking = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (gpsWatchId.current) navigator.geolocation.clearWatch(gpsWatchId.current);
    
    // Save activity
    if (userEmail && distance > 0) {
      stopMutation.mutate({
        user_email: userEmail,
        activity_type: activityType,
        activity_date: new Date().toISOString(),
        distance_km: parseFloat(distance.toFixed(2)),
        duration_seconds: movingTime, // Use moving time, not total time
        pace_avg: currentPace,
        speed_avg: parseFloat(avgSpeed.toFixed(2)),
        calories_burned: calories,
        goal_distance: goalDistance ? parseFloat(goalDistance) : null,
        goal_pace: goalPace || null,
        route_data: routePoints,
        is_personal_record: false
      });
    } else {
      onFinish();
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (gpsWatchId.current) navigator.geolocation.clearWatch(gpsWatchId.current);
    };
  }, []);

  // Update moving detection
  useEffect(() => {
    setIsMoving(currentSpeed > 0.5);
  }, [currentSpeed]);

  if (!isTracking) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onFinish}
              className="glass-effect border-[#CEF17B]/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Configurar Atividade</h1>
              <p className="text-[#CEEDB2]">Defina suas metas antes de começar</p>
            </div>
          </div>

          {/* Activity Type */}
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <h3 className="font-bold text-white mb-4">Tipo de Atividade</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setActivityType("corrida")}
                className={activityType === "corrida" ? "bg-orange-500 hover:bg-orange-600" : "bg-white/10 hover:bg-white/20"}
              >
                🏃 Corrida
              </Button>
              <Button
                onClick={() => setActivityType("ciclismo")}
                className={activityType === "ciclismo" ? "bg-blue-500 hover:bg-blue-600" : "bg-white/10 hover:bg-white/20"}
              >
                🚴 Ciclismo
              </Button>
            </div>
          </Card>

          {/* Goals */}
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <h3 className="font-bold text-white mb-4">Metas (Opcional)</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#CEEDB2] mb-2 block">Distância (km)</label>
                <Input
                  type="number"
                  placeholder="Ex: 10"
                  value={goalDistance}
                  onChange={(e) => setGoalDistance(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[#CEEDB2] mb-2 block">Pace alvo (min/km)</label>
                <Input
                  type="text"
                  placeholder="Ex: 5:30"
                  value={goalPace}
                  onChange={(e) => setGoalPace(e.target.value)}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <p className="text-sm font-semibold text-white">Feedback por Voz</p>
                    <p className="text-xs text-[#CEEDB2]">Orientações durante o treino</p>
                  </div>
                </div>
                <button
                  onClick={() => setVoiceFeedback(!voiceFeedback)}
                  className={`w-12 h-6 rounded-full transition-all ${
                    voiceFeedback ? 'bg-[#CEF17B]' : 'bg-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    voiceFeedback ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              {goalDistance && goalPace && (
                <div className="p-3 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/20">
                  <p className="text-sm text-[#CEF17B]">
                    ⏱️ Tempo estimado: {(() => {
                      const [mins, secs] = goalPace.split(':').map(Number);
                      const paceInMinutes = mins + secs / 60;
                      const totalMinutes = paceInMinutes * parseFloat(goalDistance);
                      return formatTime(Math.round(totalMinutes * 60));
                    })()}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Button
            onClick={startTracking}
            className="w-full gradient-button text-[#084734] h-14 text-lg font-bold"
          >
            <Play className="w-6 h-6 mr-2" />
            Iniciar {activityType === "corrida" ? "Corrida" : "Pedalada"}
          </Button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={`${isMoving ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'} border-0 px-4 py-2`}>
              <div className={`w-2 h-2 rounded-full ${isMoving ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse mr-2`} />
              {isMoving ? 'Em movimento' : 'Parado'}
            </Badge>
            {gpsError && (
              <Badge className="bg-red-500/20 text-red-400 border-0 px-3 py-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                GPS Error
              </Badge>
            )}
          </div>
          <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 capitalize">
            {activityType}
          </Badge>
        </div>

        {/* Main Stats */}
        <Card className="glass-effect p-8 border-[#CEF17B]/20">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-white/60 mb-1">Distância</p>
              <p className="text-4xl font-bold text-white">{distance.toFixed(2)}</p>
              <p className="text-sm text-[#CEF17B]">km</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60 mb-1">Pace Atual</p>
              <p className="text-4xl font-bold text-white">{currentPace}</p>
              <p className="text-sm text-[#CEF17B]">min/km</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-white/60 mb-1">Tempo Total</p>
              <p className="text-4xl font-bold text-white">{formatTime(duration)}</p>
              <p className="text-sm text-[#CEF17B]">movimento: {formatTime(movingTime)}</p>
            </div>
          </div>

          {/* Pace Details */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-2 bg-white/5 rounded text-center">
              <p className="text-xs text-white/60">Pace Médio</p>
              <p className="text-lg font-bold text-white">{avgPace}</p>
            </div>
            <div className="p-2 bg-white/5 rounded text-center">
              <p className="text-xs text-white/60">Último KM</p>
              <p className="text-lg font-bold text-white">{lastKmPace}</p>
            </div>
          </div>

          {goalDistance && (
            <div className={`p-4 rounded-lg border ${
              timeAhead > 0 ? 'bg-green-500/10 border-green-500/20' : 
              timeAhead < 0 ? 'bg-yellow-500/10 border-yellow-500/20' : 
              'bg-[#CEF17B]/10 border-[#CEF17B]/20'
            }`}>
              <div className="text-center">
                <p className="text-sm text-white/80 mb-1">
                  🎯 Meta: {goalDistance}km • Chegada prevista: {estimatedFinishTime}
                </p>
                {timeAhead !== 0 && (
                  <p className={`text-xs font-semibold ${
                    timeAhead > 0 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {timeAhead > 0 ? `✓ ${formatTime(Math.abs(timeAhead))} adiantado` : `⚠ ${formatTime(Math.abs(timeAhead))} atrasado`}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-effect p-4 border-[#CEF17B]/20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-[#CEF17B]" />
              <div>
                <p className="text-xs text-white/60">Velocidade Média</p>
                <p className="text-xl font-bold text-white">{avgSpeed.toFixed(1)} km/h</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-4 border-[#CEF17B]/20">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xs text-white/60">Calorias</p>
                <p className="text-xl font-bold text-white">{calories} kcal</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Map */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-[#CEF17B]" />
            <h3 className="font-bold text-white">Trajeto em Tempo Real</h3>
            <Badge className="bg-[#CEF17B]/10 text-[#CEF17B] border-0 text-xs ml-auto">
              {routePoints.length} pontos GPS
            </Badge>
          </div>
          {goalPace && (
            <div className="flex items-center justify-center gap-4 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-white/70">Acima da meta</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-white/70">Na meta</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-white/70">Abaixo da meta</span>
              </div>
            </div>
          )}
          <div className="h-64 rounded-lg overflow-hidden">
            {routePoints.length > 0 ? (
              <MapContainer
                center={[routePoints[routePoints.length - 1].lat, routePoints[routePoints.length - 1].lng]}
                zoom={16}
                style={{ height: '100%', width: '100%', filter: 'brightness(0.9) contrast(1.1)' }}
                scrollWheelZoom={false}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; OpenStreetMap contributors, CartoDB'
                />
                {routePoints.length > 0 && (
                  <>
                    <Marker position={[routePoints[0].lat, routePoints[0].lng]} />
                    {/* Render polyline with color based on pace performance */}
                    {(() => {
                      if (!goalPace) {
                        return <Polyline
                          positions={routePoints.map(p => [p.lat, p.lng])}
                          color="#CEF17B"
                          weight={5}
                          opacity={0.9}
                        />;
                      }
                      
                      // Split route into segments based on pace
                      const segments = [];
                      for (let i = 1; i < routePoints.length; i++) {
                        const segmentDist = calculateDistance(
                          routePoints[i-1].lat, routePoints[i-1].lng,
                          routePoints[i].lat, routePoints[i].lng
                        );
                        const segmentTime = (routePoints[i].timestamp - routePoints[i-1].timestamp) / 1000;
                        
                        if (segmentTime > 0 && segmentDist > 0) {
                          const segmentPace = segmentTime / 60 / segmentDist;
                          const [goalMins, goalSecs] = goalPace.split(':').map(Number);
                          const goalPaceMinutes = goalMins + goalSecs / 60;
                          
                          let color;
                          if (segmentPace <= goalPaceMinutes * 0.95) {
                            color = '#22c55e'; // Green - above target
                          } else if (segmentPace <= goalPaceMinutes * 1.05) {
                            color = '#eab308'; // Yellow - on target
                          } else {
                            color = '#ef4444'; // Red - below target
                          }
                          
                          segments.push(
                            <Polyline
                              key={i}
                              positions={[[routePoints[i-1].lat, routePoints[i-1].lng], [routePoints[i].lat, routePoints[i].lng]]}
                              color={color}
                              weight={5}
                              opacity={0.9}
                            />
                          );
                        }
                      }
                      return segments;
                    })()}
                  </>
                )}
              </MapContainer>
            ) : (
              <div className="h-full bg-white/5 flex items-center justify-center">
                <p className="text-white/60 text-sm">Aguardando GPS...</p>
              </div>
            )}
          </div>
        </Card>

        {/* Controls */}
        <div className="flex gap-3">
          {!isPaused ? (
            <Button
              onClick={pauseTracking}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 h-14"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pausar
            </Button>
          ) : (
            <Button
              onClick={resumeTracking}
              className="flex-1 bg-green-500 hover:bg-green-600 h-14"
            >
              <Play className="w-5 h-5 mr-2" />
              Retomar
            </Button>
          )}
          
          <Button
            onClick={stopTracking}
            className="flex-1 bg-red-500 hover:bg-red-600 h-14"
          >
            <Square className="w-5 h-5 mr-2" />
            Finalizar
          </Button>
        </div>

      </div>
    </div>
  );
}