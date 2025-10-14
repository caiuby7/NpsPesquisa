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
  SimpleGrid,
  Button,
  Select,
  FormControl,
  FormLabel,
  useColorModeValue,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Icon,
  Divider
} from '@chakra-ui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  BarChart3,
  Users,
  GraduationCap,
  Clock,
  Globe,
  TrendingUp,
  FileText,
  Download,
  Filter
} from 'lucide-react';
import MainLayout from '../../components/layout/main-layout.component';
import { useRelatorioRespondentes, useDashboardAdminStats, RelatorioFilters } from '../../hooks/useRelatorio';

interface RelatorioData {
  totalRespondentes: number;
  totalConvidados: number;
  taxaResposta: number;
  porPesquisa: Array<{
    pesquisaId: number;
    nomePesquisa: string;
    respondentes: number;
    convidados: number;
    taxaResposta: number;
  }>;
  porCurso: Array<{
    cursoId: number;
    nomeCurso: string;
    respondentes: number;
    convidados: number;
    taxaResposta: number;
  }>;
  porTurno: Array<{
    turno: string;
    respondentes: number;
    convidados: number;
    taxaResposta: number;
  }>;
  porCampus: Array<{
    campus: string;
    respondentes: number;
    convidados: number;
    taxaResposta: number;
  }>;
}

