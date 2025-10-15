import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Select,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react';
import { MainLayout } from '../../components/layout/main-layout.component';
import { FiDownload, FiFileText, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { apiFetch, apiFetchJson } from '../../utils/api-fetch';
import { API_URLS } from '../../config/api-urls';
import { relatorioService, AcompanhamentoFiltros, RelatorioAcompanhamento } from '../../services/relatorio.service';

const RelatoriosAcompanhamento: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<RelatorioAcompanhamento | null>(null);
  const [filtros, setFiltros] = useState<AcompanhamentoFiltros>({
    tipo: 'aluno',
    avaliacao: undefined,
    periodoLetivo: 0,
    instituicao: 0,
    curso: undefined,
  });
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [periodosLetivos, setPeriodosLetivos] = useState<any[]>([]);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const toast = useToast();

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      
      // Carregar avaliações
      const avaliacoes = await apiFetchJson(API_URLS.AVALIACOES);
      setAvaliacoes(avaliacoes);
      
      // Carregar períodos letivos
      const periodos = await apiFetchJson(API_URLS.PERIODOS_LETIVOS);
      setPeriodosLetivos(periodos);
      
      // Carregar instituições
      const instituicoes = await apiFetchJson(API_URLS.INSTITUICOES);
      setInstituicoes(instituicoes);
      
      // Carregar cursos
      const cursos = await apiFetchJson(API_URLS.CURSOS);
      setCursos(cursos);
      
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados iniciais',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarRelatorio = async () => {
    try {
      setLoading(true);
      
      // Validar se a avaliação foi selecionada
      if (!filtros.avaliacao) {
        toast({
          title: 'Atenção',
          description: 'Por favor, selecione uma avaliação',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      console.log('🚀 Gerando relatório com filtros:', filtros);
      const dados = await relatorioService.getRelatorioAcompanhamento(filtros);
      setRelatorio(dados);
      
      // Verificar se são dados mockados ou reais
      const isMockData = dados.periodoLetivo === '2024/1' && dados.instituicao === 'Universidade Católica de Santa Catarina';
      
      toast({
        title: 'Sucesso',
        description: isMockData 
          ? 'Relatório gerado com dados de exemplo (backend não disponível)'
          : 'Relatório gerado com dados reais do backend',
        status: isMockData ? 'info' : 'success',
        duration: 5000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar relatório',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    if (!relatorio) return;

    try {
      setLoading(true);
      
      const blob = await relatorioService.exportarAcompanhamentoExcel(filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Acompanhamento_${filtros.tipo}_${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Sucesso',
        description: 'Excel exportado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao exportar Excel',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const agruparDadosPorCurso = (dados: any[]) => {
    const grupos: { [key: string]: any[] } = {};
    
    dados.forEach(item => {
      const chave = `${item.curso}-${item.codCurso}-${item.turno}`;
      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(item);
    });
    
    return grupos;
  };

  return (
    <MainLayout>
      <Box p={6}>
        <VStack spacing={6} align="stretch">
          {/* Cabeçalho */}
          <Box>
            <Heading size="lg" mb={2}>
              📊 Relatórios de Acompanhamento
            </Heading>
            <Text color="gray.600">
              Gere relatórios de acompanhamento de respondentes por curso, turma e disciplina
            </Text>
          </Box>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <Heading size="md">Filtros</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
                <FormControl>
                  <FormLabel>Tipo de Relatório</FormLabel>
                  <Select
                    value={filtros.tipo}
                    onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                  >
                    <option value="aluno">Aluno</option>
                    <option value="professor">Professor</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Avaliação *</FormLabel>
                  <Select
                    value={filtros.avaliacao || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, avaliacao: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Selecione a avaliação"
                    isRequired
                  >
                    {avaliacoes.map((avaliacao) => (
                      <option key={avaliacao.id} value={avaliacao.id}>
                        {avaliacao.titulo}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Período Letivo</FormLabel>
                  <Select
                    value={filtros.periodoLetivo || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, periodoLetivo: parseInt(e.target.value) || 0 }))}
                    placeholder="Selecione o período"
                  >
                    {periodosLetivos.map((periodo) => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Instituição</FormLabel>
                  <Select
                    value={filtros.instituicao || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, instituicao: parseInt(e.target.value) || 0 }))}
                    placeholder="Selecione a instituição"
                  >
                    {instituicoes.map((instituicao) => (
                      <option key={instituicao.id} value={instituicao.id}>
                        {instituicao.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Curso</FormLabel>
                  <Select
                    value={filtros.curso || ''}
                    onChange={(e) => setFiltros(prev => ({ ...prev, curso: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Selecione o curso"
                  >
                    {cursos.map((curso) => (
                      <option key={curso.id} value={curso.id}>
                        {curso.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>

              <HStack mt={4} spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={gerarRelatorio}
                  isLoading={loading}
                  loadingText="Gerando..."
                  leftIcon={<FiFileText />}
                >
                  Gerar Relatório
                </Button>
                
                {relatorio && (
                  <Button
                    colorScheme="green"
                    onClick={exportarExcel}
                    isLoading={loading}
                    loadingText="Exportando..."
                    leftIcon={<FiDownload />}
                  >
                    Exportar Excel
                  </Button>
                )}
              </HStack>
            </CardBody>
          </Card>

          {/* Estatísticas */}
          {relatorio && (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Geral</StatLabel>
                    <StatNumber>{relatorio.totais.totalGeral}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Total de participantes
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Respostas</StatLabel>
                    <StatNumber>{relatorio.totais.totalRespostas}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Respostas recebidas
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Taxa de Resposta</StatLabel>
                    <StatNumber>{relatorio.totais.taxaGeral.toFixed(1)}%</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Percentual de participação
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Tabela de Dados */}
          {relatorio && (
            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">
                    Relatório de Acompanhamento - {filtros.tipo === 'aluno' ? 'Alunos' : 'Professores'}
                  </Heading>
                  {relatorio.periodoLetivo === '2024/1' && relatorio.instituicao === 'Universidade Católica de Santa Catarina' && (
                    <Badge colorScheme="orange" variant="subtle">
                      📊 Dados de Exemplo
                    </Badge>
                  )}
                </HStack>
              </CardHeader>
              <CardBody>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>CURSO</Th>
                        <Th>CODCURSO</Th>
                        <Th>TURNO</Th>
                        <Th>CODTURMA</Th>
                        <Th>DISCIPLINA</Th>
                        <Th isNumeric>QTD_TOTAL</Th>
                        <Th isNumeric>QTD_RESP</Th>
                        <Th isNumeric>TAXA</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(agruparDadosPorCurso(relatorio.dados)).map(([chave, grupo]) => (
                        <React.Fragment key={chave}>
                          {grupo.map((item, index) => (
                            <Tr key={`${chave}-${index}`}>
                              <Td fontWeight={index === 0 ? 'bold' : 'normal'}>
                                {index === 0 ? item.curso : ''}
                              </Td>
                              <Td fontWeight={index === 0 ? 'bold' : 'normal'}>
                                {index === 0 ? item.codCurso : ''}
                              </Td>
                              <Td fontWeight={index === 0 ? 'bold' : 'normal'}>
                                {index === 0 ? item.turno : ''}
                              </Td>
                              <Td fontWeight={index === 0 ? 'bold' : 'normal'}>
                                {index === 0 ? item.codTurma : ''}
                              </Td>
                              <Td>{item.disciplina}</Td>
                              <Td isNumeric>{item.qtdTotal}</Td>
                              <Td isNumeric>{item.qtdResp}</Td>
                              <Td isNumeric>
                                <Badge
                                  colorScheme={item.taxaResposta >= 50 ? 'green' : item.taxaResposta >= 30 ? 'yellow' : 'red'}
                                >
                                  {item.taxaResposta.toFixed(1)}%
                                </Badge>
                              </Td>
                            </Tr>
                          ))}
                          {/* Linha de subtotal */}
                          <Tr bg="gray.50" fontWeight="bold">
                            <Td colSpan={5}>
                              {grupo[0].turno} Total
                            </Td>
                            <Td isNumeric>
                              {grupo.reduce((sum, item) => sum + item.qtdTotal, 0)}
                            </Td>
                            <Td isNumeric>
                              {grupo.reduce((sum, item) => sum + item.qtdResp, 0)}
                            </Td>
                            <Td isNumeric>
                              <Badge colorScheme="blue">
                                {((grupo.reduce((sum, item) => sum + item.qtdResp, 0) / 
                                   grupo.reduce((sum, item) => sum + item.qtdTotal, 0)) * 100).toFixed(1)}%
                              </Badge>
                            </Td>
                          </Tr>
                        </React.Fragment>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </CardBody>
            </Card>
          )}

          {/* Loading */}
          {loading && (
            <Box textAlign="center" py={8}>
              <Spinner size="xl" color="blue.500" />
              <Text mt={4}>Processando dados...</Text>
            </Box>
          )}
        </VStack>
      </Box>
    </MainLayout>
  );
};

export default RelatoriosAcompanhamento;
