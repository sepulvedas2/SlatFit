import React, { createContext, useContext, useState, useEffect } from "react";

// Dark é a identidade principal. isLight = modo claro opcional.
const ThemeContext = createContext({ isDark: true, isLight: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [isLight, setIsLight] = useState(() => {
    try {
      return localStorage.getItem("fitlens_theme") === "light";
    } catch {
      return false;
    }
  });

  const isDark = !isLight;

  useEffect(() => {
    try {
      localStorage.setItem("fitlens_theme", isLight ? "light" : "dark");
    } catch (e) {
      // ignore
    }
    document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  }, [isLight]);

  // toggleTheme alterna entre dark (padrão) e light (opcional)
  const toggleTheme = () => setIsLight(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, isLight, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}