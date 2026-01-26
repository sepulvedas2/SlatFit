import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
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
  
  // Goals
  const [goalDistance, setGoalDistance] = useState("");
  const [goalPace, setGoalPace] = useState("");
  
  // Live stats
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [movingTime, setMovingTime] = useState(0);
  const [currentPace, setCurrentPace] = useState("--:--");
  const [avgSpeed, setAvgSpeed] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [calories, setCalories] = useState(0);
  const [estimatedFinishTime, setEstimatedFinishTime] = useState("--:--");
  
  const [routePoints, setRoutePoints] = useState([]);
  const [lastPosition, setLastPosition] = useState(null);
  const timerRef = useRef(null);
  const gpsWatchId = useRef(null);
  const movingTimeRef = useRef(0);
  
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

  // Calculate pace (min/km) - use moving time only
  const calculatePace = (distKm, durationSec) => {
    if (distKm === 0 || durationSec === 0) return "--:--";
    const paceMinutes = durationSec / 60 / distKm;
    if (!isFinite(paceMinutes)) return "--:--";
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
        
        // Update pace based on moving time
        const newPace = calculatePace(newDist, movingTimeRef.current);
        setCurrentPace(newPace);
        
        // Calculate avg speed
        if (movingTimeRef.current > 0) {
          const speed = (newDist / movingTimeRef.current) * 3600;
          setAvgSpeed(speed);
        }
        
        // Estimate calories (rough: 0.75 kcal per kg per km, assume 70kg)
        setCalories(Math.round(newDist * 70 * 0.75));
        
        // Calculate estimated finish time if goal is set
        if (goalDistance && speed > 0) {
          const remainingDist = parseFloat(goalDistance) - newDist;
          if (remainingDist > 0) {
            const remainingTime = (remainingDist / speed) * 3600;
            setEstimatedFinishTime(formatTime(Math.round(remainingTime + movingTimeRef.current)));
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

  // Start tracking
  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS não disponível neste dispositivo");
      return;
    }

    setIsTracking(true);
    setIsPaused(false);
    setGpsError(null);
    
    // Request GPS permission and start watching position
    gpsWatchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
    
    // Timer to update duration and moving time
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
      
      // Only count moving time when user is actually moving
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
        timeout: 5000,
        maximumAge: 0
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
      return base44.entities.RunningActivity.create(activityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['runningActivities']);
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
              <p className="text-sm text-white/60 mb-1">Tempo</p>
              <p className="text-4xl font-bold text-white">{formatTime(movingTime)}</p>
              <p className="text-sm text-[#CEF17B]">em movimento</p>
            </div>
          </div>

          {goalDistance && (
            <div className="p-4 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/20">
              <p className="text-sm text-[#CEEDB2] text-center">
                🎯 Meta: {goalDistance}km • Estimativa: {estimatedFinishTime}
              </p>
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
            <h3 className="font-bold text-white">Trajeto GPS</h3>
            <Badge className="bg-[#CEF17B]/10 text-[#CEF17B] border-0 text-xs ml-auto">
              {routePoints.length} pontos
            </Badge>
          </div>
          <div className="h-64 rounded-lg overflow-hidden">
            {routePoints.length > 0 ? (
              <MapContainer
                center={[routePoints[0].lat, routePoints[0].lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {routePoints.length > 0 && (
                  <>
                    <Marker position={[routePoints[0].lat, routePoints[0].lng]} />
                    <Polyline
                      positions={routePoints.map(p => [p.lat, p.lng])}
                      color="#CEF17B"
                      weight={4}
                    />
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