import React, { useMemo, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Select,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Spinner,
  Flex,
  Card,
  CardHeader,
  CardBody,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Badge,
  VStack,
  Stack,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { FiChevronDown, FiChevronUp, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { MainLayout } from '../../../components/layout/main-layout.component';
import { useNavigate } from 'react-router-dom';
import { useGetAvaliacoes } from '../../../app/services/avaliacao/avaliacao.service.hooks';
import { useRelatorioAvaliacaoGeral } from '../../../hooks/useRelatorioAvaliacao';
import { RelatorioAvaliacaoGeralDto, RelatorioAvaliacaoPerguntaDto, RelatorioAvaliacaoCategoriaSentimentoDto } from '../../../services/relatorios-avaliacao.service';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// Cores para sentimentos (mesmas do dashboard)
const sentimentoColor: Record<string, string> = {
  'Muito negativo': '#e53935',
  'Negativo': '#ff8a80',
  'Misto': '#333',
  'Positivo': '#43a047',
  'Muito positivo': '#00e676',
  'Neutro': '#bdbdbd',
};

interface Sentimento {
  sentimento: string;
  quantidade: number;
}

interface CategoriaSentimento {
  categoria: string;
  total: number;
  sentimentos: Sentimento[];
}

function getSegments(sentimentos: Sentimento[]) {
  const total = sentimentos.reduce((acc, s) => acc + s.quantidade, 0) || 1;
  let startAngle = 0;
  return sentimentos.map(s => {
    const percent = s.quantidade / total;
    const angle = percent * 360;
    const segment = {
      color: sentimentoColor[s.sentimento] || '#bdbdbd',
      startAngle,
      endAngle: startAngle + angle,
      percent,
      label: s.sentimento,
    };
    startAngle += angle;
    return segment;
  });
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(rad)),
    y: cy + (r * Math.sin(rad))
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
}

function BubbleSegmented({ categoria, total, sentimentos, size = 120 }: CategoriaSentimento & { size?: number }) {
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;
  const segments = getSegments(sentimentos);
  return (
    <Box position="relative" w={`${size}px`} h={`${size}px`} mx={2} my={2}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="#f8f9fa" />
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(cx, cy, r, seg.startAngle, seg.endAngle)}
            stroke={seg.color}
            strokeWidth={8}
            fill="none"
          />
        ))}
      </svg>
      <Box position="absolute" top="0" left="0" w="100%" h="100%" display="flex" flexDirection="column" alignItems="center" justifyContent="center" pointerEvents="none">
        <Text fontWeight="bold" fontSize={size > 100 ? 'md' : 'sm'} color="#222" textAlign="center">{categoria.length > 16 ? categoria.slice(0, 14) + '...' : categoria}</Text>
        <Text fontSize="xs" color="#888">{total}</Text>
      </Box>
    </Box>
  );
}

function BubbleSegmentedChart({ data }: { data: CategoriaSentimento[] }) {
  return (
    <>
      <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center" alignItems="center" py={6}>
        {data.map((cat) => (
          <BubbleSegmented
            key={cat.categoria}
            categoria={cat.categoria}
            total={cat.total}
            sentimentos={cat.sentimentos}
            size={Math.max(80, Math.min(180, 60 + cat.total * 10))}
          />
        ))}
      </Box>
      <Box mt={2} mb={4} display="flex" justifyContent="center" gap={4} flexWrap="wrap">
        <Box display="flex" alignItems="center"><Box w="16px" h="16px" bg="#e53935" borderRadius="50%" mr={1} />Muito negativo</Box>
        <Box display="flex" alignItems="center"><Box w="16px" h="16px" bg="#ff8a80" borderRadius="50%" mr={1} />Negativo</Box>
        <Box display="flex" alignItems="center"><Box w="16px" h="16px" bg="#333" borderRadius="50%" mr={1} />Misto</Box>
        <Box display="flex" alignItems="center"><Box w="16px" h="16px" bg="#43a047" borderRadius="50%" mr={1} />Positivo</Box>
        <Box display="flex" alignItems="center"><Box w="16px" h="16px" bg="#00e676" borderRadius="50%" mr={1} />Muito positivo</Box>
        <Box display="flex" alignItems="center"><Box w="16px" h="16px" bg="#bdbdbd" borderRadius="50%" mr={1} />Neutro</Box>
      </Box>
    </>
  );
}

