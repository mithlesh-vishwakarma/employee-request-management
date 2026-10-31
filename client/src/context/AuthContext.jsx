import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USERS, ROLES } from '../constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to Admin or retrieve from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('erm_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_USERS[0]; // Admin by default
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!currentUser);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('erm_auth_user', JSON.stringify(currentUser));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('erm_auth_user');
      setIsAuthenticated(false);
    }
  }, [currentUser]);

  // Login handler
  const login = (email, password) => {
    // Find matching demo user by email or fallback to demo employee
    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (matched) {
      setCurrentUser(matched);
      return { success: true, user: matched };
    }
    // Generic fallback for custom email during demo
    const customUser = {
      id: `u-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: ROLES.EMPLOYEE,
      department: 'Engineering',
      employeeId: 'EMP-999',
      managerId: 'u-mgr-1',
      managerName: 'David Vance (Manager)',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
    setCurrentUser(customUser);
    return { success: true, user: customUser };
  };

  // Switch demo account directly for fast interview verification
  const switchDemoRole = (role) => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role: currentUser?.role || null,
        isAdmin: currentUser?.role === ROLES.ADMIN,
        isManager: currentUser?.role === ROLES.MANAGER,
        isEmployee: currentUser?.role === ROLES.EMPLOYEE,
        login,
        logout,
        switchDemoRole,
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
