import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
      }
    }
  }, []);

  const login = (token: string, userData: User) => {
    Cookies.set('token', token, { expires: 1, path: '/' });
    Cookies.set('user', JSON.stringify(userData), { expires: 1, path: '/' });
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('token', { path: '/' });
    Cookies.remove('user', { path: '/' });
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 