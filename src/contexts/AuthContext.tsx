import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { mockApi } from '../services/mockApi';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('usaii-labs-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    console.log('🚀 Login process started:', email);
    try {
      const authenticatedUser = await mockApi.authenticate(email, password);
      if (authenticatedUser) {
        console.log('✅ Login successful, setting user:', authenticatedUser.name, authenticatedUser.role);
        setUser(authenticatedUser);
        localStorage.setItem('usaii-labs-user', JSON.stringify(authenticatedUser));
        console.log('💾 User saved to localStorage');
        return true;
      }
      console.log('❌ Login failed: Invalid credentials or user status');
      return false;
    } catch (error) {
      console.error('🚨 Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usaii-labs-user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};