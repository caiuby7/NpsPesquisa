import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Select,
  Button,
  useToast,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Flex,
  Badge,
  VStack,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FiRefreshCw, FiDownload } from 'react-icons/fi';
import { MainLayout } from '../../../components/layout/main-layout.component';
import { useGetAvaliacoes } from '../../../app/services/avaliacao/avaliacao.service.hooks';
import { useRelatorioAvaliacaoGeral } from '../../../hooks/useRelatorioAvaliacao';
import {
  RelatorioAvaliacaoGeralDto,
  RelatorioAvaliacaoPerguntaDto,
  RelatorioAvaliacaoOpcaoDto,
  relatoriosAvaliacaoService,
} from '../../../services/relatorios-avaliacao.service';

const RelatorioAvaliacaoTabela: React.FC = () => {
  const toast = useToast();
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<string>('');

  const { data: avaliacoes = [], isLoading: carregandoAvaliacoes } = useGetAvaliacoes();
  const relatorioMutation = useRelatorioAvaliacaoGeral();
  const relatorio = relatorioMutation.data;
  const estaCarregando = relatorioMutation.isPending;

  const perguntasTabela = useMemo(() => {
    if (!relatorio) return [];

    return relatorio.perguntas.map((pergunta, index) => {
      const ordem = pergunta.ordem > 0 ? pergunta.ordem : index + 1;
      const enunciadoNormalizado = pergunta.enunciado.replace(/^\d+\.\s*/, '');

      let opcoes =
        pergunta.opcoes.length > 0
          ? pergunta.opcoes.map((opcao) => ({
              rotulo: opcao.rotulo || 'Não informado',
              total: opcao.total,
              percentual: opcao.percentualGeral,
              detalhes: opcao.porTipoParticipante,
            }))
          : [
              {
                rotulo: 'Respostas textuais',
                total: pergunta.respostasTextuais.length,
                percentual: 100,
                detalhes: {} as RelatorioAvaliacaoOpcaoDto['porTipoParticipante'],
              },
            ];

      // Para EscalaLinear, ordenar numericamente pelo rótulo
      if (pergunta.tipo === 'EscalaLinear') {
        opcoes = opcoes.sort((a, b) => {
          const numA = parseInt(a.rotulo, 10);
          const numB = parseInt(b.rotulo, 10);
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          // Se não conseguir converter, manter ordem original
          return a.rotulo.localeCompare(b.rotulo);
        });
      }

      const totalPergunta = opcoes.reduce((sum, opcao) => sum + (opcao.total || 0), 0);
      const detalhesTotais = opcoes.reduce<Record<string, { quantidade: number; percentual: number }>>(
        (acc, opcao) => {
          Object.entries(opcao.detalhes).forEach(([tipo, info]) => {
            if (!acc[tipo]) {
              acc[tipo] = { quantidade: 0, percentual: 0 };
            }
            acc[tipo].quantidade += info.quantidade;
          });
          return acc;
        },
        {}
      );

      Object.entries(detalhesTotais).forEach(([tipo, info]) => {
        detalhesTotais[tipo] = {
          quantidade: info.quantidade,
          percentual: totalPergunta > 0 ? (info.quantidade / totalPergunta) * 100 : 0,
        };
      });

      return {
        id: pergunta.questaoId,
        ordem,
        enunciado: enunciadoNormalizado,
        totalPergunta: opcoes.reduce((sum, opcao) => sum + opcao.total, 0),
        opcoes,
        detalhesTotais,
        rowSpan: Math.max(pergunta.opcoes.length, 1),
        possuiOpcoes: pergunta.opcoes.length > 0,
        respostasTextuais: pergunta.respostasTextuais,
        tipo: pergunta.tipo,
      };
    });
  }, [relatorio]);

  const handleGerarRelatorio = () => {
    if (!avaliacaoSelecionada) {
      toast({
        title: 'Selecione uma avaliação',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    relatorioMutation.mutate(
      {
        questionarioId: Number(avaliacaoSelecionada),
        incluirRespostasTextuais: true,
        incluirAnaliseSentimentos: false,
      },
      {
        onError: (error) => {
          toast({
            title: 'Erro ao buscar relatório',
            description: error.message || 'Não foi possível carregar o relatório. Tente novamente.',
            status: 'error',
            duration: 4000,
            isClosable: true,
          });
        },
      }
    );
  };

  const handleExportarExcel = async () => {
    if (!avaliacaoSelecionada) {
      toast({
        title: 'Selecione uma avaliação',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const blob = await relatoriosAvaliacaoService.exportarRelatorioGeralExcel({
        questionarioId: Number(avaliacaoSelecionada),
        incluirRespostasTextuais: false,
        incluirAnaliseSentimentos: false,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Relatorio_Avaliacao_${avaliacaoSelecionada}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Excel exportado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao exportar Excel',
        description: error.message || 'Não foi possível exportar o relatório. Tente novamente.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <MainLayout>
      <Box p={8}>
        <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'flex-start', lg: 'center' }} mb={6} gap={4}>
          <Box>
            <Heading size="lg">Relatório Geral — Visão Tabular</Heading>
            <Text color="gray.600">Visualize os resultados consolidados do questionário em formato tabular detalhado.</Text>
          </Box>
          <Flex gap={3} direction={{ base: 'column', md: 'row' }}>
            <Select
              placeholder={carregandoAvaliacoes ? 'Carregando avaliações...' : 'Selecione a avaliação'}
              value={avaliacaoSelecionada}
              onChange={(event) => setAvaliacaoSelecionada(event.target.value)}
              minW={{ base: '100%', md: '260px' }}
              isDisabled={carregandoAvaliacoes}
            >
              {avaliacoes.map((avaliacao) => (
                <option key={avaliacao.id} value={avaliacao.id}>
                  {avaliacao.titulo}
                </option>
              ))}
            </Select>
            <Flex gap={2}>
              <Button
                leftIcon={<FiRefreshCw />}
                colorScheme="blue"
                onClick={handleGerarRelatorio}
                isLoading={estaCarregando}
              >
                Gerar relatório
              </Button>
              <Button
                leftIcon={<FiDownload />}
                variant="outline"
                onClick={handleExportarExcel}
              >
                Exportar Excel
              </Button>
            </Flex>
          </Flex>
        </Flex>

        {estaCarregando && (
          <Flex align="center" justify="center" minH="200px">
            <Spinner size="lg" />
          </Flex>
        )}

        {!estaCarregando && relatorio ? (
          <VStack align="stretch" spacing={6}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat shadow="sm" borderWidth="1px" borderRadius="lg" p={4}>
                <StatLabel>Avaliação</StatLabel>
                <StatNumber fontSize="lg">{relatorio.titulo}</StatNumber>
              </Stat>
              <Stat shadow="sm" borderWidth="1px" borderRadius="lg" p={4}>
                <StatLabel>Período</StatLabel>
                <StatNumber fontSize="lg">
                  {[relatorio.dataInicio, relatorio.dataFim].filter(Boolean).map((data) => new Date(data as string).toLocaleDateString('pt-BR')).join(' • ')}
                </StatNumber>
              </Stat>
              <Stat shadow="sm" borderWidth="1px" borderRadius="lg" p={4}>
                <StatLabel>Total de Convites</StatLabel>
                <StatNumber>{relatorio.resumoParticipantes.totalConvites}</StatNumber>
              </Stat>
              <Stat shadow="sm" borderWidth="1px" borderRadius="lg" p={4}>
                <StatLabel>Respondidos</StatLabel>
                <StatNumber>{relatorio.resumoParticipantes.totalRespondentes}</StatNumber>
                <StatHelpText>{relatorio.resumoParticipantes.percentualResposta.toFixed(2)}% de resposta</StatHelpText>
              </Stat>
            </SimpleGrid>

            <Divider />

            <Table variant="simple" size="md">
              <TableCaption placement="top">
                Distribuição das respostas por questão e opção selecionada
              </TableCaption>
              <Thead>
                <Tr>
                  <Th minW="320px">Questão</Th>
                  <Th>Opção/Resposta</Th>
                  <Th textAlign="right">Total</Th>
                  {perguntasTabela.some(p => p.tipo !== 'CaixaTexto') && (
                    <Th textAlign="right">% Geral</Th>
                  )}
                </Tr>
              </Thead>
              <Tbody>
                {perguntasTabela.map((pergunta) => (
                  <React.Fragment key={pergunta.id}>
                    {pergunta.tipo === 'CaixaTexto' ? (() => {
                      // Calcular total de linhas para questões abertas
                      const totalLinhas = pergunta.opcoes.reduce((sum, o) => {
                        let l: string[] = [];
                        if (o.rotulo) {
                          l = o.rotulo.split(/\r\n|\r|\n/).filter(lin => lin.trim().length > 0);
                          if (l.length === 1 && o.rotulo.includes(';')) {
                            l = o.rotulo.split(';').map(li => li.trim()).filter(lin => lin.length > 0);
                          }
                        }
                        return sum + (l.length > 0 ? l.length : 1);
                      }, 0);
                      
                      // Para questões abertas, dividir cada opção em linhas separadas
                      return pergunta.opcoes.flatMap((opcao, opcaoIndex) => {
                        let linhasTexto: string[] = [];
                        if (opcao.rotulo) {
                          // Primeiro tenta dividir por quebras de linha
                          linhasTexto = opcao.rotulo.split(/\r\n|\r|\n/).filter(linha => linha.trim().length > 0);
                          // Se não encontrou quebras de linha, tenta dividir por semicolons
                          if (linhasTexto.length === 1 && opcao.rotulo.includes(';')) {
                            linhasTexto = opcao.rotulo.split(';').map(l => l.trim()).filter(linha => linha.length > 0);
                          }
                        } else {
                          linhasTexto = ['Não informado'];
                        }
                        
                        return linhasTexto.map((linha, linhaIndex) => (
                          <Tr key={`${pergunta.id}-${opcaoIndex}-${linhaIndex}`}>
                            {opcaoIndex === 0 && linhaIndex === 0 && (
                              <Td rowSpan={totalLinhas + 1} maxW="360px" pr={4} fontWeight="semibold">
                                {pergunta.ordem}. {pergunta.enunciado}
                              </Td>
                            )}
                            <Td>
                              <Text fontWeight="medium" whiteSpace="pre-wrap" wordBreak="break-word">
                                {linha}
                              </Text>
                            </Td>
                          </Tr>
                        ));
                      });
                    })() : (
                      // Para questões normais, manter a lógica original
                      pergunta.opcoes.map((opcao, index) => (
                        <Tr key={`${pergunta.id}-${opcao.rotulo}-${index}`}>
                          {index === 0 && (
                            <Td rowSpan={pergunta.rowSpan} maxW="360px" pr={4} fontWeight="semibold">
                              {pergunta.ordem}. {pergunta.enunciado}
                            </Td>
                          )}
                          <Td>
                            <Text fontWeight="medium" whiteSpace="pre-line">
                              {opcao.rotulo?.split('\r\n').join('\n').split('\r').join('\n')}
                            </Text>
                          </Td>
                          <Td textAlign="right">{opcao.total}</Td>
                          {pergunta.tipo !== 'CaixaTexto' && (
                            <Td textAlign="right">{opcao.percentual.toFixed(2)}%</Td>
                          )}
                        </Tr>
                      ))
                    )}
                    {!pergunta.possuiOpcoes && pergunta.respostasTextuais.length > 0 && (
                      <Tr>
                        <Td />
                        <Td colSpan={pergunta.tipo === 'CaixaTexto' ? 2 : 3}>
                          <VStack align="stretch" spacing={1}>
                            {pergunta.respostasTextuais.map((resposta) => (
                              <Box key={resposta.respostaId} borderWidth="1px" borderRadius="md" p={2} bg="gray.50">
                                <Text fontSize="sm" color="gray.700">
                                  {resposta.texto}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {resposta.participanteNome || 'Participante'} •{' '}
                                  {new Date(resposta.dataResposta).toLocaleDateString('pt-BR')}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </Td>
                      </Tr>
                    )}
                    <Tr fontWeight="bold" bg="gray.100">
                      <Td colSpan={pergunta.tipo === 'CaixaTexto' ? 1 : 2}>Total</Td>
                      {pergunta.tipo === 'CaixaTexto' && (
                        <Td textAlign="right">{pergunta.totalPergunta}</Td>
                      )}
                      {pergunta.tipo !== 'CaixaTexto' && (
                        <>
                          <Td textAlign="right">{pergunta.totalPergunta}</Td>
                          <Td textAlign="right">100%</Td>
                        </>
                      )}
                    </Tr>
                  </React.Fragment>
                ))}
              </Tbody>
            </Table>

            {relatorio.perguntas.some((pergunta) => pergunta.respostasTextuais.length > 0) && (
              <>
                <Divider />
                <Box>
                  <Heading size="md" mb={3}>
                    Respostas textuais (resumo)
                  </Heading>
                  <Text color="gray.600" mb={4}>
                    Esta visão tabular destaca apenas a quantidade de respostas textuais por questão. Consulte a página de gráficos para ler os conteúdos individuais com sentimento classificado.
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {relatorio.perguntas
                      .filter((pergunta) => pergunta.respostasTextuais.length > 0)
                      .map((pergunta) => (
                        <Box key={pergunta.questaoId} borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                  <Heading size="sm" mb={2}>
                    {pergunta.ordem}. {pergunta.enunciado}
                  </Heading>
                          <Text color="gray.600">
                            {pergunta.respostasTextuais.length} resposta(s) aberta(s) registradas.
                          </Text>
                        </Box>
                      ))}
                  </SimpleGrid>
                </Box>
              </>
            )}
          </VStack>
        ) : null}

        {!estaCarregando && !relatorio && relatorioMutation.isSuccess && (
          <Box borderWidth="1px" borderRadius="lg" p={8} textAlign="center">
            <Heading size="md">Nenhum dado encontrado</Heading>
            <Text color="gray.500">Esta avaliação ainda não possui respostas ou não atende aos filtros selecionados.</Text>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default RelatorioAvaliacaoTabela;