const randomColorPalette = ['#2563eb', '#dc2626', '#16a34a', '#f59e0b', '#7c3aed', '#0ea5e9', '#f97316', '#4338ca', '#10b981'];

const buildChartData = (pergunta: RelatorioAvaliacaoPerguntaDto) => {
  // Para EscalaLinear, ordenar numericamente pelo rótulo
  let opcoesOrdenadas = [...pergunta.opcoes];
  if (pergunta.tipo === 'EscalaLinear') {
    opcoesOrdenadas = opcoesOrdenadas.sort((a, b) => {
      // Tentar converter ambos para números
      const numA = parseFloat(a.rotulo?.toString().trim() || '0');
      const numB = parseFloat(b.rotulo?.toString().trim() || '0');
      
      // Se ambos são números válidos, ordenar numericamente
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Se apenas A é número, A vem primeiro
      if (!isNaN(numA) && isNaN(numB)) {
        return -1;
      }
      
      // Se apenas B é número, B vem primeiro
      if (isNaN(numA) && !isNaN(numB)) {
        return 1;
      }
      
      // Se nenhum é número, ordenar alfabeticamente
      return (a.rotulo || '').localeCompare(b.rotulo || '');
    });
  }

  const labels = opcoesOrdenadas.map((opcao) => opcao.rotulo || 'Sem identificação');
  const data = opcoesOrdenadas.map((opcao) => Number(opcao.percentualGeral.toFixed(2)));
  const backgroundColor = labels.map((_, index) => randomColorPalette[index % randomColorPalette.length]);

  return {
    labels,
    datasets: [
      {
        label: '% de respostas',
        data,
        backgroundColor,
      },
    ],
  };
};

const buildPieData = (resumo: RelatorioAvaliacaoGeralDto['resumoParticipantes']) => {
  const labels = Object.keys(resumo.porTipoParticipante);
  const data = labels.map((tipo) => Number(resumo.porTipoParticipante[tipo].percentual.toFixed(2)));
  const backgroundColor = labels.map((_, index) => randomColorPalette[index % randomColorPalette.length]);

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };
};

