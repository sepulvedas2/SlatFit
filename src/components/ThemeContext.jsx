import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext({ isDark: true, toggleTheme: () => null });

export function ThemeProvider({ children }) {
  const isDark = true; // Sempre modo escuro

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const toggleTheme = () => {}; // Desabilitado

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}