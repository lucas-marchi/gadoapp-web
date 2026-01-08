import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy Initialization: Lê o localStorage apenas uma vez na inicialização
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('gadoapp_token');
    return !!token;
  });

  const [isLoading] = useState(false); 

  const login = (token: string) => {
    localStorage.setItem('gadoapp_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('gadoapp_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);