const RelatorioAvaliacaoGraficos: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<string>('');
  const [mostrarTextos, setMostrarTextos] = useState<Record<number, boolean>>({});

  const { data: avaliacoes = [], isLoading: carregandoAvaliacoes } = useGetAvaliacoes();
  const removerAcentos = (texto: string) =>
    texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const avaliacoesOrdenadas = useMemo(() => {
    return [...avaliacoes].sort((a, b) => {
      const tituloA = removerAcentos((a.titulo || '').toLowerCase());
      const tituloB = removerAcentos((b.titulo || '').toLowerCase());
      if (tituloA < tituloB) return -1;
      if (tituloA > tituloB) return 1;
      return 0;
    });
  }, [avaliacoes]);
  const relatorioMutation = useRelatorioAvaliacaoGeral();

  const relatorio = relatorioMutation.data;
  const estaCarregando = relatorioMutation.isPending;

  const handleGerarRelatorio = () => {
    if (!avaliacaoSelecionada) {
      toast({
        title: 'Selecione uma avaliação',
        description: 'Escolha o questionário que deseja analisar.',
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
        incluirAnaliseSentimentos: true,
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

  const dadosParticipantes = useMemo(() => {
    if (!relatorio) return null;
    return buildPieData(relatorio.resumoParticipantes);
  }, [relatorio]);

  const toggleTextos = (questaoId: number) => {
    setMostrarTextos((prev) => ({
      ...prev,
      [questaoId]: !prev[questaoId],
    }));
  };

  return (
    <MainLayout>
      <Box p={8}>
        <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'flex-start', lg: 'center' }} mb={6} gap={4}>
          <Box>
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
            <Heading size="lg">Relatório Geral por Avaliação</Heading>
            <Text color="gray.600">
              Visualize gráficos e insights agregados das respostas coletadas para cada questionário.
            </Text>
          </Box>
          <Flex gap={3} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'center' }}>
            <Select
              placeholder={carregandoAvaliacoes ? 'Carregando avaliações...' : 'Selecione a avaliação'}
              value={avaliacaoSelecionada}
              onChange={(event) => setAvaliacaoSelecionada(event.target.value)}
              minW={{ base: '100%', md: '280px' }}
              isDisabled={carregandoAvaliacoes}
            >
              {avaliacoesOrdenadas.map((avaliacao) => (
                <option key={avaliacao.id} value={avaliacao.id}>
                  {avaliacao.titulo}
                </option>
              ))}
            </Select>
            <Button
              leftIcon={<FiRefreshCw />}
              colorScheme="blue"
              onClick={handleGerarRelatorio}
              isLoading={estaCarregando}
            >
              Gerar relatório
            </Button>
          </Flex>
        </Flex>

        {estaCarregando && (
          <Flex align="center" justify="center" minH="200px">
            <Spinner size="lg" />
          </Flex>
        )}

        {!estaCarregando && relatorio ? (
          <Stack spacing={8}>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat shadow="sm" borderWidth="1px" borderRadius="lg" p={4}>
                <StatLabel>Total de Respondentes</StatLabel>
                <StatNumber>{relatorio.resumoParticipantes.totalRespondentes}</StatNumber>
                <StatHelpText>Respondentes únicos do questionário</StatHelpText>
              </Stat>
              {Object.entries(relatorio.resumoParticipantes.porTipoParticipante).map(([tipo, info]) => (
                <Stat key={tipo} shadow="sm" borderWidth="1px" borderRadius="lg" p={4}>
                  <StatLabel>{tipo}</StatLabel>
                  <StatNumber>{info.quantidade}</StatNumber>
                  <StatHelpText>{info.percentual.toFixed(1)}% do total</StatHelpText>
                </Stat>
              ))}
            </SimpleGrid>

            <Card borderWidth="1px" borderRadius="lg" shadow="sm">
              <CardHeader>
                <Heading size="md">Acompanhamento de respostas</Heading>
              </CardHeader>
              <CardBody>
                <Box maxW="480px" mx="auto" height="320px">
                  <Pie
                    data={{
                      labels: ['Respondidos', 'Pendentes'],
                      datasets: [
                        {
                          data: [
                            relatorio.resumoParticipantes.totalRespondentes,
                            relatorio.resumoParticipantes.totalPendentes,
                          ],
                          backgroundColor: ['#2f855a', '#ecc94b'],
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.label}: ${context.raw}`,
                          },
                        },
                        datalabels: {
                          color: '#fff',
                          font: {
                            weight: 'bold',
                          },
                          formatter: (value) => value.toLocaleString(),
                        },
                      },
                    }}
                  />
                </Box>
                <VStack mt={4} spacing={1} align="stretch" fontSize="sm">
                  <Text>
                    <strong>Total de Convites:</strong> {relatorio.resumoParticipantes.totalConvites}
                  </Text>
                  <Text>
                    <strong>Respondidos:</strong> {relatorio.resumoParticipantes.totalRespondentes}
                  </Text>
                  <Text>
                    <strong>Pendentes:</strong> {relatorio.resumoParticipantes.totalPendentes}
                  </Text>
                  <Text>
                    <strong>Percentual de Resposta:</strong> {relatorio.resumoParticipantes.percentualResposta.toFixed(2)}%
                  </Text>
                </VStack>
              </CardBody>
            </Card>

            {relatorio.perguntas
              .filter((pergunta) => pergunta.totalRespostas > 0) // Filtrar questões condicionais sem respostas
              .map((pergunta, perguntaIndex) => {
              const chartData = buildChartData(pergunta);
              const possuiOpcoes = pergunta.opcoes.length > 0;
              const possuiTextos = pergunta.respostasTextuais.length > 0;
              const ordemPergunta = pergunta.ordem > 0 ? pergunta.ordem : perguntaIndex + 1;
              const enunciadoNormalizado = pergunta.enunciado.replace(/^\d+\.\s*/, '');
              let opcoesTabela =
                pergunta.opcoes.length > 0
                  ? [...pergunta.opcoes]
                  : [
                      {
                        rotulo: 'Respostas textuais',
                        total: pergunta.respostasTextuais.length,
                        percentualGeral: 100,
                        porTipoParticipante: {} as Record<string, { quantidade: number; percentual: number }>,
                      },
                    ];
              
              // Para EscalaLinear, ordenar numericamente pelo rótulo
              if (pergunta.tipo === 'EscalaLinear') {
                opcoesTabela = opcoesTabela.sort((a, b) => {
                  // Tentar converter ambos para números
                  const numA = parseFloat(a.rotulo?.toString().trim() || '0');
                  const numB = parseFloat(b.rotulo?.toString().trim() || '0');
                  
                  // Se ambos são números válidos, ordenar numericamente
                  if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                  }
                  
                  // Se apenas A é número, A vem primeiro
                  if (!isNaN(numA) && isNaN(numB)) {
                    return -1;
                  }
                  
                  // Se apenas B é número, B vem primeiro
                  if (isNaN(numA) && !isNaN(numB)) {
                    return 1;
                  }
                  
                  // Se nenhum é número, ordenar alfabeticamente
                  return (a.rotulo || '').localeCompare(b.rotulo || '');
                });
              }
              
              const totalPergunta = opcoesTabela.reduce((sum, opcao) => sum + opcao.total, 0);
              const detalhesTotais = opcoesTabela.reduce<Record<string, { quantidade: number; percentual: number }>>((acc, opcao) => {
                Object.entries(opcao.porTipoParticipante).forEach(([tipo, info]) => {
                  if (!acc[tipo]) {
                    acc[tipo] = { quantidade: 0, percentual: 0 };
                  }
                  acc[tipo].quantidade += info.quantidade;
                });
                return acc;
              }, {});
              Object.entries(detalhesTotais).forEach(([tipo, info]) => {
                detalhesTotais[tipo] = {
                  quantidade: info.quantidade,
                  percentual: totalPergunta > 0 ? (info.quantidade / totalPergunta) * 100 : 0,
                };
              });

              return (
                <Card key={pergunta.questaoId} borderWidth="1px" borderRadius="lg" shadow="sm">
                  <CardHeader display="flex" justifyContent="space-between" alignItems="center" px={4} py={3}>
                    <Box>
                      <Heading size="sm">
                        {ordemPergunta}. {enunciadoNormalizado}
                      </Heading>
                      <Text color="gray.500" fontSize="sm">
                        {pergunta.totalRespostas} respostas registradas
                      </Text>
                    </Box>
                    {possuiTextos && (
                      <IconButton
                        aria-label="Alternar respostas textuais"
                        icon={mostrarTextos[pergunta.questaoId] ? <FiChevronUp /> : <FiChevronDown />}
                        onClick={() => toggleTextos(pergunta.questaoId)}
                        variant="ghost"
                      />
                    )}
                  </CardHeader>
                  <CardBody px={4} py={3}>
                    {possuiOpcoes && pergunta.tipo !== 'CaixaTexto' ? (
                      <Box>
                        <Box height="260px" mb={4}>
                          <Bar
                            data={chartData}
                            options={{
                              maintainAspectRatio: false,
                              responsive: true,
                              plugins: {
                                legend: {
                                  display: false,
                                },
                                tooltip: {
                                  callbacks: {
                                    label: (context) => `${context.formattedValue}%`,
                                  },
                                },
                                datalabels: {
                                  anchor: 'end',
                                  align: 'start',
                                  clamp: true,
                                  color: '#111',
                                  offset: -12,
                                  font: {
                                    weight: 'bold',
                                  },
                                  formatter: (value) => `${value}%`,
                                },
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  max: 100,
                                  ticks: {
                                    callback: (value) => `${value}%`,
                                  },
                                },
                                x: {
                                  ticks: {
                                    callback: (value, index, ticks) => {
                                      const label = chartData.labels[index] ?? '';
                                      return label.length > 30 ? `${label.slice(0, 30)}…` : label;
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </Box>

                        <Table size="sm" mt={4} variant="striped" colorScheme="gray">
                          <Thead>
                            <Tr>
                              <Th>Opção</Th>
                              <Th textAlign="right">Total</Th>
                              <Th textAlign="right">Percentual</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {opcoesTabela.map((opcao) => (
                              <Tr key={`${pergunta.questaoId}-${opcao.rotulo}`}>
                                <Td>
                                  <Text fontWeight="medium" whiteSpace="pre-line">
                                    {opcao.rotulo?.split('\r\n').join('\n').split('\r').join('\n') || 'Não informado'}
                                  </Text>
                                </Td>
                                <Td textAlign="right">{opcao.total}</Td>
                                <Td textAlign="right">{opcao.percentualGeral.toFixed(2)}%</Td>
                              </Tr>
                            ))}
                            <Tr fontWeight="bold" bg="gray.100">
                              <Td>Total</Td>
                              <Td textAlign="right">{totalPergunta}</Td>
                              <Td textAlign="right">100%</Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </Box>
                    ) : pergunta.tipo === 'CaixaTexto' ? (
                      <Box>
                        {/* Mostrar análise de sentimento por categoria (como no dashboard) se disponível */}
                        {pergunta.analiseSentimentoPorCategoria && pergunta.analiseSentimentoPorCategoria.length > 0 ? (
                          <>
                            <Text color="gray.600" mb={4} fontWeight="medium" fontSize="lg">
                              Análise de Sentimento por Categoria - {pergunta.totalRespostas} resposta(s)
                            </Text>
                            <BubbleSegmentedChart 
                              data={pergunta.analiseSentimentoPorCategoria.map(cat => ({
                                categoria: cat.categoria,
                                total: cat.total,
                                sentimentos: cat.sentimentos.map(s => ({
                                  sentimento: s.sentimento,
                                  quantidade: s.quantidade
                                }))
                              }))} 
                            />
                          </>
                        ) : pergunta.analiseSentimentoAgregada && pergunta.analiseSentimentoAgregada.length > 0 ? (
                          <>
                            <Text color="gray.600" mb={4} fontWeight="medium">
                              Análise de Sentimento - {pergunta.totalRespostas} resposta(s)
                            </Text>
                            <Box height="260px" mb={4}>
                              <Bar
                                data={{
                                  labels: pergunta.analiseSentimentoAgregada.map(s => s.sentimento),
                                  datasets: [
                                    {
                                      label: '% de respostas',
                                      data: pergunta.analiseSentimentoAgregada.map(s => Number(s.percentual.toFixed(2))),
                                      backgroundColor: pergunta.analiseSentimentoAgregada.map((_, index) => 
                                        randomColorPalette[index % randomColorPalette.length]
                                      ),
                                    },
                                  ],
                                }}
                                options={{
                                  maintainAspectRatio: false,
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      display: false,
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: (context) => `${context.formattedValue}% (${pergunta.analiseSentimentoAgregada![context.dataIndex].quantidade} respostas)`,
                                      },
                                    },
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      max: 100,
                                      ticks: {
                                        callback: (value) => `${value}%`,
                                      },
                                    },
                                  },
                                }}
                              />
                            </Box>
                            <Table size="sm" mt={4} variant="striped" colorScheme="gray">
                              <Thead>
                                <Tr>
                                  <Th>Sentimento</Th>
                                  <Th textAlign="right">Quantidade</Th>
                                  <Th textAlign="right">Percentual</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {pergunta.analiseSentimentoAgregada.map((sentimento) => (
                                  <Tr key={sentimento.sentimento}>
                                    <Td>
                                      <Text fontWeight="medium">{sentimento.sentimento}</Text>
                                    </Td>
                                    <Td textAlign="right">{sentimento.quantidade}</Td>
                                    <Td textAlign="right">{sentimento.percentual.toFixed(2)}%</Td>
                                  </Tr>
                                ))}
                                <Tr fontWeight="bold" bg="gray.100">
                                  <Td>Total</Td>
                                  <Td textAlign="right">{pergunta.totalRespostas}</Td>
                                  <Td textAlign="right">100%</Td>
                                </Tr>
                              </Tbody>
                            </Table>
                          </>
                        ) : (
                          <>
                            <Text color="gray.600" mb={3}>
                              Esta é uma questão aberta. {pergunta.respostasTextuais.length > 0 
                                ? `Clique no botão acima para ver as ${pergunta.respostasTextuais.length} resposta(s) textual(is).`
                                : 'Não há respostas textuais registradas.'}
                            </Text>
                            {pergunta.opcoes.length > 0 && (
                              <Table variant="simple" size="md">
                                <Thead>
                                  <Tr>
                                    <Th>Opção/Resposta</Th>
                                    <Th textAlign="right">Total</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {pergunta.opcoes.map((opcao, opcaoIndex) => {
                                    let linhasTexto: string[] = [];
                                    if (pergunta.tipo === 'CaixaTexto' && opcao.rotulo) {
                                      linhasTexto = opcao.rotulo.split(/\r\n|\r|\n/).filter(linha => linha.trim().length > 0);
                                      if (linhasTexto.length === 1 && opcao.rotulo.includes(';')) {
                                        linhasTexto = opcao.rotulo.split(';').map(l => l.trim()).filter(linha => linha.length > 0);
                                      }
                                    } else {
                                      linhasTexto = [opcao.rotulo || 'Não informado'];
                                    }
                                    
                                    return (
                                      <React.Fragment key={opcao.opcaoId || `textual-${opcaoIndex}`}>
                                        {linhasTexto.map((linha, linhaIndex) => (
                                          <Tr key={`${opcao.opcaoId || 'textual'}-${linhaIndex}`}>
                                            <Td maxW="600px">
                                              <Text fontWeight="medium" whiteSpace="pre-wrap" wordBreak="break-word">
                                                {linha}
                                              </Text>
                                            </Td>
                                          </Tr>
                                        ))}
                                      </React.Fragment>
                                    );
                                  })}
                                  <Tr fontWeight="bold" bg="gray.100">
                                    <Td>Total</Td>
                                    <Td textAlign="right">{pergunta.totalRespostas}</Td>
                                  </Tr>
                                </Tbody>
                              </Table>
                            )}
                          </>
                        )}
                      </Box>
                    ) : (
                      <Text color="gray.500">Não há dados quantitativos para esta questão.</Text>
                    )}

                    {possuiTextos && (
                      <Collapse in={mostrarTextos[pergunta.questaoId]} animateOpacity>
                        <Box mt={4}>
                          <Heading size="sm" mb={2}>
                            Respostas textuais ({pergunta.respostasTextuais.length})
                          </Heading>
                          <Stack spacing={3}>
                            {pergunta.respostasTextuais.map((resposta) => (
                              <Box key={resposta.respostaId} borderWidth="1px" borderRadius="md" p={3} bg="gray.50">
                                <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={2}>
                                  <Box>
                                    <Text fontWeight="semibold">{resposta.participanteNome || 'Participante'}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                      {new Date(resposta.dataResposta).toLocaleDateString()} • {resposta.tipoParticipante}
                                    </Text>
                                  </Box>
                                  {resposta.sentimento && <Badge colorScheme="blue">{resposta.sentimento}</Badge>}
                                </Flex>
                                <Text mt={2} color="gray.700">
                                  {resposta.texto}
                                </Text>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      </Collapse>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </Stack>
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

export default RelatorioAvaliacaoGraficos;


