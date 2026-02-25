import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Dumbbell, UtensilsCrossed, User } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Global dark mode event so Profile page can toggle it
export const DARK_MODE_EVENT = "app-dark-mode-change";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Listen for dark mode toggle from any page (e.g. Profile)
  useEffect(() => {
    const handler = (e) => {
      setDarkMode(e.detail.darkMode);
    };
    window.addEventListener(DARK_MODE_EVENT, handler);
    return () => window.removeEventListener(DARK_MODE_EVENT, handler);
  }, []);

  // Apply CSS variables globally whenever darkMode changes
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
    const root = document.documentElement;
    if (darkMode) {
      root.style.setProperty("--app-bg", "#0F1C1B");
      root.style.setProperty("--app-card", "#162A28");
      root.style.setProperty("--app-nav", "#0F1C1B");
      root.style.setProperty("--app-text", "#FFFFFF");
      root.style.setProperty("--app-text-sub", "#A0B5B2");
      root.style.setProperty("--app-border", "rgba(255,255,255,0.07)");
      root.style.setProperty("--app-input-bg", "rgba(255,255,255,0.05)");
      root.setAttribute("data-theme", "dark");
    } else {
      root.style.setProperty("--app-bg", "#084734");
      root.style.setProperty("--app-card", "rgba(206,237,178,0.10)");
      root.style.setProperty("--app-nav", "#084734");
      root.style.setProperty("--app-text", "#FFFFFF");
      root.style.setProperty("--app-text-sub", "rgba(206,237,178,0.7)");
      root.style.setProperty("--app-border", "rgba(206,241,123,0.15)");
      root.style.setProperty("--app-input-bg", "rgba(255,255,255,0.07)");
      root.setAttribute("data-theme", "light");
    }
  }, [darkMode]);

  const navItems = [
    { name: "Início", icon: Home, path: createPageUrl("Dashboard") },
    { name: "Treinos", icon: Dumbbell, path: createPageUrl("Workouts") },
    { name: "Nutrição", icon: UtensilsCrossed, path: createPageUrl("SmartNutrition") },
    { name: "Perfil", icon: User, path: createPageUrl("Profile") },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--app-bg)", transition: "background 0.2s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --app-bg: #084734;
          --app-card: rgba(206,237,178,0.10);
          --app-nav: #084734;
          --app-text: #FFFFFF;
          --app-text-sub: rgba(206,237,178,0.7);
          --app-border: rgba(206,241,123,0.15);
          --app-input-bg: rgba(255,255,255,0.07);
        }

        * { font-family: 'Inter', sans-serif; -webkit-tap-highlight-color: transparent; }
        h1, h2, h3, h4, h5, h6 { font-family: 'Poppins', sans-serif; font-weight: 700; }

        body { overscroll-behavior: none; background: var(--app-bg); transition: background 0.2s ease; }

        /* Transition all surfaces */
        *, *::before, *::after { transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease; }

        .gradient-primary { background: linear-gradient(135deg, #084734, #CEF17B); }

        .gradient-card {
          background: linear-gradient(180deg, #CEEDB2, #CEF17B);
          backdrop-filter: blur(20px);
          border: 1px solid var(--app-border);
        }

        .glass-effect {
          background: var(--app-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--app-border);
        }

        /* Global card override for dark mode */
        [data-theme="dark"] .glass-effect,
        [data-theme="dark"] [class*="bg-slate"],
        [data-theme="dark"] [class*="bg-white/"] {
          background: var(--app-card) !important;
          border-color: var(--app-border) !important;
        }

        /* Input fields */
        [data-theme="dark"] input,
        [data-theme="dark"] textarea,
        [data-theme="dark"] select {
          background: var(--app-input-bg) !important;
          border-color: var(--app-border) !important;
          color: var(--app-text) !important;
        }

        /* shadcn Card in dark mode */
        [data-theme="dark"] .rounded-xl,
        [data-theme="dark"] .rounded-lg {
          background: var(--app-card);
          border-color: var(--app-border);
        }

        /* Modals / sheets */
        [data-theme="dark"] [role="dialog"],
        [data-theme="dark"] [data-radix-popper-content-wrapper] {
          background: var(--app-card) !important;
        }
      `}</style>

      {/* Main Content */}
      <main style={{
        paddingBottom: "calc(70px + max(env(safe-area-inset-bottom), 16px))",
        minHeight: "100dvh",
        overflowX: "hidden",
        background: "var(--app-bg)",
        transition: "background 0.2s ease",
      }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99999,
          backgroundColor: 'var(--app-nav)',
          borderTop: '1px solid var(--app-border)',
          paddingTop: '10px',
          paddingBottom: 'max(env(safe-area-inset-bottom), 14px)',
          height: 'auto',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          transition: 'background-color 0.2s ease',
        }}
      >
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
                justifyContent: 'center',
                gap: '4px',
                flex: 1,
                textDecoration: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon style={{ width: '26px', height: '26px', color: active ? '#CEF17B' : 'rgba(255,255,255,0.5)', strokeWidth: active ? 2.2 : 1.6 }} />
              <span style={{ fontSize: '11px', fontWeight: active ? 600 : 400, color: active ? '#CEF17B' : 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}