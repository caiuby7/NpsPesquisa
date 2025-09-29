import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Spinner, Alert, VStack, Text } from '@chakra-ui/react';
import { TotvsLoginService } from './totvs-login.service';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginTotvs() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const redirectBasedOnProfile = (perfil: string) => {
    const perfilLower = perfil.toLowerCase();
    console.log('🔄 TOTVS Login - Redirecionando baseado no perfil:', perfilLower);

    switch (perfilLower) {
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
  };

  const handleTotvsLogin = async (context: string, key: string) => {
    try {
      setLoading(true);
      
      console.log('TOTVS Login - Context:', context);
      console.log('TOTVS Login - Key:', key);
      
      const result = await TotvsLoginService.login(context, key);
      
      console.log('TOTVS Login - Result:', result);
      
      // Usar o AuthContext para fazer login
      login(result.token, {
        id: result.nome, // Usando nome como ID para compatibilidade
        name: result.nome,
        email: result.email,
        perfil: result.perfil
      });
      
      // Redirecionamento baseado no perfil
      redirectBasedOnProfile(result.perfil);
    } catch (err) {
      console.error('Erro no login TOTVS:', err);
      setError(err instanceof Error ? err.message : 'Erro interno do servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Pegar parâmetros da URL usando URLSearchParams
    const urlParams = new URLSearchParams(location.search);
    const context = urlParams.get('Context') || urlParams.get('context');
    
    // Aceitar ambos os formatos: 'key' única OU 'Key1'/'Key2'
    const key = urlParams.get('key') || urlParams.get('Key');
    const key1 = urlParams.get('Key1') || urlParams.get('key1');
    const key2 = urlParams.get('Key2') || urlParams.get('key2');
    
    // Determinar qual chave usar (aceitar ambos os formatos)
    let finalKey = key;
    if (!finalKey && (key1 || key2)) {
      // Se não tem 'key', usar Key1 ou Key2 (formato TOTVS)
      finalKey = key1 || key2;
    }
    
    console.log('LoginTotvs - URL completa:', window.location.href);
    console.log('LoginTotvs - URL search:', location.search);
    console.log('LoginTotvs - Context param:', context);
    console.log('LoginTotvs - Key param:', key);
    console.log('LoginTotvs - Key1 param:', key1);
    console.log('LoginTotvs - Key2 param:', key2);
    console.log('LoginTotvs - Final key:', finalKey);
    console.log('LoginTotvs - Todos os parâmetros:', Array.from(urlParams.entries()));
    
    if (context && finalKey) {
      console.log('LoginTotvs - Parâmetros encontrados, iniciando login...');
      handleTotvsLogin(context, finalKey);
    } else {
      console.error('LoginTotvs - Parâmetros TOTVS não encontrados:', {
        context: !!context,
        key: !!key,
        key1: !!key1,
        key2: !!key2,
        finalKey: !!finalKey,
        allParams: Array.from(urlParams.entries())
      });
      setError('Parâmetros TOTVS não encontrados. Verifique se o link está correto.');
      setLoading(false);
    }
  }, [location.search, login]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minH="100vh"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Processando login TOTVS...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minH="100vh"
        bg="gray.50"
        p={4}
      >
        <VStack spacing={4} maxW="md" w="full">
          <Alert status="error" borderRadius="md">
            <VStack spacing={2} align="start">
              <Text fontWeight="bold">Erro no Login TOTVS</Text>
              <Text fontSize="sm">{error}</Text>
            </VStack>
          </Alert>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Entre em contato com o suporte técnico se o problema persistir.
          </Text>
        </VStack>
      </Box>
    );
  }

  return null;
}
