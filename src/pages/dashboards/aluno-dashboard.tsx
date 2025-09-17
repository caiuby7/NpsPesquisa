import React, { useState, useEffect } from 'react';
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
import MainLayout from '../../components/layout/main-layout.component';
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
}

const AlunoDashboard: React.FC = () => {
  const { user } = useAuth();
  const [questionarios, setQuestionarios] = useState<Questionario[]>([]);
  const [loading, setLoading] = useState(true);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Mock data - substituir por chamada à API
  useEffect(() => {
    const mockQuestionarios: Questionario[] = [
      {
        id: 1,
        titulo: 'Avaliação de Professores - Matemática',
        descricao: 'Avalie o desempenho do professor de Matemática',
        dataInicio: '2024-09-01',
        dataFim: '2024-09-30',
        status: 'disponivel',
        tipoItemAvaliado: 'Professor',
        progresso: 0
      },
      {
        id: 2,
        titulo: 'Avaliação de Disciplina - Física',
        descricao: 'Avalie a disciplina de Física',
        dataInicio: '2024-09-01',
        dataFim: '2024-09-30',
        status: 'respondido',
        tipoItemAvaliado: 'Disciplina',
        progresso: 100
      },
      {
        id: 3,
        titulo: 'Avaliação de Infraestrutura',
        descricao: 'Avalie a infraestrutura da instituição',
        dataInicio: '2024-09-01',
        dataFim: '2024-09-30',
        status: 'disponivel',
        tipoItemAvaliado: 'Infraestrutura',
        progresso: 0
      }
    ];

    setTimeout(() => {
      setQuestionarios(mockQuestionarios);
      setLoading(false);
    }, 1000);
  }, []);

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
      <MainLayout>
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
      </MainLayout>
    );
  }

  return (
    <MainLayout>
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
                                // Navegar para o questionário
                                window.location.href = `/questionario/${questionario.id}`;
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
            {questionariosRespondidos > 0 && (
              <Box>
                <Heading size="lg" mb={6} color="green.600">
                  ✅ Questionários Respondidos
                </Heading>
                
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
                            
                            <Button
                              variant="outline"
                              colorScheme="green"
                              size="md"
                              leftIcon={<Icon as={TrendingUp} w={4} h={4} />}
                              onClick={() => {
                                // Ver histórico ou relatório
                                console.log('Ver histórico do questionário:', questionario.id);
                              }}
                            >
                              Ver Histórico
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default AlunoDashboard;
