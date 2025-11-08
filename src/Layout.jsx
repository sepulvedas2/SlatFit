import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Camera, Dumbbell, UtensilsCrossed, User, CalendarDays, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);
      
      if (userData?.email) {
        try {
          const profiles = await base44.entities.UserProfile.filter({ user_email: userData.email });
          if (profiles[0]?.theme_preference) {
            setTheme(profiles[0].theme_preference);
          }
        } catch (err) {
          console.error("Error loading theme:", err);
        }
      }
    }).catch(() => {
      setUser(null);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

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
    { name: "Nutrição", icon: UtensilsCrossed, path: createPageUrl("SmartNutrition") },
    { name: "Progresso", icon: TrendingUp, path: createPageUrl("Progress") },
    { name: "Perfil", icon: User, path: createPageUrl("Profile") },
  ];

  const isActive = (path) => location.pathname === path;

  // Modern theme configurations
  const themeConfig = {
    default: {
      bg: "linear-gradient(135deg, #0E4035 0%, #1F6F5C 100%)",
      navBg: "rgba(14, 64, 53, 0.95)",
      accent: "#CEF17B",
      accentSecondary: "#1F6F5C",
    },
    orange: {
      bg: "linear-gradient(135deg, #C2410C 0%, #EA580C 100%)",
      navBg: "rgba(194, 65, 12, 0.95)",
      accent: "#FCD34D",
      accentSecondary: "#EA580C",
    },
    purple: {
      bg: "linear-gradient(135deg, #7E22CE 0%, #9333EA 100%)",
      navBg: "rgba(126, 34, 206, 0.95)",
      accent: "#F0ABFC",
      accentSecondary: "#9333EA",
    },
    red: {
      bg: "linear-gradient(135deg, #B91C1C 0%, #DC2626 100%)",
      navBg: "rgba(185, 28, 28, 0.95)",
      accent: "#FCA5A5",
      accentSecondary: "#DC2626",
    },
    yellow: {
      bg: "linear-gradient(135deg, #CA8A04 0%, #EAB308 100%)",
      navBg: "rgba(202, 138, 4, 0.95)",
      accent: "#FEF08A",
      accentSecondary: "#EAB308",
    },
    blue: {
      bg: "linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)",
      navBg: "rgba(30, 64, 175, 0.95)",
      accent: "#93C5FD",
      accentSecondary: "#2563EB",
    },
    pink: {
      bg: "linear-gradient(135deg, #DB2777 0%, #EC4899 100%)",
      navBg: "rgba(219, 39, 119, 0.95)",
      accent: "#FBCFE8",
      accentSecondary: "#EC4899",
    },
    teal: {
      bg: "linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)",
      navBg: "rgba(15, 118, 110, 0.95)",
      accent: "#5EEAD4",
      accentSecondary: "#14B8A6",
    },
    indigo: {
      bg: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)",
      navBg: "rgba(79, 70, 229, 0.95)",
      accent: "#C7D2FE",
      accentSecondary: "#6366F1",
    },
    emerald: {
      bg: "linear-gradient(135deg, #047857 0%, #10B981 100%)",
      navBg: "rgba(4, 120, 87, 0.95)",
      accent: "#6EE7B7",
      accentSecondary: "#10B981",
    },
    dark: {
      bg: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
      navBg: "rgba(15, 23, 42, 0.95)",
      accent: "#94A3B8",
      accentSecondary: "#1E293B",
    },
    light: {
      bg: "linear-gradient(135deg, #F1F5F9 0%, #FFFFFF 100%)",
      navBg: "rgba(241, 245, 249, 0.95)",
      accent: "#0F172A",
      accentSecondary: "#64748B",
    },
  };

  const currentTheme = themeConfig[theme] || themeConfig.default;

  return (
    <div className="min-h-screen transition-all duration-700" style={{ background: currentTheme.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', sans-serif;
          transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                      color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.18);
        }

        .nav-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-item:hover {
          transform: translateY(-2px);
        }

        .nav-item.active {
          transform: scale(1.1) translateY(-4px);
        }

        .bottom-navigation {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 99999 !important;
          pointer-events: auto !important;
          background: ${currentTheme.navBg};
          backdrop-filter: blur(20px);
          border-top: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.25);
        }

        .fade-in {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gradient-text {
          background: linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accentSecondary});
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: ${currentTheme.accent};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${currentTheme.accentSecondary};
        }
      `}</style>

      {/* Main Content */}
      <main className="pb-32 md:pb-8 min-h-screen fade-in">
        {children}
      </main>

      {/* Modern Bottom Navigation */}
      <nav className="bottom-navigation">
        <div className="max-w-lg mx-auto px-3">
          <div className="flex justify-around items-center py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`nav-item flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300 ${
                    active 
                      ? "active" 
                      : ""
                  }`}
                  style={{
                    background: active 
                      ? `linear-gradient(135deg, ${currentTheme.accent}20, ${currentTheme.accentSecondary}20)` 
                      : "transparent"
                  }}
                >
                  <Icon 
                    className={`w-5 h-5 transition-all ${
                      active ? 'drop-shadow-glow' : ''
                    }`}
                    style={{ 
                      color: active ? currentTheme.accent : 'rgba(255, 255, 255, 0.6)',
                      filter: active ? `drop-shadow(0 0 8px ${currentTheme.accent}40)` : 'none'
                    }}
                  />
                  <span 
                    className={`text-xs font-semibold transition-all ${
                      active ? 'tracking-wide' : ''
                    }`}
                    style={{ 
                      color: active ? currentTheme.accent : 'rgba(255, 255, 255, 0.6)'
                    }}
                  >
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