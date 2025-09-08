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
    
    console.log('🔍 AuthContext - Verificando autenticação:', {
      hasToken: !!token,
      hasUser: !!userStr,
      tokenLength: token?.length,
      userStrLength: userStr?.length
    });
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('✅ AuthContext - Usuário autenticado:', userData);
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        console.error('❌ AuthContext - Erro ao fazer parse do usuário:', error);
        logout();
      }
    } else {
      console.log('❌ AuthContext - Token ou usuário não encontrado');
    }
  }, []);

  const login = (token: string, userData: User) => {
    // Salvar token com expiração de 7 dias
    Cookies.set('token', token, { 
      expires: 7, 
      path: '/',
      secure: false, // Para desenvolvimento local
      sameSite: 'lax'
    });
    Cookies.set('user', JSON.stringify(userData), { 
      expires: 7, 
      path: '/',
      secure: false, // Para desenvolvimento local
      sameSite: 'lax'
    });
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