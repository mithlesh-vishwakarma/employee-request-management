import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
} from '../services/notificationApi';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Toast alert trigger
  const showToast = (message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch real notifications from database
  const refreshNotifications = async () => {
    const token = localStorage.getItem('erm_token');
    if (!token) return;

    try {
      const [listRes, countRes] = await Promise.all([
        getNotificationsApi({ limit: 20 }),
        getUnreadCountApi(),
      ]);

      if (listRes?.data) {
        setNotifications(listRes.data);
      }
      if (countRes?.data) {
        setUnreadCount(countRes.data.unreadCount || 0);
      }
    } catch (err) {
      // ignore if unauthenticated
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      console.warn('Failed to mark all read:', err.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
