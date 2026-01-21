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
  Divider,
} from '@chakra-ui/react';
import { MainLayout } from '../../../components/layout/main-layout.component';
import { FiDownload, FiRefreshCw, FiArrowLeft, FiFileText } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import {
  relatoriosAvaliacaoService,
  VinculoComparavelDto,
  RelatorioComparativoAgrupadoDto,
  RelatorioComparativoRequest,
} from '../../../services/relatorios-avaliacao.service';
import { useAuth } from '../../../contexts/AuthContext';
import { participanteService, ParticipanteDadosRelatorioDto } from '../../../services/participante.service';

const RelatorioComparativoAgrupadoPage: React.FC = () => {
  const navigate = useNavigate();
  const { tipoAgrupamento } = useParams<{ tipoAgrupamento: string }>();
  const [vinculos, setVinculos] = useState<VinculoComparavelDto[]>([]);
  const [vinculoSelecionado, setVinculoSelecionado] = useState<number | null>(null);
  const [relatorios, setRelatorios] = useState<RelatorioComparativoAgrupadoDto[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);
  const [dadosParticipante, setDadosParticipante] = useState<ParticipanteDadosRelatorioDto | null>(null);
  const toast = useToast();

  const [filtros, setFiltros] = useState<Omit<RelatorioComparativoRequest, 'vinculoId'>>({});

  const tipoAgrupamentoLabel = tipoAgrupamento === 'por-curso' ? 'Por Curso'
    : tipoAgrupamento === 'por-curso-turno' ? 'Por Curso/Turno'
    : tipoAgrupamento === 'por-turma' ? 'Por Turma'
    : tipoAgrupamento === 'por-disciplina' ? 'Por Disciplina'
    : 'Agrupado';

  useEffect(() => {
    const carregarDadosParticipante = async () => {
      try {
        if (user?.perfil && ['aluno', 'professor', 'coordenador'].includes(user.perfil.toLowerCase())) {
          const dados = await participanteService.obterMeusDados();
          setDadosParticipante(dados);
          
          // Aplicar filtros automáticos baseados nos dados do participante
          const filtrosAuto: Omit<RelatorioComparativoRequest, 'vinculoId'> = {};
          
          if (tipoAgrupamento === 'por-curso' && dados.cursoIds.length > 0) {
            filtrosAuto.cursoIds = dados.cursoIds;
          } else if (tipoAgrupamento === 'por-turma' && dados.turmaIds.length > 0) {
            filtrosAuto.turmaIds = dados.turmaIds;
          } else if (tipoAgrupamento === 'por-disciplina' && dados.disciplinaIds.length > 0) {
            filtrosAuto.disciplinaIds = dados.disciplinaIds;
          } else if (tipoAgrupamento === 'por-curso-turno' && dados.cursoIds.length > 0) {
            filtrosAuto.cursoIds = dados.cursoIds;
          }
          
          setFiltros(filtrosAuto);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do participante:', error);
      }
    };

    carregarDadosParticipante();
    carregarVinculos();
  }, [user, tipoAgrupamento]);

  useEffect(() => {
    if (vinculoSelecionado && tipoAgrupamento) {
      carregarRelatorio();
    }
  }, [vinculoSelecionado, filtros, tipoAgrupamento]);

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
    if (!vinculoSelecionado || !tipoAgrupamento) return;

    try {
      setLoadingRelatorio(true);
      const request: RelatorioComparativoRequest = {
        ...filtros,
      } as RelatorioComparativoRequest;

      let dados: RelatorioComparativoAgrupadoDto[];
      switch (tipoAgrupamento) {
        case 'por-curso':
          dados = await relatoriosAvaliacaoService.obterRelatorioComparativoPorCurso(vinculoSelecionado, request);
          break;
        case 'por-curso-turno':
          dados = await relatoriosAvaliacaoService.obterRelatorioComparativoPorCursoTurno(vinculoSelecionado, request);
          break;
        case 'por-turma':
          dados = await relatoriosAvaliacaoService.obterRelatorioComparativoPorTurma(vinculoSelecionado, request);
          break;
        case 'por-disciplina':
          dados = await relatoriosAvaliacaoService.obterRelatorioComparativoPorDisciplina(vinculoSelecionado, request);
          break;
        default:
          dados = [];
      }
      setRelatorios(dados);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar relatório',
        description: error.message || 'Não foi possível carregar o relatório comparativo agrupado',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const handleExportarExcel = async () => {
    if (!vinculoSelecionado || !tipoAgrupamento) return;

    try {
      const request: RelatorioComparativoRequest = {
        ...filtros,
      } as RelatorioComparativoRequest;

      const blob = await relatoriosAvaliacaoService.exportarRelatorioComparativoAgrupadoExcel(
        vinculoSelecionado,
        tipoAgrupamento,
        request
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Comparativo_${tipoAgrupamento}_${vinculoSelecionado}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Excel exportado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar Excel',
        description: error.message || 'Não foi possível exportar o relatório para Excel',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleExportarPdf = async () => {
    if (!vinculoSelecionado || !tipoAgrupamento) return;

    try {
      const request: RelatorioComparativoRequest = {
        ...filtros,
      } as RelatorioComparativoRequest;

      const blob = await relatoriosAvaliacaoService.exportarRelatorioComparativoAgrupadoPdf(
        vinculoSelecionado,
        tipoAgrupamento,
        request
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Comparativo_${tipoAgrupamento}_${vinculoSelecionado}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'PDF exportado com sucesso',
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

  return (
    <MainLayout>
      <Box p={6}>
        <Flex mb={4}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/relatorios')}
            size="sm"
          >
            Voltar para Central de Relatórios
          </Button>
        </Flex>

        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="xl" color="blue.600" mb={2}>
              Relatório Comparativo - {tipoAgrupamentoLabel}
            </Heading>
            <Text color="gray.600">
              Compare respostas de diferentes tipos de participantes agrupadas por {tipoAgrupamentoLabel.toLowerCase()}
            </Text>
          </Box>

          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Filtros</Heading>
                <HStack>
                  <Button
                    leftIcon={<FiRefreshCw />}
                    onClick={carregarRelatorio}
                    isLoading={loadingRelatorio}
                    size="sm"
                  >
                    Atualizar
                  </Button>
                  <Button
                    leftIcon={<FiDownload />}
                    onClick={handleExportarExcel}
                    colorScheme="green"
                    size="sm"
                    isDisabled={!vinculoSelecionado || relatorios.length === 0}
                  >
                    Exportar Excel
                  </Button>
                  <Button
                    leftIcon={<FiFileText />}
                    onClick={handleExportarPdf}
                    colorScheme="red"
                    size="sm"
                    isDisabled={!vinculoSelecionado || relatorios.length === 0}
                  >
                    Exportar PDF
                  </Button>
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>Vínculo Comparativo</Text>
                  <Select
                    value={vinculoSelecionado || ''}
                    onChange={(e) => setVinculoSelecionado(Number(e.target.value))}
                    placeholder="Selecione um vínculo"
                  >
                    {vinculos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.avaliacaoAlunoTitulo} {v.avaliacaoProfessorTitulo ? `x ${v.avaliacaoProfessorTitulo}` : ''}
                      </option>
                    ))}
                  </Select>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {loadingRelatorio ? (
            <Flex justify="center" py={10}>
              <Spinner size="xl" />
            </Flex>
          ) : relatorios.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              Nenhum dado encontrado para os filtros selecionados.
            </Alert>
          ) : (
            <VStack spacing={6} align="stretch">
              {relatorios.map((agrupado, index) => (
                <Card key={agrupado.chaveAgrupamento}>
                  <CardHeader>
                    <Heading size="md">
                      {agrupado.nomeAgrupamento}
                      {agrupado.nomeSecundario && (
                        <Text as="span" color="gray.500" fontSize="md" ml={2}>
                          - {agrupado.nomeSecundario}
                        </Text>
                      )}
                    </Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {agrupado.relatorio.questoes.map((questao) => (
                        <Box key={questao.questaoAlunoId}>
                          <Text fontWeight="bold" mb={2}>
                            {questao.ordem}. {questao.enunciadoAluno}
                          </Text>
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th>Opção</Th>
                                <Th isNumeric>Acadêmicos</Th>
                                {agrupado.relatorio.vinculo.tipoComparacao !== 'Aluno' && (
                                  <Th isNumeric>Professores</Th>
                                )}
                                {agrupado.relatorio.vinculo.tipoComparacao === 'AlunoProfessorCoordenador' && (
                                  <Th isNumeric>Coordenadores</Th>
                                )}
                              </Tr>
                            </Thead>
                            <Tbody>
                              {questao.opcoes.map((opcao, opcaoIndex) => (
                                <Tr key={opcaoIndex}>
                                  <Td>{opcao.rotulo}</Td>
                                  <Td isNumeric>
                                    <Badge colorScheme="blue">
                                      {opcao.aluno.percentual.toFixed(2)}% ({opcao.aluno.quantidade})
                                    </Badge>
                                  </Td>
                                  {agrupado.relatorio.vinculo.tipoComparacao !== 'Aluno' && (
                                    <Td isNumeric>
                                      {opcao.professor ? (
                                        <Badge colorScheme="green">
                                          {opcao.professor.percentual.toFixed(2)}% ({opcao.professor.quantidade})
                                        </Badge>
                                      ) : (
                                        <Badge colorScheme="gray">0% (0)</Badge>
                                      )}
                                    </Td>
                                  )}
                                  {agrupado.relatorio.vinculo.tipoComparacao === 'AlunoProfessorCoordenador' && (
                                    <Td isNumeric>
                                      {opcao.coordenador ? (
                                        <Badge colorScheme="purple">
                                          {opcao.coordenador.percentual.toFixed(2)}% ({opcao.coordenador.quantidade})
                                        </Badge>
                                      ) : (
                                        <Badge colorScheme="gray">0% (0)</Badge>
                                      )}
                                    </Td>
                                  )}
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                          <Divider mt={4} />
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </MainLayout>
  );
};

export default RelatorioComparativoAgrupadoPage;

