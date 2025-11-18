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
    avaliacao: undefined,
  });
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  // Filtros adicionais removidos
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
      
      // Demais carregamentos removidos
      
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

      const isMockData = dados.periodoLetivo === '2024/1' && dados.instituicao === 'Universidade Católica de Santa Catarina';

      toast({
        title: 'Sucesso',
        description: isMockData 
          ? 'Relatório gerado com dados de exemplo (ambiente demo)'
          : 'Relatório gerado com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      if (isMockData) {
        toast({
          title: 'Aviso',
          description: 'Dados de exemplo exibidos porque o backend não está disponível.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao gerar relatório. Tente novamente mais tarde.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setRelatorio(null);
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
      a.download = `Acompanhamento_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  const agruparDadosPorCursoETurno = (dados: any[], tipoItemAvaliado?: string) => {
    const cursos = new Map<string, { curso: string; codCurso: string; turnos: Map<string, { turno: string; itens: any[] }> }>();
    const isValorInvalido = (valor: any) => valor === null || valor === undefined || valor === '-';

    dados.forEach(item => {
      const devePermitirValoresPadrao = tipoItemAvaliado === 'Infraestrutura' || tipoItemAvaliado === 'Curso' || tipoItemAvaliado === 'Alunos';
      if (!devePermitirValoresPadrao) {
        if (isValorInvalido(item.turno) || isValorInvalido(item.codTurma) || isValorInvalido(item.disciplina)) {
          return;
        }
      }

      const cursoKey = `${item.curso}-${item.codCurso}`;
      const turnoValor = item.turno ?? '-';
      const turnoKey = turnoValor;

      if (!cursos.has(cursoKey)) {
        cursos.set(cursoKey, {
          curso: item.curso,
          codCurso: item.codCurso,
          turnos: new Map()
        });
      }

      const cursoEntry = cursos.get(cursoKey)!;

      if (!cursoEntry.turnos.has(turnoKey)) {
        cursoEntry.turnos.set(turnoKey, {
          turno: turnoValor,
          itens: []
        });
      }

      cursoEntry.turnos.get(turnoKey)!.itens.push(item);
    });

    return Array.from(cursos.entries()).map(([cursoKey, cursoValue]) => ({
      key: cursoKey,
      curso: cursoValue.curso,
      codCurso: cursoValue.codCurso,
      turnos: Array.from(cursoValue.turnos.entries()).map(([turnoKey, turnoValue]) => ({
        key: turnoKey,
        turno: turnoValue.turno,
        itens: turnoValue.itens
      }))
    }));
  };

  const calcularTotais = (itens: any[]) => {
    const totais = itens.reduce(
      (acc, item) => {
        acc.qtdTotal += item.qtdTotal || 0;
        acc.qtdResp += item.qtdResp || 0;
        return acc;
      },
      { qtdTotal: 0, qtdResp: 0 }
    );

    const taxa = totais.qtdTotal > 0 ? (totais.qtdResp / totais.qtdTotal) * 100 : 0;
    return { ...totais, taxa };
  };

  const getCorBadge = (taxa: number) => {
    if (taxa >= 50) return 'green';
    if (taxa >= 30) return 'yellow';
    return 'red';
  };

  const tipoItemAvaliadoRelatorio = relatorio?.tipoItemAvaliado ?? relatorio?.totais?.tipoItemAvaliado ?? '-';
  const esconderColunasTurmaEItem = ['Curso', 'Alunos'].includes(tipoItemAvaliadoRelatorio);
  const mostrarColunaCodTurma = !esconderColunasTurmaEItem;
  const mostrarColunasDisciplina = ['Disciplina', 'TCC', 'Estagio', 'ProjetoExtensionista', 'PACExtensionista'].includes(tipoItemAvaliadoRelatorio);
  const colunasAntesMetricas = 2 + (mostrarColunaCodTurma ? 1 : 0) + (mostrarColunasDisciplina ? 1 : 0);
  const dadosAgrupados = relatorio ? agruparDadosPorCursoETurno(relatorio.dados, tipoItemAvaliadoRelatorio) : [];

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
              <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={4}>
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

          {/* Informações da Avaliação */}
          {relatorio && (
            <Card>
              <CardHeader pb={2}>
                <Heading size="sm">Informações da Avaliação</Heading>
              </CardHeader>
              <CardBody pt={2}>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>Nome</Text>
                    <Text fontSize="sm" fontWeight="medium" noOfLines={2}>{relatorio.nomeAvaliacao}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>Status</Text>
                    <Badge colorScheme={relatorio.statusAvaliacao === 'Em Andamento' ? 'green' : 'gray'} size="sm">
                      {relatorio.statusAvaliacao}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>Período</Text>
                    <Text fontSize="sm">{relatorio.periodoLetivo}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.600" mb={1}>Instituição</Text>
                    <Text fontSize="sm">{relatorio.instituicao}</Text>
                  </Box>
                  {relatorio.dataInicio && relatorio.dataFim && (
                    <>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>Data Início</Text>
                        <Text fontSize="sm">{new Date(relatorio.dataInicio).toLocaleDateString('pt-BR')}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.600" mb={1}>Data Fim</Text>
                        <Text fontSize="sm">{new Date(relatorio.dataFim).toLocaleDateString('pt-BR')}</Text>
                      </Box>
                    </>
                  )}
                </SimpleGrid>
                {relatorio.descricaoAvaliacao && (
                  <Box mt={3}>
                    <Text fontSize="xs" color="gray.600" mb={1}>Descrição</Text>
                    <Text fontSize="sm" noOfLines={2}>{relatorio.descricaoAvaliacao}</Text>
                  </Box>
                )}
              </CardBody>
            </Card>
          )}

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

          {/* Detalhes por Tipo de Participante */}
          {relatorio && relatorio.resumo && (
            <Card>
              <CardHeader>
                <Heading size="md">Detalhes por Tipo de Participante</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>👨‍🎓 Alunos</Text>
                    <VStack spacing={1} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Total:</Text>
                        <Text fontSize="sm" fontWeight="bold">{relatorio.resumo.participantesAlunos}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Respondidos:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.500">{relatorio.resumo.respondidosAlunos}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Taxa:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {relatorio.resumo.participantesAlunos > 0 
                            ? ((relatorio.resumo.respondidosAlunos / relatorio.resumo.participantesAlunos) * 100).toFixed(1)
                            : 0}%
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>👨‍🏫 Professores</Text>
                    <VStack spacing={1} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Total:</Text>
                        <Text fontSize="sm" fontWeight="bold">{relatorio.resumo.participantesProfessores}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Respondidos:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.500">{relatorio.resumo.respondidosProfessores}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Taxa:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {relatorio.resumo.participantesProfessores > 0 
                            ? ((relatorio.resumo.respondidosProfessores / relatorio.resumo.participantesProfessores) * 100).toFixed(1)
                            : 0}%
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontWeight="bold" mb={2}>👨‍💼 Coordenadores</Text>
                    <VStack spacing={1} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">Total:</Text>
                        <Text fontSize="sm" fontWeight="bold">{relatorio.resumo.participantesCoordenadores}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Respondidos:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="green.500">{relatorio.resumo.respondidosCoordenadores}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Taxa:</Text>
                        <Text fontSize="sm" fontWeight="bold">
                          {relatorio.resumo.participantesCoordenadores > 0 
                            ? ((relatorio.resumo.respondidosCoordenadores / relatorio.resumo.participantesCoordenadores) * 100).toFixed(1)
                            : 0}%
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </SimpleGrid>

                {/* Informações de Resposta */}
                {(relatorio.resumo.primeiraResposta || relatorio.resumo.ultimaResposta) && (
                  <Box mt={4} pt={4} borderTop="1px" borderColor="gray.200">
                    <Text fontWeight="bold" mb={2}>📅 Cronologia de Respostas</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {relatorio.resumo.primeiraResposta && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">Primeira Resposta:</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {new Date(relatorio.resumo.primeiraResposta).toLocaleString('pt-BR')}
                          </Text>
                        </HStack>
                      )}
                      {relatorio.resumo.ultimaResposta && (
                        <HStack justify="space-between">
                          <Text fontSize="sm">Última Resposta:</Text>
                          <Text fontSize="sm" fontWeight="bold">
                            {new Date(relatorio.resumo.ultimaResposta).toLocaleString('pt-BR')}
                          </Text>
                        </HStack>
                      )}
                    </SimpleGrid>
                  </Box>
                )}
              </CardBody>
            </Card>
          )}

          {/* Tabela de Dados */}
          {relatorio && (
            <Card>
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Relatório de Acompanhamento</Heading>
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
                        <Th>TURNO</Th>
                        {mostrarColunaCodTurma && <Th>CODTURMA</Th>}
                        {/* Mostrar colunas de disciplina apenas para tipos relacionados a disciplinas */}
                        {mostrarColunasDisciplina && <Th>DISCIPLINA</Th>}
                        <Th isNumeric>TOTAL</Th>
                        <Th isNumeric>QTD_RESP</Th>
                        <Th isNumeric>TAXA</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {dadosAgrupados.map(curso => {
                        const totaisCurso = calcularTotais(curso.turnos.flatMap(turno => turno.itens));
                        let primeiraLinhaCurso = true;

                        return (
                          <React.Fragment key={curso.key}>
                            {curso.turnos.map(turno => {
                              const totaisTurno = calcularTotais(turno.itens);
                              let primeiraLinhaTurno = true;

                              return (
                                <React.Fragment key={`${curso.key}-${turno.key}`}>
                                  {turno.itens.map((item, index) => {
                                    const mostrarCurso = primeiraLinhaCurso;
                                    if (primeiraLinhaCurso) {
                                      primeiraLinhaCurso = false;
                                    }

                                    const mostrarTurno = primeiraLinhaTurno;
                                    if (primeiraLinhaTurno) {
                                      primeiraLinhaTurno = false;
                                    }

                                    return (
                                      <Tr key={`${curso.key}-${turno.key}-${index}`}>
                                        <Td fontWeight={mostrarCurso ? 'bold' : 'normal'}>
                                          {mostrarCurso ? item.curso : ''}
                                        </Td>
                                        <Td fontWeight={mostrarTurno ? 'bold' : 'normal'}>
                                          {mostrarTurno ? (item.turno ?? '-') : ''}
                                        </Td>
                                        {mostrarColunaCodTurma && (
                                          <Td fontWeight={mostrarTurno ? 'bold' : 'normal'}>
                                            {mostrarTurno ? item.codTurma : ''}
                                          </Td>
                                        )}
                                        {mostrarColunasDisciplina && <Td>{item.disciplina}</Td>}
                                        <Td isNumeric>{item.qtdTotal}</Td>
                                        <Td isNumeric>{item.qtdResp}</Td>
                                        <Td isNumeric>
                                          <Badge colorScheme={getCorBadge(item.taxaResposta)}>
                                            {item.taxaResposta.toFixed(1)}%
                                          </Badge>
                                        </Td>
                                      </Tr>
                                    );
                                  })}

                                  <Tr bg="gray.50" fontWeight="bold">
                                    <Td colSpan={colunasAntesMetricas}>
                                      {turno.turno && turno.turno !== '-' ? `${turno.turno} Total` : 'Total'}
                                    </Td>
                                    <Td isNumeric>{totaisTurno.qtdTotal}</Td>
                                    <Td isNumeric>{totaisTurno.qtdResp}</Td>
                                    <Td isNumeric>
                                      <Badge colorScheme="blue">
                                        {totaisTurno.taxa.toFixed(1)}%
                                      </Badge>
                                    </Td>
                                  </Tr>
                                </React.Fragment>
                              );
                            })}

                            <Tr bg="gray.100" fontWeight="bold">
                              <Td colSpan={colunasAntesMetricas}>Total do Curso</Td>
                              <Td isNumeric>{totaisCurso.qtdTotal}</Td>
                              <Td isNumeric>{totaisCurso.qtdResp}</Td>
                              <Td isNumeric>
                                <Badge colorScheme="blue">
                                  {totaisCurso.taxa.toFixed(1)}%
                                </Badge>
                              </Td>
                            </Tr>
                          </React.Fragment>
                        );
                      })}
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
