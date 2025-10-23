import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Camera, Dumbbell, UtensilsCrossed, User } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const navItems = [
    { name: "Início", icon: Home, path: createPageUrl("Dashboard") },
    { name: "Scanner", icon: Camera, path: createPageUrl("FoodScanner") },
    { name: "Treinos", icon: Dumbbell, path: createPageUrl("Workouts") },
    { name: "Refeições", icon: UtensilsCrossed, path: createPageUrl("MealPlans") },
    { name: "Perfil", icon: User, path: createPageUrl("Profile") },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#084734]">
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
          background: linear-gradient(180deg, #CEEDB2, #CEF17B);
        }
        
        .gradient-button {
          background: linear-gradient(90deg, #CEF17B, #CEEDB2);
        }
        
        .glass-effect {
          background: rgba(206, 237, 178, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(206, 241, 123, 0.2);
        }
      `}</style>

      {/* Main Content */}
      <main className="pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-effect z-50 border-t border-[#CEF17B]/20">
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