const RelatoriosPage: React.FC = () => {
  const [filtroPesquisa, setFiltroPesquisa] = useState<string>('todas');
  const [filtroCampus, setFiltroCampus] = useState<string>('todos');
  const [filtrosRelatorio, setFiltrosRelatorio] = useState<RelatorioFilters>({});

  // Buscar dados usando hooks
  const { data: relatorioData, isLoading: loading, error: relatorioError } = useRelatorioRespondentes(filtrosRelatorio);
  const { data: dashboardStats } = useDashboardAdminStats();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.700');

  // Atualizar filtros quando os controles mudarem
  useEffect(() => {
    const novosFiltros: RelatorioFilters = {};
    
    // Adicionar filtros conforme necessário
    if (filtroCampus !== 'todos') {
      // Mapear campus para instituição (isso seria melhor com um endpoint específico)
      switch (filtroCampus) {
        case 'JGS':
          novosFiltros.instituicaoId = 1; // Assumindo ID da instituição JGS
          break;
        case 'JOI':
          novosFiltros.instituicaoId = 2; // Assumindo ID da instituição JOI
          break;
        case 'EaD':
          novosFiltros.instituicaoId = 3; // Assumindo ID da instituição EaD
          break;
      }
    }
    
    setFiltrosRelatorio(novosFiltros);
  }, [filtroPesquisa, filtroCampus]);

  const coresGrafico = ['#38A169', '#3182CE', '#D69E2E', '#E53E3E', '#805AD5', '#DD6B20', '#319795', '#38B2AC'];

  const exportarRelatorio = (tipo: string) => {
    // Implementar exportação de relatório
    console.log(`Exportando relatório: ${tipo}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxW="7xl" py={8}>
          <Box textAlign="center" py={20}>
            <Spinner size="xl" color="blue.500" />
            <Text mt={4} fontSize="lg">Carregando relatórios...</Text>
          </Box>
        </Container>
      </MainLayout>
    );
  }

  if (relatorioError) {
    return (
      <MainLayout>
        <Container maxW="7xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Erro!</AlertTitle>
            <AlertDescription>{relatorioError.message}</AlertDescription>
          </Alert>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Cabeçalho */}
          <Box>
            <Heading size="xl" color="blue.600" mb={2}>
              📊 Relatórios - Acompanhamento dos Respondentes
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Análise detalhada das respostas por diferentes categorias
            </Text>
          </Box>

          {/* Estatísticas Gerais */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Respondentes</StatLabel>
                  <StatNumber color="green.500">
                    {relatorioData?.totalRespondentes.toLocaleString() || dashboardStats?.totalRespostas.toLocaleString() || '0'}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Taxa de {relatorioData?.taxaResposta.toFixed(1) || dashboardStats?.taxaRespostaGeral.toFixed(1) || '0'}%
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Convidados</StatLabel>
                  <StatNumber>
                    {relatorioData?.totalConvidados.toLocaleString() || dashboardStats?.totalParticipantes.toLocaleString() || '0'}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Taxa de Resposta</StatLabel>
                  <StatNumber color="blue.500">
                    {relatorioData?.taxaResposta.toFixed(1) || dashboardStats?.taxaRespostaGeral.toFixed(1) || '0'}%
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    Dados em tempo real
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Pendentes</StatLabel>
                  <StatNumber color="orange.500">
                    {(relatorioData?.totalConvidados || dashboardStats?.totalParticipantes || 0) - 
                     (relatorioData?.totalRespondentes || dashboardStats?.totalRespostas || 0)}
                  </StatNumber>
                  <StatHelpText>
                    Aguardando resposta
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Filtros */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardHeader>
              <HStack spacing={4}>
                <Icon as={Filter} w={5} h={5} color="blue.500" />
                <Heading size="md">Filtros</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>Pesquisa</FormLabel>
                  <Select value={filtroPesquisa} onChange={(e) => setFiltroPesquisa(e.target.value)}>
                    <option value="todas">Todas as Pesquisas</option>
                    {relatorioData?.porPesquisa.map(pesquisa => (
                      <option key={pesquisa.pesquisaId} value={pesquisa.pesquisaId.toString()}>
                        {pesquisa.nomePesquisa}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Campus</FormLabel>
                  <Select value={filtroCampus} onChange={(e) => setFiltroCampus(e.target.value)}>
                    <option value="todos">Todos os Campus</option>
                    <option value="JGS">JGS (Jaraguá do Sul)</option>
                    <option value="JOI">JOI (Joinville)</option>
                    <option value="EaD">EaD (Educação a Distância)</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Tabs de Relatórios */}
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>
                <Icon as={BarChart3} mr={2} />
                Por Pesquisa
              </Tab>
              <Tab>
                <Icon as={GraduationCap} mr={2} />
                Por Curso
              </Tab>
              <Tab>
                <Icon as={Clock} mr={2} />
                Por Turno
              </Tab>
              <Tab>
                <Icon as={Globe} mr={2} />
                Geral EaD/JGS/JOI
              </Tab>
            </TabList>

            <TabPanels>
              {/* Relatório por Pesquisa */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Respondentes por Pesquisa</Heading>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={relatorioData?.porPesquisa}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nomePesquisa" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="respondentes" fill="#38A169" name="Respondentes" />
                          <Bar dataKey="convidados" fill="#E2E8F0" name="Total Convidados" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Pesquisa</Th>
                          <Th isNumeric>Respondentes</Th>
                          <Th isNumeric>Total Convidados</Th>
                          <Th isNumeric>Taxa de Resposta</Th>
                          <Th>Progresso</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {relatorioData?.porPesquisa.map(pesquisa => (
                          <Tr key={pesquisa.pesquisaId}>
                            <Td>
                              <Text fontWeight="medium">{pesquisa.nomePesquisa}</Text>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="green" fontSize="sm">
                                {pesquisa.respondentes.toLocaleString()}
                              </Badge>
                            </Td>
                            <Td isNumeric>{pesquisa.convidados.toLocaleString()}</Td>
                            <Td isNumeric>
                              <Badge 
                                colorScheme={pesquisa.taxaResposta >= 70 ? "green" : pesquisa.taxaResposta >= 50 ? "yellow" : "red"}
                                fontSize="sm"
                              >
                                {pesquisa.taxaResposta.toFixed(1)}%
                              </Badge>
                            </Td>
                            <Td>
                              <Progress 
                                value={pesquisa.taxaResposta} 
                                colorScheme={pesquisa.taxaResposta >= 70 ? "green" : pesquisa.taxaResposta >= 50 ? "yellow" : "red"}
                                size="sm"
                                borderRadius="md"
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </TabPanel>

              {/* Relatório por Curso */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Respondentes por Curso</Heading>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={relatorioData?.porCurso}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="nomeCurso" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="respondentes" fill="#3182CE" name="Respondentes" />
                          <Bar dataKey="convidados" fill="#E2E8F0" name="Total Convidados" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Curso</Th>
                          <Th isNumeric>Respondentes</Th>
                          <Th isNumeric>Total Convidados</Th>
                          <Th isNumeric>Taxa de Resposta</Th>
                          <Th>Progresso</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {relatorioData?.porCurso.map(curso => (
                          <Tr key={curso.cursoId}>
                            <Td>
                              <Text fontWeight="medium">{curso.nomeCurso}</Text>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="blue" fontSize="sm">
                                {curso.respondentes.toLocaleString()}
                              </Badge>
                            </Td>
                            <Td isNumeric>{curso.convidados.toLocaleString()}</Td>
                            <Td isNumeric>
                              <Badge 
                                colorScheme={curso.taxaResposta >= 70 ? "green" : curso.taxaResposta >= 50 ? "yellow" : "red"}
                                fontSize="sm"
                              >
                                {curso.taxaResposta.toFixed(1)}%
                              </Badge>
                            </Td>
                            <Td>
                              <Progress 
                                value={curso.taxaResposta} 
                                colorScheme={curso.taxaResposta >= 70 ? "green" : curso.taxaResposta >= 50 ? "yellow" : "red"}
                                size="sm"
                                borderRadius="md"
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </TabPanel>

              {/* Relatório por Turno */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Respondentes por Turno</Heading>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={relatorioData?.porTurno}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry: any) => `${entry.turno}: ${entry.taxaResposta.toFixed(1)}%`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="respondentes"
                          >
                            {relatorioData?.porTurno.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={coresGrafico[index % coresGrafico.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Turno</Th>
                          <Th isNumeric>Respondentes</Th>
                          <Th isNumeric>Total Convidados</Th>
                          <Th isNumeric>Taxa de Resposta</Th>
                          <Th>Progresso</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {relatorioData?.porTurno.map(turno => (
                          <Tr key={turno.turno}>
                            <Td>
                              <Text fontWeight="medium">{turno.turno}</Text>
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="purple" fontSize="sm">
                                {turno.respondentes.toLocaleString()}
                              </Badge>
                            </Td>
                            <Td isNumeric>{turno.convidados.toLocaleString()}</Td>
                            <Td isNumeric>
                              <Badge 
                                colorScheme={turno.taxaResposta >= 70 ? "green" : turno.taxaResposta >= 50 ? "yellow" : "red"}
                                fontSize="sm"
                              >
                                {turno.taxaResposta.toFixed(1)}%
                              </Badge>
                            </Td>
                            <Td>
                              <Progress 
                                value={turno.taxaResposta} 
                                colorScheme={turno.taxaResposta >= 70 ? "green" : turno.taxaResposta >= 50 ? "yellow" : "red"}
                                size="sm"
                                borderRadius="md"
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </VStack>
              </TabPanel>

              {/* Relatório Geral EaD/JGS/JOI */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
                    <CardHeader>
                      <Heading size="md">Respondentes por Campus</Heading>
                    </CardHeader>
                    <CardBody>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={relatorioData?.porCampus}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="campus" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="respondentes" fill="#D69E2E" name="Respondentes" />
                          <Bar dataKey="convidados" fill="#E2E8F0" name="Total Convidados" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    {relatorioData?.porCampus.map(campus => (
                      <Card key={campus.campus} bg={cardBg} border="1px solid" borderColor={borderColor}>
                        <CardBody textAlign="center">
                          <VStack spacing={4}>
                            <Icon as={Globe} w={12} h={12} color="orange.500" />
                            <Text fontWeight="bold" fontSize="lg">{campus.campus}</Text>
                            <VStack spacing={2}>
                              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                                {campus.respondentes.toLocaleString()}
                              </Text>
                              <Text fontSize="sm" color="gray.600">
                                de {campus.convidados.toLocaleString()} convidados
                              </Text>
                              <Badge 
                                colorScheme={campus.taxaResposta >= 70 ? "green" : campus.taxaResposta >= 50 ? "yellow" : "red"}
                                fontSize="md"
                                px={3}
                                py={1}
                              >
                                {campus.taxaResposta.toFixed(1)}% de resposta
                              </Badge>
                            </VStack>
                            <Progress 
                              value={campus.taxaResposta} 
                              colorScheme={campus.taxaResposta >= 70 ? "green" : campus.taxaResposta >= 50 ? "yellow" : "red"}
                              size="lg"
                              borderRadius="md"
                              w="100%"
                            />
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Botões de Ação */}
          <Card bg={cardBg} border="1px solid" borderColor={borderColor}>
            <CardBody>
              <HStack spacing={4} justify="center">
                <Button
                  leftIcon={<Icon as={Download} />}
                  colorScheme="blue"
                  size="lg"
                  onClick={() => exportarRelatorio('completo')}
                >
                  Exportar Relatório Completo
                </Button>
                <Button
                  leftIcon={<Icon as={FileText} />}
                  colorScheme="green"
                  size="lg"
                  onClick={() => exportarRelatorio('resumido')}
                >
                  Exportar Resumo
                </Button>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </MainLayout>
  );
};

export default RelatoriosPage;
