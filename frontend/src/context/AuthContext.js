import React, { createContext, useState, useContext } from 'react';
import { STORAGE_KEY } from '../axiosConfig';

const AuthContext = createContext(null);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.token ? parsed : null;
  } catch (_) {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());

  const login = (userData) => {
    setUser(userData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    } catch (_) {
      // Ignore storage quota issues in restricted browsers
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      // Ignore storage errors
    }
  };

  const isAdmin = Boolean(user && (user.role === 'educator' || user.role === 'admin'));
  const isStudent = Boolean(user && user.role === 'student');

  return (
    <AuthContext.Provider value={{ user, isAdmin, isStudent, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
