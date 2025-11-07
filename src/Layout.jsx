
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Camera, Dumbbell, UtensilsCrossed, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      
      // Load user theme preference
      if (userData?.email) {
        const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
        if (profiles[0]?.theme_preference) {
          setTheme(profiles[0].theme_preference);
        }
      }
    }).catch(() => {});
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail.theme);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const navItems = [
    { name: "Início", icon: Home, path: createPageUrl("Dashboard") },
    { name: "Scanner", icon: Camera, path: createPageUrl("FoodScanner") },
    { name: "Treinos", icon: Dumbbell, path: createPageUrl("Workouts") },
    { name: "Refeições", icon: UtensilsCrossed, path: createPageUrl("MealPlans") },
    { name: "Perfil", icon: User, path: createPageUrl("Profile") },
  ];

  const isActive = (path) => location.pathname === path;

  // Theme configurations
  const themeConfig = {
    default: {
      bg: "#084734",
      gradient: "linear-gradient(135deg, #084734, #CEF17B)",
      cardGradient: "linear-gradient(180deg, #CEEDB2, #CEF17B)",
      buttonGradient: "linear-gradient(90deg, #CEF17B, #CEEDB2)",
    },
    orange: {
      bg: "#ea580c",
      gradient: "linear-gradient(135deg, #ea580c, #fbbf24)",
      cardGradient: "linear-gradient(180deg, #fb923c, #fbbf24)",
      buttonGradient: "linear-gradient(90deg, #fbbf24, #fb923c)",
    },
    purple: {
      bg: "#9333ea",
      gradient: "linear-gradient(135deg, #9333ea, #ec4899)",
      cardGradient: "linear-gradient(180deg, #a855f7, #ec4899)",
      buttonGradient: "linear-gradient(90deg, #ec4899, #a855f7)",
    },
    red: {
      bg: "#dc2626",
      gradient: "linear-gradient(135deg, #dc2626, #f43f5e)",
      cardGradient: "linear-gradient(180deg, #ef4444, #f43f5e)",
      buttonGradient: "linear-gradient(90deg, #f43f5e, #ef4444)",
    },
    yellow: {
      bg: "#eab308",
      gradient: "linear-gradient(135deg, #eab308, #fbbf24)",
      cardGradient: "linear-gradient(180deg, #facc15, #fbbf24)",
      buttonGradient: "linear-gradient(90deg, #fbbf24, #facc15)",
    },
    blue: {
      bg: "#2563eb",
      gradient: "linear-gradient(135deg, #2563eb, #06b6d4)",
      cardGradient: "linear-gradient(180deg, #3b82f6, #06b6d4)",
      buttonGradient: "linear-gradient(90deg, #06b6d4, #3b82f6)",
    },
    pink: {
      bg: "#ec4899",
      gradient: "linear-linear-gradient(135deg, #ec4899, #f472b6)",
      cardGradient: "linear-gradient(180deg, #f472b6, #fb7185)",
      buttonGradient: "linear-gradient(90deg, #fb7185, #f472b6)",
    },
    teal: {
      bg: "#14b8a6",
      gradient: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
      cardGradient: "linear-gradient(180deg, #2dd4bf, #5eead4)",
      buttonGradient: "linear-gradient(90deg, #5eead4, #2dd4bf)",
    },
    indigo: {
      bg: "#6366f1",
      gradient: "linear-gradient(135deg, #6366f1, #818cf8)",
      cardGradient: "linear-gradient(180deg, #818cf8, #a5b4fc)",
      buttonGradient: "linear-gradient(90deg, #a5b4fc, #818cf8)",
    },
    emerald: {
      bg: "#10b981",
      gradient: "linear-gradient(135deg, #10b981, #34d399)",
      cardGradient: "linear-gradient(180deg, #34d399, #6ee7b7)",
      buttonGradient: "linear-gradient(90deg, #6ee7b7, #34d399)",
    },
    dark: {
      bg: "#111827",
      gradient: "linear-gradient(135deg, #111827, #1f2937)",
      cardGradient: "linear-gradient(180deg, #1f2937, #374151)",
      buttonGradient: "linear-gradient(90deg, #4b5563, #6b7280)",
    },
    light: {
      bg: "#f3f4f6",
      gradient: "linear-gradient(135deg, #f3f4f6, #ffffff)",
      cardGradient: "linear-gradient(180deg, #ffffff, #f9fafb)",
      buttonGradient: "linear-gradient(90deg, #e5e7eb, #f3f4f6)",
    },
  };

  const currentTheme = themeConfig[theme] || themeConfig.default;

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ backgroundColor: currentTheme.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
          transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        
        .gradient-primary {
          background: ${currentTheme.gradient};
        }
        
        .gradient-card {
          background: ${currentTheme.cardGradient};
        }
        
        .gradient-button {
          background: ${currentTheme.buttonGradient};
        }
        
        .glass-effect {
          background: rgba(206, 237, 178, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(206, 241, 123, 0.2);
        }

        /* Garantir que a navegação fique sempre visível e fixa */
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

      {/* Bottom Navigation - Sempre visível e fixa */}
      <nav className="bottom-navigation fixed bottom-0 left-0 right-0 glass-effect border-t border-[#CEF17B]/20">
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
                      ? "bg-[#CEF17B]/20 scale-110" 
                      : "hover:bg-[#CEF17B]/10"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#CEF17B]' : 'text-white/70'}`} />
                  <span className={`text-xs font-medium ${active ? 'text-[#CEF17B]' : 'text-white/70'}`}>
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
