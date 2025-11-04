import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { 
  Trophy, Users, TrendingUp, Medal, Crown,
  ArrowLeft, Flame, Target, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Community() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("leaderboard");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: allUserPoints } = useQuery({
    queryKey: ['allUserPoints'],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.list('-total_points', 50);
      return points;
    },
    initialData: [],
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || null;
    },
    enabled: !!user?.email
  });

  const userRank = userPoints ? 
    allUserPoints.findIndex(p => p.user_email === user.email) + 1 : 0;

  const getRankBadge = (position) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (position === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-white/50">#{position}</span>;
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case "diamond": return "from-cyan-400 to-blue-600";
      case "platinum": return "from-gray-300 to-gray-600";
      case "gold": return "from-yellow-400 to-yellow-600";
      case "silver": return "from-gray-300 to-gray-500";
      default: return "from-orange-400 to-orange-600"; // bronze
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="glass-effect border-[#CEF17B]/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Comunidade FitLens</h1>
            <p className="text-[#CEEDB2] mt-1">Conecte-se, compita e inspire-se!</p>
          </div>
          <div className="glass-effect px-4 py-2 rounded-full border border-[#CEF17B]/20">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#CEF17B]" />
              <div className="text-right">
                <p className="text-xs text-[#CEEDB2]">Sua Posição</p>
                <p className="font-bold text-white">#{userRank || '--'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Your Stats Card */}
        {userPoints && (
          <Card className={`glass-effect p-6 border-[#CEF17B]/20 bg-gradient-to-r ${getRankColor(userPoints.rank)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {user?.full_name?.split(' ')[0] || 'Você'}
                  </h3>
                  <Badge className="bg-white/20 text-white border-0 mt-1">
                    {userPoints.rank.toUpperCase()} • Nível {userPoints.level}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">{userPoints.total_points}</p>
                <p className="text-sm text-white/80">XP Total</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-lg font-bold text-white">{userPoints.daily_streak}</p>
                    <p className="text-xs text-white/70">Sequência</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{userPoints.longest_streak}</p>
                    <p className="text-xs text-white/70">Recorde</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            onClick={() => setActiveTab("leaderboard")}
            variant={activeTab === "leaderboard" ? "default" : "outline"}
            className={activeTab === "leaderboard" 
              ? "gradient-button text-[#084734]" 
              : "glass-effect border-[#CEF17B]/20"}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Ranking
          </Button>
          <Button
            onClick={() => setActiveTab("stats")}
            variant={activeTab === "stats" ? "default" : "outline"}
            className={activeTab === "stats" 
              ? "gradient-button text-[#084734]" 
              : "glass-effect border-[#CEF17B]/20"}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Estatísticas
          </Button>
        </div>

        {/* Leaderboard */}
        {activeTab === "leaderboard" && (
          <div className="space-y-3">
            {allUserPoints.slice(0, 20).map((points, index) => (
              <Card 
                key={points.id} 
                className={`glass-effect p-4 border-[#CEF17B]/20 ${
                  points.user_email === user?.email ? 'ring-2 ring-[#CEF17B]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 flex items-center justify-center">
                      {getRankBadge(index + 1)}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                      <span className="text-xl">
                        {index < 3 ? '🏆' : '👤'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white">
                        {points.user_email === user?.email ? 'Você' : `Usuário #${index + 1}`}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge className={`bg-gradient-to-r ${getRankColor(points.rank)} border-0 text-white text-xs`}>
                          {points.rank.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-[#CEEDB2]">Nível {points.level}</span>
                        <span className="text-xs text-[#CEEDB2] flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {points.daily_streak} dias
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{points.total_points.toLocaleString()}</p>
                    <p className="text-xs text-[#CEEDB2]">XP Total</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass-effect p-6 border-[#CEF17B]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{allUserPoints.length}+</p>
                  <p className="text-sm text-[#CEEDB2]">Membros Ativos</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect p-6 border-[#CEF17B]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {Math.max(...allUserPoints.map(p => p.longest_streak || 0))}
                  </p>
                  <p className="text-sm text-[#CEEDB2]">Maior Sequência</p>
                </div>
              </div>
            </Card>

            <Card className="glass-effect p-6 border-[#CEF17B]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {allUserPoints.reduce((sum, p) => sum + (p.total_points || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-[#CEEDB2]">XP Total da Comunidade</p>
                </div>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}