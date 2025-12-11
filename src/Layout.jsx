import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Camera, Dumbbell, UtensilsCrossed, User, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'light';
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Listen for theme changes from Profile page
  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('app-theme') || 'light';
      setTheme(newTheme);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const isDark = theme === 'dark';

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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-[#084734]'
    }`}>
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
          background: ${isDark ? 'linear-gradient(135deg, #1e293b, #475569)' : 'linear-gradient(135deg, #084734, #CEF17B)'};
        }
        
        .gradient-card {
          background: ${isDark 
            ? 'linear-gradient(180deg, rgba(14, 165, 233, 0.1), rgba(6, 182, 212, 0.1))' 
            : 'linear-gradient(180deg, #CEEDB2, #CEF17B)'};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? 'rgba(14, 165, 233, 0.2)' : 'rgba(206, 241, 123, 0.2)'};
        }
        
        .glass-effect {
          background: ${isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(206, 237, 178, 0.1)'};
          backdrop-filter: blur(20px);
          border: 1px solid ${isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(206, 241, 123, 0.2)'};
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
      <nav className={`bottom-navigation fixed bottom-0 left-0 right-0 backdrop-blur-xl border-t ${
        isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-[#084734]/90 border-[#CEF17B]/20'
      }`}>
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
                      ? isDark ? "bg-sky-500/20 scale-110" : "bg-[#CEF17B]/20 scale-110"
                      : isDark ? "hover:bg-slate-800/50" : "hover:bg-[#CEF17B]/10"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    active 
                      ? isDark ? 'text-sky-400' : 'text-[#CEF17B]'
                      : isDark ? 'text-slate-400' : 'text-white/70'
                  }`} />
                  <span className={`text-xs font-medium ${
                    active 
                      ? isDark ? 'text-sky-400' : 'text-[#CEF17B]'
                      : isDark ? 'text-slate-400' : 'text-white/70'
                  }`}>
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