import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se o token está presente no localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return { isAuthenticated };
}; 