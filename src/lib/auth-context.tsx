'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { INITIAL_USERS } from './mock-data';

interface AuthContextType {
  currentUser: User;
  switchUser: (userId: string) => void;
  availableUsers: User[];
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // default admin
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUserId = localStorage.getItem('primewave_current_user_id');
    if (savedUserId) {
      const found = INITIAL_USERS.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
      }
    }
  }, []);

  const switchUser = (userId: string) => {
    const found = INITIAL_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('primewave_current_user_id', found.id);
      // Also set a cookie so server requests can read it if needed
      document.cookie = `primewave_user_id=${found.id}; path=/; max-age=864000`;
    }
  };

  const logout = () => {
    setCurrentUser(INITIAL_USERS[1]); // switch to regular user
    localStorage.removeItem('primewave_current_user_id');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        switchUser,
        availableUsers: INITIAL_USERS,
        isAdmin: currentUser.role === 'ADMIN',
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
