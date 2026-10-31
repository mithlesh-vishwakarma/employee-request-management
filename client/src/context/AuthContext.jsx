import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../constants';
import { loginApi, logoutApi, getMeApi } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('erm_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!currentUser);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Validate session against database on initial load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('erm_token');
      if (token) {
        try {
          const res = await getMeApi();
          if (res?.data) {
            const user = res.data;
            setCurrentUser(user);
            setIsAuthenticated(true);
            localStorage.setItem('erm_auth_user', JSON.stringify(user));
          }
        } catch (err) {
          console.warn('[Auth] Session validation failed:', err.message);
          localStorage.removeItem('erm_token');
          localStorage.removeItem('erm_auth_user');
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  // Real backend Login
  const login = async (email, password) => {
    setAuthError('');
    try {
      const res = await loginApi(email, password);
      if (res?.user && res?.token) {
        localStorage.setItem('erm_token', res.token);
        localStorage.setItem('erm_auth_user', JSON.stringify(res.user));
        setCurrentUser(res.user);
        setIsAuthenticated(true);
        return { success: true, user: res.user };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      const message = err.message || 'Invalid email or password';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  // Real backend Logout
  const logout = async () => {
    try {
      await logoutApi();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('erm_token');
    localStorage.removeItem('erm_auth_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loading,
        authError,
        role: currentUser?.role || null,
        isAdmin: currentUser?.role === ROLES.ADMIN,
        isManager: currentUser?.role === ROLES.MANAGER,
        isEmployee: currentUser?.role === ROLES.EMPLOYEE,
        login,
        logout,
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
