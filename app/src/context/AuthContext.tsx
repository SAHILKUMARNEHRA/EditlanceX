import React, { createContext, useContext, useState, useEffect } from 'react';
import * as api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'editor' | 'client';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string, phone: string) => Promise<void>;
  googleLogin: (token: string, role?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const data = await api.getCurrentUser();
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: string, phone: string) => {
    setIsLoading(true);
    try {
      const data = await api.signup(name, email, password, role, phone);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (token: string, role?: string) => {
    setIsLoading(true);
    try {
      const data = await api.googleLogin(token, role);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, signup, googleLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
