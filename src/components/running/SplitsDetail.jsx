import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function SplitsDetail({ activity }) {
  if (!activity?.route_data || activity.route_data.length < 2) {
    return null;
  }

  // Calculate distance between two GPS points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate splits (pace per km)
  const splits = [];
  let currentKmDistance = 0;
  let currentKmStartTime = activity.route_data[0].timestamp;
  let currentKmStartIndex = 0;

  for (let i = 1; i < activity.route_data.length; i++) {
    const point = activity.route_data[i];
    const prevPoint = activity.route_data[i - 1];
    
    const segmentDist = calculateDistance(
      prevPoint.lat, prevPoint.lng,
      point.lat, point.lng
    );
    
    currentKmDistance += segmentDist;
    
    // Complete 1km
    if (currentKmDistance >= 1.0) {
      const kmTime = (point.timestamp - currentKmStartTime) / 1000;
      const pace = kmTime / 60;
      const mins = Math.floor(pace);
      const secs = Math.round((pace - mins) * 60);
      
      splits.push({
        km: splits.length + 1,
        time: `${mins}:${secs.toString().padStart(2, '0')}`,
        paceSeconds: kmTime
      });
      
      currentKmDistance = 0;
      currentKmStartTime = point.timestamp;
      currentKmStartIndex = i;
    }
  }

  if (splits.length === 0) return null;

  // Find best and worst split
  const bestSplit = splits.reduce((best, curr) => 
    curr.paceSeconds < best.paceSeconds ? curr : best
  );
  const worstSplit = splits.reduce((worst, curr) => 
    curr.paceSeconds > worst.paceSeconds ? curr : worst
  );

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-4">
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-[#CEF17B]" />
        Splits por KM
      </h3>
      
      <div className="space-y-2">
        {splits.map((split) => {
          const isBest = split.km === bestSplit.km;
          const isWorst = split.km === worstSplit.km && splits.length > 1;
          
          return (
            <div 
              key={split.km}
              className={`flex items-center justify-between p-2 rounded ${
                isBest ? 'bg-green-500/10 border border-green-500/20' :
                isWorst ? 'bg-red-500/10 border border-red-500/20' :
                'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm font-semibold w-8">KM {split.km}</span>
                {isBest && <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">Melhor</Badge>}
                {isWorst && <Badge className="bg-red-500/20 text-red-400 border-0 text-xs">Mais lento</Badge>}
              </div>
              <span className="font-bold text-white">{split.time} /km</span>
            </div>
          );
        })}
      </div>
      
      {splits.length > 1 && (
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-white/60 text-center">
          Variação: {bestSplit.time} → {worstSplit.time}
        </div>
      )}
    </Card>
  );
}