import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URLS } from '../../config/api-urls';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Button,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Icon,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import {
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';
// import MainLayout from '../../components/layout/main-layout.component';
import { useAuth } from '../../contexts/AuthContext';

interface Questionario {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  status: 'disponivel' | 'respondido' | 'expirado';
  tipoItemAvaliado: string;
  progresso?: number;
  chave: string;
}

const AlunoDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Buscar avaliações disponíveis para o usuário
  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        setLoading(true);
        
        const response = await fetch(API_URLS.AVALIACOES_DISPONIVEIS, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setQuestionarios(data || []);
        } else {
          console.error('Erro ao buscar avaliações:', response.statusText);
          setQuestionarios([]);
        }
      } catch (error) {
        console.error('Erro ao conectar com a API:', error);
        setQuestionarios([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAvaliacoes();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'green';
      case 'respondido':
        return 'blue';
      case 'expirado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'Disponível';
      case 'respondido':
        return 'Respondido';
      case 'expirado':
        return 'Expirado';
      default:
        return 'Desconhecido';
    }
  };

  const questionariosDisponiveis = questionarios.filter(q => q.status === 'disponivel').length;
  const questionariosRespondidos = questionarios.filter(q => q.status === 'respondido').length;
  const totalQuestionarios = questionarios.length;

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="6xl">
          <Flex justify="center" align="center" h="400px">
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>Carregando questionários...</Text>
            </VStack>
          </Flex>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" color="blue.600" mb={2}>
              Olá, {user?.name}!
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Aqui estão seus questionários disponíveis para responder
            </Text>
          </Box>

            {/* Estatísticas */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Questionários Disponíveis</StatLabel>
                    <StatNumber color="green.500">{questionariosDisponiveis}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Prontos para responder
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Questionários Respondidos</StatLabel>
                    <StatNumber color="blue.500">{questionariosRespondidos}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Concluídos com sucesso
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <Stat>
                    <StatLabel>Total de Questionários</StatLabel>
                    <StatNumber color="purple.500">{totalQuestionarios}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Todos os questionários
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Questionários Disponíveis */}
            <Box>
              <Heading size="lg" mb={6} color="blue.600">
                📚 Questionários Disponíveis
              </Heading>
              
              {questionariosDisponiveis === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Nenhum questionário disponível!</AlertTitle>
                    <AlertDescription>
                      Não há questionários para responder no momento. Verifique novamente mais tarde.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : questionarios.filter(q => q.status === 'disponivel').length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={BookOpen} w={16} h={16} color="gray.400" mb={4} />
                  <Text fontSize="lg" color="gray.600" mb={2}>
                    Nenhum questionário disponível
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Não há questionários disponíveis para responder no momento.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {questionarios
                    .filter(q => q.status === 'disponivel')
                    .map((questionario) => (
                      <Card key={questionario.id} bg={cardBg} border="1px solid" borderColor={borderColor} _hover={{ shadow: 'lg' }}>
                        <CardHeader>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={2} flex="1">
                              <Heading size="md" color="blue.600">
                                {questionario.titulo}
                              </Heading>
                              <Text fontSize="sm" color="gray.600">
                                {questionario.descricao}
                              </Text>
                            </VStack>
                            <Badge colorScheme={getStatusColor(questionario.status)}>
                              {getStatusText(questionario.status)}
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={Calendar} w={4} h={4} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {new Date(questionario.dataFim).toLocaleDateString('pt-BR')}
                                </Text>
                              </HStack>
                              <HStack>
                                <Icon as={FileText} w={4} h={4} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {questionario.tipoItemAvaliado}
                                </Text>
                              </HStack>
                            </HStack>
                            
                            <Button
                              colorScheme="blue"
                              size="md"
                              leftIcon={<Icon as={BookOpen} w={4} h={4} />}
                              onClick={() => {
                                // Navegar para responder o questionário usando a chave
                                navigate(`/questionario/${questionario.chave}`);
                              }}
                            >
                              Responder Questionário
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </SimpleGrid>
              )}
            </Box>

            {/* Questionários Respondidos */}
            <Box>
              <Heading size="lg" mb={6} color="green.600">
                ✅ Questionários Respondidos
              </Heading>
              
              {questionarios.filter(q => q.status === 'respondido').length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={CheckCircle} w={16} h={16} color="gray.400" mb={4} />
                  <Text fontSize="lg" color="gray.600" mb={2}>
                    Nenhum questionário respondido
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Você ainda não respondeu nenhum questionário.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {questionarios
                    .filter(q => q.status === 'respondido')
                    .map((questionario) => (
                      <Card key={questionario.id} bg={cardBg} border="1px solid" borderColor={borderColor}>
                        <CardHeader>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={2} flex="1">
                              <Heading size="md" color="green.600">
                                {questionario.titulo}
                              </Heading>
                              <Text fontSize="sm" color="gray.600">
                                {questionario.descricao}
                              </Text>
                            </VStack>
                            <Badge colorScheme={getStatusColor(questionario.status)}>
                              {getStatusText(questionario.status)}
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={CheckCircle} w={4} h={4} color="green.500" />
                                <Text fontSize="sm" color="green.600" fontWeight="medium">
                                  Concluído
                                </Text>
                              </HStack>
                              <HStack>
                                <Icon as={FileText} w={4} h={4} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {questionario.tipoItemAvaliado}
                                </Text>
                              </HStack>
                            </HStack>
                            
                            {/* Botão Ver Histórico removido conforme solicitado */}
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </SimpleGrid>
              )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AlunoDashboard;
