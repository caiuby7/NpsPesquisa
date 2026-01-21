import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Select,
  Button,
  VStack,
  HStack,
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
  Card,
  CardHeader,
  CardBody,
  Flex,
  IconButton,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
} from '@chakra-ui/react';
import { MainLayout } from '../../../components/layout/main-layout.component';
import { FiDownload, FiRefreshCw, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import {
  relatoriosAvaliacaoService,
  VinculoComparavelDto,
  RelatorioComparativoDto,
  RelatorioComparativoRequest,
} from '../../../services/relatorios-avaliacao.service';

const RelatorioComparativoPage: React.FC = () => {
  const navigate = useNavigate();
  const [vinculos, setVinculos] = useState<VinculoComparavelDto[]>([]);
  const [vinculoSelecionado, setVinculoSelecionado] = useState<number | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioComparativoDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const toast = useToast();

  // Filtros (sem vinculoId, pois é passado separadamente)
  const [filtros, setFiltros] = useState<Omit<RelatorioComparativoRequest, 'vinculoId'>>({});

  useEffect(() => {
    carregarVinculos();
  }, []);

  useEffect(() => {
    if (vinculoSelecionado) {
      carregarRelatorio();
    }
  }, [vinculoSelecionado, filtros]);

  const carregarVinculos = async () => {
    try {
      setLoading(true);
      const dados = await relatoriosAvaliacaoService.listarVinculosComparaveis();
      setVinculos(dados);
      if (dados.length > 0 && !vinculoSelecionado) {
        setVinculoSelecionado(dados[0].id);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar vínculos',
        description: error.message || 'Não foi possível carregar os vínculos comparáveis',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarRelatorio = async () => {
    if (!vinculoSelecionado) return;

    try {
      setLoadingRelatorio(true);
      const request: RelatorioComparativoRequest = {
        vinculoId: vinculoSelecionado,
        ...filtros,
      } as RelatorioComparativoRequest;
      const dados = await relatoriosAvaliacaoService.obterRelatorioComparativo(vinculoSelecionado, request);
      setRelatorio(dados);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar relatório',
        description: error.message || 'Não foi possível carregar o relatório comparativo',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setRelatorio(null);
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const exportarExcel = async () => {
    if (!vinculoSelecionado) return;

    try {
      const request: RelatorioComparativoRequest = {
        vinculoId: vinculoSelecionado,
        ...filtros,
      } as RelatorioComparativoRequest;
      const blob = await relatoriosAvaliacaoService.exportarRelatorioComparativoExcel(vinculoSelecionado, request);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_Comparativo_${vinculoSelecionado}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Sucesso',
        description: 'Relatório exportado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar',
        description: error.message || 'Não foi possível exportar o relatório',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const exportarPdf = async () => {
    if (!vinculoSelecionado) return;

    try {
      const request: RelatorioComparativoRequest = {
        vinculoId: vinculoSelecionado,
        ...filtros,
      } as RelatorioComparativoRequest;
      const blob = await relatoriosAvaliacaoService.exportarRelatorioComparativoPdf(vinculoSelecionado, request);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_Comparativo_${vinculoSelecionado}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Sucesso',
        description: 'Relatório PDF exportado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar PDF',
        description: error.message || 'Não foi possível exportar o relatório para PDF',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box p={8}>
          <Flex justify="center" align="center" minH="400px">
            <Spinner size="xl" />
          </Flex>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box p={8}>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <HStack mb={4}>
              <Button
                leftIcon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/relatorios')}
                size="sm"
              >
                Voltar para Central de Relatórios
              </Button>
            </HStack>
            <Heading size="lg">Relatório Comparativo</Heading>
            <HStack>
              <IconButton
                aria-label="Atualizar"
                icon={<FiRefreshCw />}
                onClick={carregarVinculos}
                isLoading={loading}
              />
              {vinculoSelecionado && (
                <>
                  <Button
                    leftIcon={<FiDownload />}
                    colorScheme="green"
                    onClick={exportarExcel}
                    isDisabled={!relatorio}
                  >
                    Exportar Excel
                  </Button>
                  <Button
                    leftIcon={<FiFileText />}
                    colorScheme="red"
                    onClick={exportarPdf}
                    isDisabled={!relatorio}
                  >
                    Exportar PDF
                  </Button>
                </>
              )}
            </HStack>
          </Flex>

          {vinculos.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              Nenhum vínculo comparável encontrado. Certifique-se de que existem vínculos cadastrados com questões vinculadas e respostas de pelo menos 2 tipos de participantes.
            </Alert>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <Heading size="md">Selecionar Vínculo</Heading>
                </CardHeader>
                <CardBody>
                  <Select
                    value={vinculoSelecionado || ''}
                    onChange={(e) => setVinculoSelecionado(Number(e.target.value))}
                    placeholder="Selecione um vínculo"
                  >
                    {vinculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.avaliacaoAlunoTitulo} {v.avaliacaoProfessorTitulo ? `× ${v.avaliacaoProfessorTitulo}` : ''} {v.avaliacaoCoordenadorTitulo ? `× ${v.avaliacaoCoordenadorTitulo}` : ''} ({v.totalQuestoesVinculadas} questões)
                      </option>
                    ))}
                  </Select>
                </CardBody>
              </Card>

              {loadingRelatorio ? (
                <Flex justify="center" align="center" minH="400px">
                  <Spinner size="xl" />
                </Flex>
              ) : relatorio ? (
                <VStack spacing={6} align="stretch">
                  {/* Resumo */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Resumo</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                        <Stat>
                          <StatLabel>Total Respondentes - Alunos</StatLabel>
                          <StatNumber>{relatorio.resumo.totalRespondentes.aluno}</StatNumber>
                        </Stat>
                        {relatorio.resumo.totalRespondentes.professor != null && (
                          <Stat>
                            <StatLabel>Total Respondentes - Professores</StatLabel>
                            <StatNumber>{relatorio.resumo.totalRespondentes.professor}</StatNumber>
                          </Stat>
                        )}
                        {relatorio.resumo.totalRespondentes.coordenador != null && (
                          <Stat>
                            <StatLabel>Total Respondentes - Coordenadores</StatLabel>
                            <StatNumber>{relatorio.resumo.totalRespondentes.coordenador}</StatNumber>
                          </Stat>
                        )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Questões Comparativas */}
                  <Card>
                    <CardHeader>
                      <Heading size="md">Questões Comparativas</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={8} align="stretch">
                        {relatorio.questoes.map((questao, idx) => (
                          <Box key={questao.questaoAlunoId}>
                            <Heading size="sm" mb={4}>
                              {questao.ordem}. {questao.enunciadoAluno}
                            </Heading>
                            {questao.observacao && (
                              <Text fontSize="sm" color="gray.600" mb={2}>
                                Observação: {questao.observacao}
                              </Text>
                            )}
                            <Table variant="simple" size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Opção</Th>
                                  <Th isNumeric>Alunos</Th>
                                  {relatorio.vinculo.tipoComparacao !== 'AlunoProfessor' || questao.totalRespostas.professor != null ? (
                                    <Th isNumeric>Professores</Th>
                                  ) : null}
                                  {relatorio.vinculo.tipoComparacao === 'AlunoProfessorCoordenador' && (
                                    <Th isNumeric>Coordenadores</Th>
                                  )}
                                </Tr>
                              </Thead>
                              <Tbody>
                                {questao.opcoes.map((opcao, opIdx) => (
                                  <Tr key={opIdx}>
                                    <Td>{opcao.rotulo}</Td>
                                    <Td isNumeric>
                                      {opcao.aluno.quantidade} ({opcao.aluno.percentual.toFixed(2)}%)
                                    </Td>
                                    {relatorio.vinculo.tipoComparacao !== 'AlunoProfessor' || questao.totalRespostas.professor != null ? (
                                      <Td isNumeric>
                                        {opcao.professor ? `${opcao.professor.quantidade} (${opcao.professor.percentual.toFixed(2)}%)` : '0 (0,00%)'}
                                      </Td>
                                    ) : null}
                                    {relatorio.vinculo.tipoComparacao === 'AlunoProfessorCoordenador' && (
                                      <Td isNumeric>
                                        {opcao.coordenador ? `${opcao.coordenador.quantidade} (${opcao.coordenador.percentual.toFixed(2)}%)` : '0 (0,00%)'}
                                      </Td>
                                    )}
                                  </Tr>
                                ))}
                                <Tr bg="gray.50" fontWeight="bold">
                                  <Td>Total</Td>
                                  <Td isNumeric>
                                    {questao.totalRespostas.aluno} (100,00%)
                                  </Td>
                                  {relatorio.vinculo.tipoComparacao !== 'AlunoProfessor' || questao.totalRespostas.professor != null ? (
                                    <Td isNumeric>
                                      {questao.totalRespostas.professor ?? 0} ({questao.totalRespostas.professor != null ? '100,00%' : '0,00%'})
                                    </Td>
                                  ) : null}
                                  {relatorio.vinculo.tipoComparacao === 'AlunoProfessorCoordenador' && (
                                    <Td isNumeric>
                                      {questao.totalRespostas.coordenador ?? 0} ({questao.totalRespostas.coordenador != null ? '100,00%' : '0,00%'})
                                    </Td>
                                  )}
                                </Tr>
                              </Tbody>
                            </Table>
                            {idx < relatorio.questoes.length - 1 && <Divider mt={4} />}
                          </Box>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>
                </VStack>
              ) : null}
            </>
          )}
        </VStack>
      </Box>
    </MainLayout>
  );
};

export default RelatorioComparativoPage;

