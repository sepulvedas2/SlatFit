import React, { createContext, useContext } from "react";

const ThemeContext = createContext({ isDark: true, isLight: false, toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  return (
    <ThemeContext.Provider value={{ isDark: true, isLight: false, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}