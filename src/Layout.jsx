import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Camera, Dumbbell, UtensilsCrossed, User, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navItems = [
    { name: "Início", icon: Home, path: createPageUrl("Dashboard") },
    { name: "Scanner", icon: Camera, path: createPageUrl("FoodScanner") },
    { name: "Treinos", icon: Dumbbell, path: createPageUrl("Workouts") },
    { name: "Nutrição", icon: UtensilsCrossed, path: createPageUrl("SmartNutrition") },
    { name: "Agenda", icon: CalendarDays, path: createPageUrl("Agenda") },
    { name: "Perfil", icon: User, path: createPageUrl("Profile") },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        
        .gradient-primary {
          background: linear-gradient(135deg, #084734, #CEF17B);
        }
        
        .gradient-card {
          background: linear-gradient(180deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.1));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(14, 165, 233, 0.2);
        }
        
        .glass-effect {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
        }

        .bottom-navigation {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 99999 !important;
          pointer-events: auto !important;
        }
      `}</style>

      {/* Main Content */}
      <main className="pb-28 md:pb-8 min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-navigation fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800">
        <div className="max-w-lg mx-auto px-2">
          <div className="flex justify-around items-center py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                    active 
                      ? "bg-sky-500/20 scale-110" 
                      : "hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className={`text-xs font-medium ${active ? 'text-sky-400' : 'text-slate-400'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}