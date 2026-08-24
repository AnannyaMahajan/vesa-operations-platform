import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vesa_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.id) {
        return parsed;
      }
      localStorage.removeItem('vesa_user');
      return null;
    } catch (e) {
      localStorage.removeItem('vesa_user');
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('vesa_jwt_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res && res.user && typeof res.user === 'object' && res.user.id) {
            setUser(res.user);
            localStorage.setItem('vesa_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Auth session check failed:', err.message);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }
    const res = await api.login({ email: email.trim(), password });
    if (!res || !res.token || !res.user || typeof res.user !== 'object') {
      throw new Error('Authentication failed: Invalid response from server.');
    }
    localStorage.setItem('vesa_jwt_token', res.token);
    localStorage.setItem('vesa_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('vesa_jwt_token');
    localStorage.removeItem('vesa_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
