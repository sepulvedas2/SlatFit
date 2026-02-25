import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Dumbbell, UtensilsCrossed, User, ScanLine } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const navItems = [
    { name: "Início", icon: Home, path: createPageUrl("Dashboard") },
    { name: "Treinos", icon: Dumbbell, path: createPageUrl("Workouts") },
    { name: "Nutrição", icon: UtensilsCrossed, path: createPageUrl("SmartNutrition") },
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
          backdrop-filter: blur(20px);
          border: 1px solid rgba(206, 241, 123, 0.2);
        }
        
        .glass-effect {
          background: rgba(206, 237, 178, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(206, 241, 123, 0.2);
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
      <main className="pb-28 min-h-screen">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="bottom-navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(8, 71, 52, 0.97)',
          borderTop: '1px solid rgba(206, 241, 123, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingTop: '10px', paddingBottom: '10px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  flex: 1,
                  padding: '6px 4px',
                  borderRadius: '12px',
                  backgroundColor: active ? 'rgba(206, 241, 123, 0.15)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'background 0.2s',
                }}
              >
                <Icon
                  style={{
                    width: '24px',
                    height: '24px',
                    color: active ? '#CEF17B' : 'rgba(255,255,255,0.6)',
                  }}
                />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: active ? '#CEF17B' : 'rgba(255,255,255,0.6)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}