import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '@/api/client';
import { getStoredToken, getStoredUser, clearUser } from '@/components/auth';
import { queryClientInstance } from '@/lib/query-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const validateSession = useCallback(async () => {
    setIsLoading(true);
    setAuthError('');
    try {
      if (!getStoredToken()) {
        setUser(null);
        setIsAuthenticated(false);
        return;
      }
      const stored = getStoredUser();
      if (stored) setUser(stored);
      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      // Token missing/expired/invalid -> drop the session entirely.
      clearUser();
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(error.message || 'Não foi possível validar o login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = useCallback(async (email, password) => {
    const loggedUser = await api.auth.login(email, password);
    queryClientInstance.clear();
    setAuthError('');
    setUser(loggedUser);
    setIsAuthenticated(true);
    return loggedUser;
  }, []);

  const register = useCallback(async (email, password, fullName) => {
    const newUser = await api.auth.register(email, password, fullName);
    queryClientInstance.clear();
    setAuthError('');
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    queryClientInstance.clear();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authError,
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
