import React from 'react';
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
  AlertDescription,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer
} from '@chakra-ui/react';
import {
  FileText,
  Calendar,
  Users,
  BarChart3,
  Eye,
  Edit,
  Download
} from 'lucide-react';
import MainLayout from '../../components/layout/main-layout.component';
import { useAuth } from '../../contexts/AuthContext';
import { useGetDashboardAdminStats, useGetAvaliacoesAtivas } from '../../app/services/avaliacao/avaliacao.service.hooks';


const CPADashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: estatisticas, isLoading: statsLoading, error: statsError } = useGetDashboardAdminStats();
  const { data: avaliacoes, isLoading: avaliacoesLoading, error: avaliacoesError } = useGetAvaliacoesAtivas();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Remover mock data - agora usando dados reais da API

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'green';
      case 'inativa':
        return 'gray';
      case 'finalizada':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'Ativa';
      case 'inativa':
        return 'Inativa';
      case 'finalizada':
        return 'Finalizada';
      default:
        return 'Desconhecido';
    }
  };

  if (avaliacoesLoading) {
    return (
      <MainLayout>
        <Box bg={bgColor} minH="100vh" py={8}>
          <Container maxW="6xl">
            <Flex justify="center" align="center" h="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>Carregando dashboard...</Text>
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
                Dashboard administrativo - {user?.perfil?.toLowerCase() === 'administrador' ? 'Administrador' : 'Comissão Própria de Avaliação'}
              </Text>
            </Box>

            {/* Estatísticas Principais */}
            {statsLoading ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                {[1, 2, 3, 4].map((i) => (
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor} key={i}>
                    <CardBody>
                      <Flex align="center" justify="center" h="120px">
                        <Spinner size="lg" color="blue.500" />
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : statsError ? (
              <Alert status="error">
                <AlertIcon />
                <AlertTitle>Erro ao carregar estatísticas!</AlertTitle>
                <AlertDescription>
                  Não foi possível carregar as estatísticas do dashboard.
                </AlertDescription>
              </Alert>
            ) : estatisticas ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Total de Avaliações</StatLabel>
                      <StatNumber color="blue.500">{estatisticas.totalAvaliacoes}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {estatisticas.avaliacoesAtivas} ativas
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Participantes</StatLabel>
                      <StatNumber color="green.500">{estatisticas.totalParticipantes}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        Usuários cadastrados
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Taxa de Resposta</StatLabel>
                      <StatNumber color="purple.500">{estatisticas.taxaRespostaGeral}%</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        Média geral
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>

                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <Stat>
                      <StatLabel>Questionários Respondidos</StatLabel>
                      <StatNumber color="orange.500">{estatisticas.questionariosRespondidos}</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        Total de respostas
                      </StatHelpText>
                    </Stat>
                  </CardBody>
                </Card>
              </SimpleGrid>
            ) : null}

            {/* Ações Rápidas */}
            <Box>
              <Heading size="lg" mb={6} color="blue.600">
                🎯 Ações Rápidas
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<Icon as={FileText} w={5} h={5} />}
                  onClick={() => {
                    // Navegar para listar avaliações
                    window.location.href = '/avaliacoes';
                  }}
                >
                  Listar Avaliações
                </Button>

                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<Icon as={Edit} w={5} h={5} />}
                  onClick={() => {
                    // Navegar para listar questões
                    window.location.href = '/questions';
                  }}
                >
                  Listar Questões
                </Button>

                <Button
                  colorScheme="purple"
                  size="lg"
                  leftIcon={<Icon as={Users} w={5} h={5} />}
                  onClick={() => {
                    // Navegar para listar participantes
                    window.location.href = '/participantes';
                  }}
                >
                  Listar Participantes
                </Button>

                <Button
                  colorScheme="orange"
                  size="lg"
                  leftIcon={<Icon as={BarChart3} w={5} h={5} />}
                  onClick={() => {
                    // Navegar para relatórios
                    window.location.href = '/relatorios';
                  }}
                >
                  Relatórios
                </Button>
              </SimpleGrid>
            </Box>

            {/* Avaliações Ativas */}
            <Box>
              <Heading size="lg" mb={6} color="blue.600">
                📊 Avaliações Ativas
              </Heading>
              
              {avaliacoesLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" color="blue.500" />
                </Flex>
              ) : avaliacoesError ? (
                <Alert status="error">
                  <AlertIcon />
                  <AlertTitle>Erro ao carregar avaliações!</AlertTitle>
                  <AlertDescription>
                    Não foi possível carregar as avaliações ativas.
                  </AlertDescription>
                </Alert>
              ) : avaliacoes && avaliacoes.length > 0 ? (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {avaliacoes
                    .filter(a => a.status === 'ativa')
                    .map((avaliacao) => (
                      <Card key={avaliacao.id} bg={cardBg} border="1px solid" borderColor={borderColor}>
                        <CardHeader>
                          <HStack justify="space-between" align="start">
                            <VStack align="start" spacing={2} flex="1">
                              <Heading size="md" color="blue.600">
                                {avaliacao.titulo}
                              </Heading>
                              <Text fontSize="sm" color="gray.600">
                                {avaliacao.descricao}
                              </Text>
                            </VStack>
                            <Badge colorScheme={getStatusColor(avaliacao.status)}>
                              {getStatusText(avaliacao.status)}
                            </Badge>
                          </HStack>
                        </CardHeader>
                        <CardBody pt={0}>
                          <VStack spacing={4} align="stretch">
                            <HStack justify="space-between">
                              <HStack>
                                <Icon as={Calendar} w={4} h={4} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {new Date(avaliacao.dataFim).toLocaleDateString('pt-BR')}
                                </Text>
                              </HStack>
                              <HStack>
                                <Icon as={FileText} w={4} h={4} color="gray.500" />
                                <Text fontSize="sm" color="gray.600">
                                  {avaliacao.tipoItemAvaliado}
                                </Text>
                              </HStack>
                            </HStack>

                            <Box>
                              <HStack justify="space-between" mb={2}>
                                <Text fontSize="sm" color="gray.600">
                                  Taxa de Resposta
                                </Text>
                                <Text fontSize="sm" fontWeight="bold" color="blue.600">
                                  {avaliacao.taxaResposta}%
                                </Text>
                              </HStack>
                              <Progress value={avaliacao.taxaResposta} colorScheme="blue" size="sm" />
                            </Box>

                            <HStack justify="space-between">
                              <Text fontSize="sm" color="gray.600">
                                {avaliacao.totalRespostas} de {avaliacao.totalParticipantes} participantes
                              </Text>
                            </HStack>
                            
                            <HStack spacing={2}>
                              <Button
                                colorScheme="blue"
                                size="sm"
                                leftIcon={<Icon as={Eye} w={4} h={4} />}
                                onClick={() => {
                                  // Ver detalhes da avaliação
                                  window.location.href = `/avaliacoes/${avaliacao.id}`;
                                }}
                              >
                                Ver Detalhes
                              </Button>
                              <Button
                                colorScheme="green"
                                size="sm"
                                leftIcon={<Icon as={Download} w={4} h={4} />}
                                onClick={() => {
                                  // Baixar relatório
                                  console.log('Baixar relatório da avaliação:', avaliacao.id);
                                }}
                              >
                                Relatório
                              </Button>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                </SimpleGrid>
              ) : (
                <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} py={8}>
                      <Icon as={FileText} boxSize={12} color="gray.400" />
                      <Text fontSize="lg" color="gray.500" textAlign="center">
                        Nenhuma avaliação ativa no momento
                      </Text>
                      <Text fontSize="sm" color="gray.400" textAlign="center">
                        Crie uma nova avaliação para começar a coletar dados
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </Box>

            {/* Últimas Atividades */}
            <Box>
              <Heading size="lg" mb={6} color="blue.600">
                📈 Últimas Atividades
              </Heading>
              
              <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                <CardBody>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Avaliação</Th>
                          <Th>Status</Th>
                          <Th>Participantes</Th>
                          <Th>Taxa de Resposta</Th>
                          <Th>Ações</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {avaliacoes?.map((avaliacao) => (
                          <Tr key={avaliacao.id}>
                            <Td>
                              <VStack align="start" spacing={1}>
                                <Text fontWeight="medium">{avaliacao.titulo}</Text>
                                <Text fontSize="sm" color="gray.600">
                                  {avaliacao.tipoItemAvaliado}
                                </Text>
                              </VStack>
                            </Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(avaliacao.status)}>
                                {getStatusText(avaliacao.status)}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm">
                                {avaliacao.totalRespostas}/{avaliacao.totalParticipantes}
                              </Text>
                            </Td>
                            <Td>
                              <HStack>
                                <Text fontSize="sm">{avaliacao.taxaResposta}%</Text>
                                <Progress value={avaliacao.taxaResposta} colorScheme="blue" size="sm" w="50px" />
                              </HStack>
                            </Td>
                            <Td>
                              <HStack spacing={2}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<Icon as={Eye} w={3} h={3} />}
                                >
                                  Ver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<Icon as={Edit} w={3} h={3} />}
                                >
                                  Editar
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </CardBody>
              </Card>
            </Box>
          </VStack>
        </Container>
      </Box>
    </MainLayout>
  );
};

export default CPADashboard;
