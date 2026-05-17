'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('zenuxs_auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, token: string) => {
    const newUser = { username };
    setUser(newUser);
    localStorage.setItem('zenuxs_auth_user', JSON.stringify(newUser));
    localStorage.setItem('zenuxs_auth_token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zenuxs_auth_user');
    localStorage.removeItem('zenuxs_auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
