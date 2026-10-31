import React, { createContext, useContext, useState } from 'react';
import { INITIAL_NOTIFICATIONS } from '../constants';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
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

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = (userId) => {
    setNotifications((prev) =>
      prev.map((n) =>
        !userId || n.recipientId === userId ? { ...n, isRead: true } : n
      )
    );
    showToast('All notifications marked as read', 'success');
  };

  const addNotification = ({ recipientId, title, message, type = 'general', requestId }) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      recipientId,
      requestId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToast(title, type === 'request_reminder' ? 'warning' : 'info');
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        showToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        addNotification,
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
