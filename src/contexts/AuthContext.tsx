import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface User {
  id: string;
  name: string;
  email: string;
  perfil: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token') || localStorage.getItem('token');
    const userStr = Cookies.get('user') || localStorage.getItem('user');
    
    console.log('🔍 AuthContext - Verificando autenticação:', {
      hasToken: !!token,
      hasUser: !!userStr,
      tokenLength: token?.length,
      userStrLength: userStr?.length,
      cookieToken: !!Cookies.get('token'),
      localStorageToken: !!localStorage.getItem('token'),
      cookieUser: !!Cookies.get('user'),
      localStorageUser: !!localStorage.getItem('user')
    });
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('✅ AuthContext - Usuário autenticado:', userData);
        setIsAuthenticated(true);
        setUser(userData);
        setIsLoading(false);
        
        // Sincronizar token entre cookies e localStorage
        if (Cookies.get('token') && !localStorage.getItem('token')) {
          console.log('🔄 Sincronizando token: cookies -> localStorage');
          localStorage.setItem('token', token);
        }
        if (localStorage.getItem('token') && !Cookies.get('token')) {
          console.log('🔄 Sincronizando token: localStorage -> cookies');
          Cookies.set('token', token, { 
            expires: 7, 
            path: '/',
            secure: false,
            sameSite: 'lax'
          });
        }
        
        // Sincronizar user entre cookies e localStorage
        if (Cookies.get('user') && !localStorage.getItem('user')) {
          console.log('🔄 Sincronizando user: cookies -> localStorage');
          localStorage.setItem('user', userStr);
        }
        if (localStorage.getItem('user') && !Cookies.get('user')) {
          console.log('🔄 Sincronizando user: localStorage -> cookies');
          Cookies.set('user', userStr, { 
            expires: 7, 
            path: '/',
            secure: false,
            sameSite: 'lax'
          });
        }
      } catch (error) {
        console.error('❌ AuthContext - Erro ao fazer parse do usuário:', error);
        console.log('❌ AuthContext - Dados do usuário inválidos, fazendo logout');
        setIsLoading(false);
        logout();
      }
    } else {
      console.log('❌ AuthContext - Token ou usuário não encontrado');
      console.log('❌ AuthContext - Detalhes:', {
        token: token ? 'encontrado' : 'não encontrado',
        userStr: userStr ? 'encontrado' : 'não encontrado'
      });
      setIsLoading(false);
    }
  }, []);

  const login = (token: string, userData: User) => {
    // Salvar token com expiração de 7 dias em ambos os locais
    Cookies.set('token', token, { 
      expires: 7, 
      path: '/',
      secure: false, // Para desenvolvimento local
      sameSite: 'lax'
    });
    localStorage.setItem('token', token);
    
    Cookies.set('user', JSON.stringify(userData), { 
      expires: 7, 
      path: '/',
      secure: false, // Para desenvolvimento local
      sameSite: 'lax'
    });
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsAuthenticated(true);
    setUser(userData);
    setIsLoading(false);
  };

  const logout = () => {
    Cookies.remove('token', { path: '/' });
    Cookies.remove('user', { path: '/' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 
