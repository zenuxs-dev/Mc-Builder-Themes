'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSite } from '@/lib/api';

export interface AuthUser {
  username: string;
  email?: string;
  loginType: 'advanced_auth' | 'zenuxs';
  token?: string;
  id?: string;
  _id?: string;
  name?: string;
  avatar?: string;
  zenuxsId?: string;
  minecraftUuid?: string;
  plan?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, token: string, loginType: 'advanced_auth' | 'zenuxs') => void;
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
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    getSite().then((site) => {
      if (site?.requireLoginForWebsite && !user) {
        const path = window.location.pathname;
        if (path !== '/login') {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
      }
    });
  }, [user, isLoading]);

  const login = (username: string, token: string, loginType: 'advanced_auth' | 'zenuxs') => {
    const newUser: AuthUser = { username, loginType, token };
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
