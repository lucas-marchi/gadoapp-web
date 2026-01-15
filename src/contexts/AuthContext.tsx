import { createContext, useContext, useState, type ReactNode } from 'react';
import { db } from '../db/db';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('gadoapp_token');
    return !!token;
  });

  const [isLoading] = useState(false); 

  const login = (token: string) => {
    localStorage.setItem('gadoapp_token', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem('gadoapp_token');
    localStorage.removeItem('last_sync_herds');
    localStorage.removeItem('last_sync_bovines');
    
    await db.herds.clear();
    await db.bovines.clear();
    
    setIsAuthenticated(false);
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);