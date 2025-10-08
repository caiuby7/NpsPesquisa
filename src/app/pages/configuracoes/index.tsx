import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Divider,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSettings, 
  FiShield, 
  FiUsers, 
  FiDatabase,
  FiSliders,
  FiChevronRight
} from 'react-icons/fi';

const ConfiguracoesPage: React.FC = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const configuracoes = [
    {
      id: 'regras-cascata',
      titulo: 'Regras em Cascata',
      descricao: 'Configure as regras de combinação entre diferentes tipos de dados',
      icone: FiShield,
      rota: '/configuracoes/regras-cascata',
      badge: 'Sistema',
      badgeColor: 'blue',
      disponivel: true
    },
    {
      id: 'usuarios',
      titulo: 'Gestão de Usuários',
      descricao: 'Administre usuários, perfis e permissões do sistema',
      icone: FiUsers,
      rota: '/configuracoes/usuarios',
      badge: 'Em Breve',
      badgeColor: 'gray',
      disponivel: false
    },
    {
      id: 'banco-dados',
      titulo: 'Configurações de Banco',
      descricao: 'Configurações avançadas de sincronização e backup',
      icone: FiDatabase,
      rota: '/configuracoes/banco-dados',
      badge: 'Em Breve',
      badgeColor: 'gray',
      disponivel: false
    },
    {
      id: 'sistema',
      titulo: 'Configurações Gerais',
      descricao: 'Configurações gerais do sistema e preferências',
      icone: FiSliders,
      rota: '/configuracoes/sistema',
      badge: 'Em Breve',
      badgeColor: 'gray',
      disponivel: false
    }
  ];

  const handleConfiguracaoClick = (configuracao: typeof configuracoes[0]) => {
    if (configuracao.disponivel) {
      navigate(configuracao.rota);
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <HStack spacing={3} align="center" mb={2}>
            <Icon as={FiSettings} boxSize={8} color="blue.500" />
            <VStack align="start" spacing={0}>
              <Heading size="lg" color="gray.700">
                Configurações do Sistema
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Gerencie as configurações e regras do sistema
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Divider />

        {/* Grid de Configurações */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {configuracoes.map((configuracao) => (
            <Card
              key={configuracao.id}
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              cursor={configuracao.disponivel ? 'pointer' : 'not-allowed'}
              opacity={configuracao.disponivel ? 1 : 0.6}
              _hover={configuracao.disponivel ? { 
                bg: hoverBg,
                transform: 'translateY(-2px)',
                boxShadow: 'lg'
              } : {}}
              transition="all 0.2s"
              onClick={() => handleConfiguracaoClick(configuracao)}
            >
              <CardHeader pb={3}>
                <HStack justify="space-between" align="start">
                  <HStack spacing={3}>
                    <Box
                      p={2}
                      bg={configuracao.disponivel ? 'blue.50' : 'gray.100'}
                      borderRadius="md"
                    >
                      <Icon 
                        as={configuracao.icone} 
                        boxSize={6} 
                        color={configuracao.disponivel ? 'blue.500' : 'gray.400'} 
                      />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" fontSize="md">
                        {configuracao.titulo}
                      </Text>
                      <Badge
                        size="sm"
                        colorScheme={configuracao.badgeColor}
                        variant="subtle"
                      >
                        {configuracao.badge}
                      </Badge>
                    </VStack>
                  </HStack>
                  {configuracao.disponivel && (
                    <Icon as={FiChevronRight} boxSize={5} color="gray.400" />
                  )}
                </HStack>
              </CardHeader>
              
              <CardBody pt={0}>
                <Text color="gray.600" fontSize="sm" lineHeight="1.5">
                  {configuracao.descricao}
                </Text>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Informações Adicionais */}
        <Card bg={useColorModeValue('blue.50', 'blue.900')} borderColor="blue.200">
          <CardBody>
            <VStack spacing={3} align="start">
              <HStack spacing={2}>
                <Icon as={FiSettings} boxSize={5} color="blue.500" />
                <Text fontWeight="semibold" color="blue.700">
                  Sobre as Configurações
                </Text>
              </HStack>
              <Text fontSize="sm" color="blue.600" lineHeight="1.5">
                As configurações do sistema permitem personalizar o comportamento da aplicação 
                de acordo com as necessidades da sua instituição. Configure regras, permissões 
                e integrações para otimizar o uso da plataforma.
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default ConfiguracoesPage;
