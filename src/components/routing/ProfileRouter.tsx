import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Box, Flex, VStack, Text } from '@chakra-ui/react';

interface ProfileRouterProps {
  children: React.ReactNode;
}

const ProfileRouter: React.FC<ProfileRouterProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.perfil) {
      const perfil = user.perfil.toLowerCase();
      const currentPath = location.pathname;

      // Se está na raiz ou home, redirecionar para dashboard específico
      if (currentPath === '/' || currentPath === '/home') {
        switch (perfil) {
          case 'aluno':
          case 'participante':
            navigate('/aluno/dashboard', { replace: true });
            break;
          case 'professor':
          case 'coordenacao':
            navigate('/professor/dashboard', { replace: true });
            break;
          case 'cpa':
            navigate('/cpa/dashboard', { replace: true });
            break;
          case 'administrador':
            navigate('/home', { replace: true });
            break;
          default:
            navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [isAuthenticated, user?.perfil, navigate, location.pathname]);

  // Se não está autenticado, mostrar loading
  if (!isAuthenticated) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Verificando autenticação...</Text>
        </VStack>
      </Box>
    );
  }

  // Se está autenticado mas não tem perfil definido, mostrar loading
  if (isAuthenticated && !user?.perfil) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Carregando perfil do usuário...</Text>
        </VStack>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProfileRouter;
