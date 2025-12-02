/**
 * Authentication Context
 * Manages authentication state across the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import tokenStorage from '@/utils/tokenStorage';

interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'retailer' | 'supplier' | null;
  userEmail: string | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userType: null,
  userEmail: null,
  loading: true,
  checkAuth: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<'retailer' | 'supplier' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const token = await tokenStorage.getAccessToken();
      const type = await tokenStorage.getUserType();
      const email = await tokenStorage.getUserEmail();

      if (token && type) {
        setIsAuthenticated(true);
        setUserType(type as 'retailer' | 'supplier');
        setUserEmail(email);
      } else {
        setIsAuthenticated(false);
        setUserType(null);
        setUserEmail(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUserType(null);
      setUserEmail(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await tokenStorage.clearAuth();
      setIsAuthenticated(false);
      setUserType(null);
      setUserEmail(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        userType,
        userEmail,
        loading,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
