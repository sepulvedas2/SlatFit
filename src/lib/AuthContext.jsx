import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { getStoredToken, getStoredUser, clearUser } from '@/components/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    // Optimistically hydrate from the stored user so the UI is responsive,
    // then confirm the session against the backend.
    const stored = getStoredUser();
    if (stored) setUser(stored);

    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      // Token missing/expired/invalid -> drop the session entirely.
      clearUser();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = useCallback(async (email, password) => {
    const loggedUser = await api.auth.login(email, password);
    setUser(loggedUser);
    setIsAuthenticated(true);
    return loggedUser;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const newUser = await api.auth.register(email, password, fullName);
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    api.auth.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refresh: validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
