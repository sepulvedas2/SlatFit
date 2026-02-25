import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Dumbbell, UtensilsCrossed, User, ScanLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { ThemeProvider, useTheme } from "./components/ThemeContext";

function AppLayout({ children, currentPageName }) {
  const location = useLocation();
  const { isDark } = useTheme();

  const navItems = [
    { name: "Início", icon: Home, path: createPageUrl("Dashboard") },
    { name: "Treinos", icon: Dumbbell, path: createPageUrl("Workouts") },
    { name: "Scanner", icon: ScanLine, path: createPageUrl("FoodScanner") },
    { name: "Nutrição", icon: UtensilsCrossed, path: createPageUrl("SmartNutrition") },
    { name: "Perfil", icon: User, path: createPageUrl("Profile") },
  ];

  const isActive = (path) => location.pathname === path;

  const bg = isDark ? "#0F1C1B" : "#084734";
  const navBg = isDark ? "#0F1C1B" : "rgba(8, 71, 52, 0.97)";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: bg, transition: "background-color 0.2s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        * { font-family: 'Inter', sans-serif; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Poppins', sans-serif; font-weight: 700; }

        :root {
          --app-bg: ${isDark ? "#0F1C1B" : "#084734"};
          --card-bg: ${isDark ? "#162A28" : "rgba(206, 237, 178, 0.1)"};
          --card-border: ${isDark ? "rgba(206,241,123,0.15)" : "rgba(206,241,123,0.2)"};
          --text-primary: #FFFFFF;
          --text-secondary: ${isDark ? "#A0B5B2" : "#CEEDB2"};
          --accent: #CEF17B;
          --transition: all 0.2s ease;
        }

        body, #root {
          background-color: var(--app-bg) !important;
          transition: background-color 0.2s ease;
        }

        .gradient-primary { background: linear-gradient(135deg, #084734, #CEF17B); }

        .glass-effect {
          background: var(--card-bg) !important;
          backdrop-filter: blur(20px);
          border: 1px solid var(--card-border) !important;
          transition: var(--transition);
        }

        .gradient-card {
          background: linear-gradient(180deg, #CEEDB2, #CEF17B);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(206, 241, 123, 0.2);
        }

        /* Dark mode: override any white/light backgrounds */
        [data-theme="dark"] .bg-white,
        [data-theme="dark"] .bg-gray-50,
        [data-theme="dark"] .bg-gray-100,
        [data-theme="dark"] .bg-slate-50,
        [data-theme="dark"] .bg-slate-100 {
          background-color: #162A28 !important;
        }
        [data-theme="dark"] .text-gray-900,
        [data-theme="dark"] .text-gray-800,
        [data-theme="dark"] .text-gray-700 {
          color: #FFFFFF !important;
        }
        [data-theme="dark"] .text-gray-600,
        [data-theme="dark"] .text-gray-500,
        [data-theme="dark"] .text-gray-400 {
          color: #A0B5B2 !important;
        }
        [data-theme="dark"] input,
        [data-theme="dark"] textarea,
        [data-theme="dark"] select {
          background-color: #1e3a38 !important;
          color: #fff !important;
          border-color: rgba(206,241,123,0.2) !important;
        }
        [data-theme="dark"] .border-gray-200,
        [data-theme="dark"] .border-gray-300 {
          border-color: rgba(206,241,123,0.15) !important;
        }

        .bottom-navigation {
          position: fixed !important;
          bottom: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 99999 !important;
        }
      `}</style>

      <main className="pb-28 min-h-screen">
        {children}
      </main>

      <nav
        className="bottom-navigation"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          backgroundColor: navBg,
          borderTop: '1px solid rgba(206, 241, 123, 0.2)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          transition: 'background-color 0.2s ease',
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
                <Icon style={{ width: '24px', height: '24px', color: active ? '#CEF17B' : 'rgba(255,255,255,0.6)' }} />
                <span style={{ fontSize: '11px', fontWeight: 500, color: active ? '#CEF17B' : 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>
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

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <AppLayout currentPageName={currentPageName}>{children}</AppLayout>
    </ThemeProvider>
  );
}