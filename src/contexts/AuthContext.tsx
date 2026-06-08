import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { db } from '../db/db';
import { api } from '../lib/axios';

interface UserData {
  name: string;
  email: string;
  subscriptionStatus?: string;
  stripePriceId?: string;
  limits?: {
    maxFarms: number;
    maxHerdsPerFarm: number;
    maxBovinesPerFarm: number;
    maxInvitesPerFarm: number;
  };
  usage?: {
    farms: number;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string, userData?: UserData) => void;
  logout: () => void;
  updateUser: (data: Partial<UserData>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('gadoapp_token');
    return !!token;
  });

  const [user, setUser] = useState<UserData | null>(() => {
    const cached = localStorage.getItem('gadoapp_user');
    return cached ? JSON.parse(cached) : null;
  });

  const [isLoading] = useState(false); 

  useEffect(() => {
    if (isAuthenticated) {
      api.get("/profile")
        .then((res) => {
          updateUser({
            name: res.data.name,
            subscriptionStatus: res.data.subscriptionStatus,
            stripePriceId: res.data.stripePriceId,
            limits: res.data.limits,
            usage: res.data.usage,
          });
        })
        .catch(console.error);
    }
  }, [isAuthenticated]);

  const login = (token: string, userData?: UserData) => {
    localStorage.setItem('gadoapp_token', token);
    if (userData) {
      localStorage.setItem('gadoapp_user', JSON.stringify(userData));
      setUser(userData);
    }
    setIsAuthenticated(true);
  };

  const updateUser = (data: Partial<UserData>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...data };
      localStorage.setItem('gadoapp_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    localStorage.removeItem('gadoapp_token');
    localStorage.removeItem('gadoapp_user');
    localStorage.removeItem('gadoapp_farms');
    localStorage.removeItem('gadoapp_active_farm_id');
    localStorage.removeItem('last_sync_herds');
    localStorage.removeItem('last_sync_bovines');
    localStorage.removeItem('last_sync_weight_records');
    localStorage.removeItem('last_sync_birth_records');
    localStorage.removeItem('last_sync_health_records');
    
    await db.herds.clear();
    await db.bovines.clear();
    await db.weightRecords.clear();
    await db.birthRecords.clear();
    await db.healthRecords.clear();
    
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);