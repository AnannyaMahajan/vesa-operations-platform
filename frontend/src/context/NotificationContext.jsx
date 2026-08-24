import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const markRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markRead, markAllRead, showToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: toast.type === 'error' ? '#ef4444' : (toast.type === 'success' ? '#10b981' : '#2563eb'),
          color: 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>{toast.message}</span>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
