import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import authService from '@/services/auth.Service';
import { parseJwt, removeToken, setToken } from '@/utils/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.loginUser({ email, password });
    const token =
      response?.access_token ||
      response?.token ||
      response?.data?.access_token ||
      response?.data?.token;

    if (token) {
      setToken(JSON.stringify({ access_token: token }));
    }

    const apiUser = response?.user || response?.data?.user;
    const tokenPayload = token ? (parseJwt(token) as Record<string, any>) : null;

    const nextUser: User = apiUser || {
      id: String(tokenPayload?.sub || tokenPayload?.id || Date.now()),
      name: String(tokenPayload?.name || tokenPayload?.fullName || 'User'),
      email: String(tokenPayload?.email || email),
      role: (tokenPayload?.role as 'user' | 'admin') || 'user',
      createdAt: String(tokenPayload?.createdAt || new Date().toISOString()),
    };

    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));
  };

  const register = async (name: string, email: string, password: string) => {
    const newUser: User = {
      id: String(Date.now()),
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    removeToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
