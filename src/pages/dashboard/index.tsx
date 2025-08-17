import React, { useState } from 'react';
import { Box, SimpleGrid, Heading, Text, Divider, List, ListItem, Badge, Select, Spinner, Alert, AlertIcon, Progress, Button, HStack } from '@chakra-ui/react';
import { AppHeader } from '../../components/header/header.component';
import { useGetForms, useGetDashboardData } from '../../services/form/form.service.hooks';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartDataLabels
);

// Dados mockados para fallback
const mockTendenciaRespostas = {
  labels: [
    'Nov 11', 'Nov 12', 'Nov 13', 'Nov 14', 'Nov 15', 'Nov 16', 'Nov 17', 'Nov 18', 'Nov 19', 'Nov 20', 'Nov 21', 'Nov 22', 'Nov 23'
  ],
  datasets: [
    {
      label: 'Respostas',
      data: [10, 4, 15, 2, 1, 1, 7, 4, 9, 4, 9, 5],
      borderColor: '#222',
      backgroundColor: 'rgba(34,34,34,0.1)',
      tension: 0.4,
      fill: false,
      pointRadius: 5,
      pointBackgroundColor: '#222',
    },
  ],
};

const mockCursos = [
  { nome: 'CST EM PROCESSOS GERENCIAIS', perc: 100 },
  { nome: 'CST EM LOGÍSTICA', perc: 100 },
  { nome: 'CST EM GESTÃO DE RECURSOS HUMANOS', perc: 100 },
  { nome: 'CST EM GESTÃO DA PRODUÇÃO INDUSTRIAL', perc: 100 },
  { nome: 'BACHARELADO EM SERVIÇO SOCIAL', perc: 100 },
  { nome: 'BACHARELADO EM ENGENHARIA QUÍMICA', perc: 100 },
  { nome: 'BACHARELADO EM ENGENHARIA MECÂNICA', perc: 100 },
  { nome: 'BACHARELADO EM ENGENHARIA ELÉTRICA', perc: 100 },
  { nome: 'BACHARELADO EM ENGENHARIA CIVIL', perc: 83.3 },
  { nome: 'CST EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS', perc: 80 },
  { nome: 'BACHARELADO EM CIÊNCIAS CONTÁBEIS', perc: 69.2 },
  { nome: 'BACHARELADO EM ADMINISTRAÇÃO', perc: 66.7 },
  { nome: 'LICENCIATURA EM PEDAGOGIA', perc: 66.7 },
  { nome: 'CST EM GESTÃO COMERCIAL', perc: 66.7 },
  { nome: 'BACHARELADO EM ENGENHARIA DE PRODUÇÃO', perc: 50 },
  { nome: 'ABI - EDUCAÇÃO FÍSICA', perc: 50 },
  { nome: 'BACHARELADO EM EDUCAÇÃO FÍSICA', perc: 0 },
];

// Função utilitária para cor por sentimento
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
        {data.map((cat, idx) => (
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

export default function DashboardPage() {
  const { data: forms, isLoading: formsLoading } = useGetForms();
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  const dashboardFormId = selectedFormId ? Number(selectedFormId) : null;
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardData(dashboardFormId);

  // Debug: verificar URL da API
  console.log('API Base URL:', process.env.REACT_APP_API_URL || 'https://apinps.catolicasc.org.br/api');

  // Dados reais da API ou fallback para mockados
  const data = dashboardData || {
    totalRespostas: 0,
    tendenciaRespostas: [],
    npsGeral: 0,
    npsDetalhamento: { passivo: 0, promotor: 0, detrator: 0 },
    satisfacao: 0,
    satisfacaoDetalhamento: { 
      muitoInsatisfeito: 0, 
      insatisfeito: 0, 
      nemInsatisfeitoNemSatisfeito: 0, 
      satisfeito: 0, 
      muitoSatisfeito: 0 
    },
    satisfacaoPorCurso: [],
    comentarios: [],
    matrizMedias: [],
    analiseSentimentoPorCategoriaQ19: [],
    enunciadoQ19: '',
    analiseSentimentoPorCategoriaQ23: [],
    enunciadoQ23: '',
  };

  // Preparar dados para os gráficos
  const tendenciaRespostas = {
    labels: data.tendenciaRespostas.length > 0 
      ? data.tendenciaRespostas.map((item: any) => item.data)
      : mockTendenciaRespostas.labels,
    datasets: [{
      label: 'Respostas',
      data: data.tendenciaRespostas.length > 0 
        ? data.tendenciaRespostas.map((item: any) => item.quantidade)
        : mockTendenciaRespostas.datasets[0].data,
      borderColor: '#222',
      backgroundColor: 'rgba(34,34,34,0.1)',
      tension: 0.4,
      fill: false,
      pointRadius: 5,
      pointBackgroundColor: '#222',
    }],
  };

  // 1. Gauge do NPS: círculo colorido em faixas (apenas estética)
  const npsGaugeColors = [
    '#d32f2f', // Muito Baixo
    '#ff9800', // Baixo
    '#ffeb3b', // Médio
    '#8bc34a', // Alto
    '#43a047', // Excelente
    '#e0e0e0', // Fundo
  ];
  const getNpsGaugeSegments = (nps: number) => {
    // Divide o círculo em 5 faixas de 20 pontos
    const faixas = [20, 20, 20, 20, 20];
    let restante = 100;
    return faixas.map((f, i) => {
      if (restante >= f) {
        restante -= f;
        return f;
      } else if (restante > 0) {
        const val = restante;
        restante = 0;
        return val;
      } else {
        return 0;
      }
    }).concat([0]); // último é o fundo
  };
  const npsGaugeData = {
    labels: ['Muito Baixo', 'Baixo', 'Médio', 'Alto', 'Excelente', 'Fundo'],
    datasets: [{
      data: [...getNpsGaugeSegments(100)],
      backgroundColor: [...npsGaugeColors],
      borderWidth: 0,
    }],
  };

  // Ajustar opções do Doughnut para não mostrar legendas nem valores nas faixas
  const npsGaugeOptions = {
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false },
    },
  };

  // 2. Detalhamento NPS: barra com 3 segmentos coloridos
  const npsDetalhamentoStacked = [
    {
      tipo: 'Passivo',
      percentual: data.npsDetalhamento.passivo ?? 0,
      color: '#ffb300', // amarelo/laranja
    },
    {
      tipo: 'Promotor',
      percentual: data.npsDetalhamento.promotor ?? 0,
      color: '#43a047', // verde
    },
    {
      tipo: 'Detrator',
      percentual: data.npsDetalhamento.detrator ?? 0,
      color: '#e53935', // vermelho
    },
  ];

  // 1. Percentual de satisfação (0-100%)
  const satisfacaoPercent = data.satisfacao ? Math.round((data.satisfacao / 5) * 1000) / 10 : 0;
  const satisfacaoCursoPercent = data.satisfacaoPorCurso && data.satisfacaoPorCurso.length > 0
    ? Math.round((data.satisfacaoPorCurso.reduce((acc: number, cur: any) => acc + (cur.satisfacao ?? 0), 0) / data.satisfacaoPorCurso.length) / 5 * 1000) / 10
    : 0;

  // Gauge de Satisfação: círculo colorido em faixas (apenas estética)
  const satisfacaoGaugeColors = [
    '#d32f2f', // Muito Insatisfeito
    '#ff9800', // Insatisfeito
    '#ffeb3b', // Nem Satisfeito/Nem Insatisfeito
    '#8bc34a', // Satisfeito
    '#43a047', // Muito Satisfeito
    '#e0e0e0', // Fundo
  ];
  const getSatisfacaoGaugeSegments = () => {
    // Sempre 5 faixas de 20% para estética
    return [20, 20, 20, 20, 20, 0];
  };
  const satisfacaoGaugeData = {
    labels: ['Muito Insatisfeito', 'Insatisfeito', 'Nem Satisfeito/Nem Insatisfeito', 'Satisfeito', 'Muito Satisfeito', 'Fundo'],
    datasets: [{
      data: getSatisfacaoGaugeSegments(),
      backgroundColor: [...satisfacaoGaugeColors],
      borderWidth: 0,
    }],
  };
  const satisfacaoGaugeOptions = {
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: { display: false },
    },
  };

  // Gauge de Satisfação com curso: mesmo padrão
  const satisfacaoCursoGaugeData = {
    labels: ['Muito Insatisfeito', 'Insatisfeito', 'Nem Satisfeito/Nem Insatisfeito', 'Satisfeito', 'Muito Satisfeito', 'Fundo'],
    datasets: [{
      data: getSatisfacaoGaugeSegments(),
      backgroundColor: [...satisfacaoGaugeColors],
      borderWidth: 0,
    }],
  };
  const satisfacaoCursoGaugeOptions = satisfacaoGaugeOptions;

  // 3. Ajustar detalhamento de satisfação para 5 faixas (igual ao gauge)
  const satisfacaoDetalhamentoStacked = [
    {
      tipo: 'Muito Insatisfeito',
      percentual: data.satisfacaoDetalhamento.muitoInsatisfeito ?? 0,
      color: '#d32f2f',
    },
    {
      tipo: 'Insatisfeito',
      percentual: data.satisfacaoDetalhamento.insatisfeito ?? 0,
      color: '#ff9800',
    },
    {
      tipo: 'Nem Satisfeito/Nem Insatisfeito',
      percentual: data.satisfacaoDetalhamento.nemInsatisfeitoNemSatisfeito ?? 0,
      color: '#ffeb3b',
    },
    {
      tipo: 'Satisfeito',
      percentual: data.satisfacaoDetalhamento.satisfeito ?? 0,
      color: '#8bc34a',
    },
    {
      tipo: 'Muito Satisfeito',
      percentual: data.satisfacaoDetalhamento.muitoSatisfeito ?? 0,
      color: '#43a047',
    },
  ];

  const satisfacaoBarData = {
    labels: satisfacaoDetalhamentoStacked.map(x => x.tipo),
    datasets: [{
      label: 'Satisfação',
      data: satisfacaoDetalhamentoStacked.map(x => x.percentual),
      backgroundColor: satisfacaoDetalhamentoStacked.map(x => x.color),
    }],
  };

  const cursosBarData = {
    labels: data.satisfacaoPorCurso.length > 0 
      ? data.satisfacaoPorCurso.map((curso: any) => curso.curso)
      : mockCursos.map(c => c.nome),
    datasets: [{
      label: '% Satisfeito + Muito Satisfeito',
      data: data.satisfacaoPorCurso.length > 0 
        ? data.satisfacaoPorCurso.map((curso: any) =>
            (curso.percentuais?.satisfeito ?? 0) + (curso.percentuais?.muitoSatisfeito ?? 0)
          )
        : mockCursos.map(c => c.perc),
      backgroundColor: '#1976d2',
    }],
  };

  // Barra de detalhamento para Satisfação com curso (5 faixas igual ao gauge)
  const satisfacaoCursoDetalhamentoStacked = [
    {
      tipo: 'Muito Insatisfeito',
      percentual: data.satisfacaoCursoDetalhamento?.muitoInsatisfeito ?? 0,
      color: '#d32f2f',
    },
    {
      tipo: 'Insatisfeito',
      percentual: data.satisfacaoCursoDetalhamento?.insatisfeito ?? 0,
      color: '#ff9800',
    },
    {
      tipo: 'Nem Satisfeito/Nem Insatisfeito',
      percentual: data.satisfacaoCursoDetalhamento?.nemInsatisfeitoNemSatisfeito ?? 0,
      color: '#ffeb3b',
    },
    {
      tipo: 'Satisfeito',
      percentual: data.satisfacaoCursoDetalhamento?.satisfeito ?? 0,
      color: '#8bc34a',
    },
    {
      tipo: 'Muito Satisfeito',
      percentual: data.satisfacaoCursoDetalhamento?.muitoSatisfeito ?? 0,
      color: '#43a047',
    },
  ];

  // Renderização dos gráficos de matriz
  const matrizMedias = data.matrizMedias || [];

  // Função de exportação PDF com html2canvas + jsPDF
  const exportDashboardToPdf = async () => {
    const dashboardElement = document.getElementById('dashboard-content');
    if (!dashboardElement) {
      alert('Elemento do dashboard não encontrado!');
      return;
    }

    // Remove limites para capturar tudo
    const oldMaxHeight = dashboardElement.style.maxHeight;
    const oldOverflow = dashboardElement.style.overflow;
    dashboardElement.style.maxHeight = 'none';
    dashboardElement.style.overflow = 'visible';

    await new Promise(resolve => setTimeout(resolve, 500)); // aguarda reflow

    // Captura o dashboard como imagem
    const canvas = await html2canvas(dashboardElement, {
      backgroundColor: '#fff',
      useCORS: true,
      scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');

    // Log para depuração
    console.log('imgData:', imgData);
    console.log('imgData length:', imgData.length);
    if (!imgData.startsWith('data:image/png')) {
      alert('Falha ao capturar imagem do dashboard! O PDF não será gerado.');
      return;
    }

    // Restaura estilos antigos
    dashboardElement.style.maxHeight = oldMaxHeight;
    dashboardElement.style.overflow = oldOverflow;

    // Parâmetros do PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Dimensões da imagem
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    // Paginação
    let position = 0;
    let pageHeightLeft = imgHeight;

    // Adiciona a primeira página
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Adiciona páginas extras se necessário
    while (pageHeightLeft > pdfHeight) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      pageHeightLeft -= pdfHeight;
    }

    pdf.save('dashboard.pdf');
  };

  // Função para exportar PDF via backend
  const exportDashboardBackendPdf = async () => {
    setIsPdfLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://apinps.catolicasc.org.br/api'}/report/dashboard-pdf`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ questionarioId: Number(selectedFormId) }),
      });
      if (!response.ok) {
        alert('Erro ao gerar PDF no backend');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao gerar PDF: ' + error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  // Função para exportar Excel via backend
  const exportDashboardExcel = async () => {
    setIsExcelLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://apinps.catolicasc.org.br/api'}/report/dashboard-excel`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ questionarioId: Number(selectedFormId) }),
      });
      if (!response.ok) {
        alert('Erro ao gerar Excel no backend');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'dashboard.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Erro ao gerar Excel: ' + error);
    } finally {
      setIsExcelLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <Box p={3}>
        <Box mb={4} maxW="1200px" w="100%">
          <HStack spacing={4} alignItems="flex-end">
            <Box flex={1}>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.600">
                Selecione o formulário para visualizar o dashboard:
              </Text>
              <Select
                placeholder="Escolha um formulário"
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                width="100%"
                bg="white"
                isDisabled={formsLoading}
              >
                {forms?.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.descricao || form.titulo}
                  </option>
                ))}
              </Select>
            </Box>
            {selectedFormId && (
              <HStack spacing={2}>
                <Button
                  colorScheme="blue"
                  onClick={exportDashboardBackendPdf}
                  size="lg"
                  isLoading={isPdfLoading}
                  loadingText="Gerando PDF..."
                  disabled={isPdfLoading || isExcelLoading}
                >
                  Exportar PDF
                </Button>
                <Button
                  colorScheme="orange"
                  onClick={exportDashboardExcel}
                  size="lg"
                  isLoading={isExcelLoading}
                  loadingText="Gerando Excel..."
                  disabled={isPdfLoading || isExcelLoading}
                >
                  Exportar Excel
                </Button>
              </HStack>
            )}
          </HStack>
        </Box>
        
        <Heading mb={4}>Dashboard</Heading>
        
        {dashboardError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            Erro ao carregar dados do dashboard. Verifique se o formulário possui respostas.
          </Alert>
        )}
        
        {selectedFormId ? (
          dashboardLoading ? (
            <Box textAlign="center" py={20}>
              <Spinner size="xl" />
              <Text mt={4}>Carregando dados do dashboard...</Text>
            </Box>
          ) : (
            <Box id="dashboard-content" style={{ maxWidth: '1200px', width: '100%', maxHeight: '1800px', overflow: 'auto', background: '#fff' }}>
              {/* Tendência de Respostas */}
              <Box mb={6} bg="white" borderRadius="lg" boxShadow="md" p={6}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>Tendência de Respostas por Dia</Text>
                <Line 
                  data={tendenciaRespostas} 
                  options={{ 
                    plugins: { 
                      legend: { display: false }, 
                      datalabels: {
                        anchor: 'end',
                        align: 'top',
                        offset: -8,
                        color: '#222',
                        font: { weight: 'bold', size: 14 },
                        formatter: (value: number) => value,
                        display: true,
                        clamp: true,
                        clip: false,
                      }
                    } 
                  }} 
                  height={80} 
                  plugins={[ChartDataLabels]}
                />
              </Box>
              {/* NPS Geral e Detalhamento */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6} alignItems="center">
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4} textAlign="center" minW="220px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Text fontWeight="bold" fontSize="md">NPS Geral</Text>
                    <Badge ml={2} colorScheme="gray">{data.totalRespostas} TOTAL</Badge>
                  </Box>
                  <Box position="relative" w="160px" h="160px" mx="auto" mb={2} display="flex" alignItems="center" justifyContent="center">
                    <Doughnut data={npsGaugeData} options={npsGaugeOptions} />
                    <Box position="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -60%)' }} textAlign="center">
                      <Text fontSize="3xl" fontWeight="bold">{data.npsGeral}</Text>
                      <Text fontSize="md" color="gray.500" mt={-1}>NPS</Text>
                    </Box>
                  </Box>
                </Box>
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Text fontWeight="bold" fontSize="md">Detalhamento | NPS Geral</Text>
                    <Badge ml={2} colorScheme="gray">{data.totalRespostas} TOTAL</Badge>
                  </Box>
                  <Box display="flex" alignItems="center" w="100%" h="36px" borderRadius="md" overflow="hidden" boxShadow="sm">
                    {npsDetalhamentoStacked.map((item, idx) => (
                      <Box key={item.tipo} flex={item.percentual} bg={item.color} display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="sm" fontWeight="bold" color="white">{item.percentual}%</Text>
                      </Box>
                    ))}
                  </Box>
                  <Box display="flex" gap={2} mt={2}>
                    <Badge style={{ background: '#ffb300', color: '#fff' }}>Passivo</Badge>
                    <Badge style={{ background: '#43a047', color: '#fff' }}>Promotor</Badge>
                    <Badge style={{ background: '#e53935', color: '#fff' }}>Detrator</Badge>
                  </Box>
                </Box>
              </SimpleGrid>
              {/* Satisfação Geral */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6} alignItems="center">
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4} textAlign="center" minW="220px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Text fontWeight="bold" fontSize="md">Satisfação</Text>
                    <Badge ml={2} colorScheme="gray">{data.totalRespostas}</Badge>
                  </Box>
                  <Box position="relative" w="160px" h="160px" mx="auto" mb={2} display="flex" alignItems="center" justifyContent="center">
                    <Doughnut data={satisfacaoGaugeData} options={satisfacaoGaugeOptions} />
                    <Box position="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -60%)' }} textAlign="center">
                      <Text fontSize="3xl" fontWeight="bold">{satisfacaoPercent}%</Text>
                      <Text fontSize="md" color="gray.500" mt={-1}>Satisfação</Text>
                    </Box>
                  </Box>
                </Box>
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Text fontWeight="bold" fontSize="md">Detalhamento | Satisfação</Text>
                    <Badge ml={2}>{data.totalRespostas}</Badge>
                  </Box>
                  <Box display="flex" gap={2} mb={1}>
                    {satisfacaoDetalhamentoStacked.map((item, idx) => (
                      <Badge key={item.tipo} style={{ background: item.color, color: '#fff' }}>{item.tipo}</Badge>
                    ))}
                  </Box>
                  <Box display="flex" alignItems="center" w="100%" h="36px" borderRadius="md" overflow="hidden" boxShadow="sm">
                    {satisfacaoDetalhamentoStacked.map((item, idx) => (
                      <Box key={item.tipo} flex={item.percentual} bg={item.color} display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="sm" fontWeight="bold" color="white">{item.percentual}%</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </SimpleGrid>
              {/* Satisfação com curso (gauge) */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6} alignItems="center">
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4} textAlign="center" minW="220px" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                    <Text fontWeight="bold" fontSize="md">Satisfação com curso</Text>
                    <Badge ml={2} colorScheme="gray">{data.totalRespostas}</Badge>
                  </Box>
                  <Box position="relative" w="160px" h="160px" mx="auto" mb={2} display="flex" alignItems="center" justifyContent="center">
                    <Doughnut data={satisfacaoCursoGaugeData} options={satisfacaoCursoGaugeOptions} />
                    <Box position="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -60%)' }} textAlign="center">
                      <Text fontSize="3xl" fontWeight="bold">{satisfacaoCursoPercent}%</Text>
                      <Text fontSize="md" color="gray.500" mt={-1}>Satisfação com curso</Text>
                    </Box>
                  </Box>
                </Box>
                <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Text fontWeight="bold" fontSize="md">Detalhamento | Satisfação com curso</Text>
                    <Badge ml={2}>{data.totalRespostas}</Badge>
                  </Box>
                  <Box display="flex" gap={2} mb={1}>
                    {satisfacaoCursoDetalhamentoStacked.map((item, idx) => (
                      <Badge key={item.tipo} style={{ background: item.color, color: '#fff' }}>{item.tipo}</Badge>
                    ))}
                  </Box>
                  <Box display="flex" alignItems="center" w="100%" h="36px" borderRadius="md" overflow="hidden" boxShadow="sm">
                    {satisfacaoCursoDetalhamentoStacked.map((item, idx) => (
                      <Box key={item.tipo} flex={item.percentual} bg={item.color} display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="sm" fontWeight="bold" color="white">{item.percentual}%</Text>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </SimpleGrid>
              {/* Satisfação por Curso */}
              <Box mb={6} bg="white" borderRadius="lg" boxShadow="md" p={6}>
                <Text fontSize="lg" fontWeight="bold" mb={2}>Satisfação com o curso por curso</Text>
                <Bar 
                  data={cursosBarData} 
                  options={{ 
                    plugins: { 
                      legend: { display: false }, 
                      datalabels: {
                        anchor: 'end',
                        align: 'right',
                        color: (ctx: any) => {
                          const value = ctx.dataset.data[ctx.dataIndex];
                          return value === 100 ? '#fff' : '#1976d2';
                        },
                        font: { weight: 'bold', size: 14 },
                        formatter: (value: number) => value === 100 ? '100%' : value.toFixed(1) + '%',
                        clamp: true,
                        clip: false,
                        offset: -4
                      }
                    }, 
                    indexAxis: 'y' 
                  }} 
                  height={200} 
                  plugins={[ChartDataLabels]}
                />
              </Box>
              {/* Matrizes de Médias */}
              {matrizMedias.length > 0 && matrizMedias.map((matriz: any) => {
                const barData = {
                  labels: matriz.linhas.map((l: any) => l.afirmacao),
                  datasets: [
                    {
                      label: 'Média',
                      data: matriz.linhas.map((l: any) => l.media),
                      backgroundColor: '#1976d2',
                      categoryPercentage: 0.4,
                      barPercentage: 0.6,
                    },
                  ],
                };
                return (
                  <Box key={matriz.questaoId} mb={6} bg="white" borderRadius="lg" boxShadow="md" p={6}>
                    <Text fontSize="lg" fontWeight="bold" mb={2}>{matriz.questaoTexto}</Text>
                    <Bar
                      data={barData}
                      options={{
                        indexAxis: 'y',
                        scales: { x: { min: 0, max: 5 } },
                        plugins: {
                          legend: { display: false },
                          datalabels: {
                            anchor: 'end',
                            align: 'right',
                            color: '#1976d2',
                            font: { weight: 'bold', size: 14 },
                            formatter: (value: number) => value.toFixed(1),
                          }
                        }
                      }}
                      height={matriz.linhas.length * 24}
                    />
                  </Box>
                );
              })}
              {/* Análise de Sentimento Q19 */}
              {data.analiseSentimentoPorCategoriaQ19 && (
                <Box mb={8} bg="white" borderRadius="lg" boxShadow="md" p={6}>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>Análise de sentimento - {data.enunciadoQ19 || 'Pergunta 19'}</Text>
                  <BubbleSegmentedChart data={data.analiseSentimentoPorCategoriaQ19} />
                </Box>
              )}
              {/* Análise de Sentimento Q23 */}
              {data.analiseSentimentoPorCategoriaQ23 && (
                <Box mb={8} bg="white" borderRadius="lg" boxShadow="md" p={6}>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>Análise de sentimento - {data.enunciadoQ23 || 'Pergunta 23'}</Text>
                  <BubbleSegmentedChart data={data.analiseSentimentoPorCategoriaQ23} />
                </Box>
              )}
              {/* Comentários Q19 */}
              {data.comentariosQ19 && data.comentariosQ19.length > 0 && (
                <Box mb={6} bg="white" borderRadius="lg" boxShadow="md" p={6}>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>Comentários - {data.enunciadoQ19 || 'Pergunta 19'}</Text>
                  <List spacing={3}>
                    {data.comentariosQ19.map((c: any, i: number) => (
                      <React.Fragment key={i}>
                        <ListItem display="flex" flexDirection="column" alignItems="flex-start">
                          <Box mb={1} display="flex" alignItems="center" gap={2}>
                            <Badge colorScheme={c.tipo === 'Promotor' ? 'green' : c.tipo === 'Detrator' ? 'red' : 'yellow'}>
                              {c.nota.toFixed(1)}
                            </Badge>
                            <Text as="span" fontWeight="bold">{c.tipo}</Text>
                            <Text as="span">- {c.curso}</Text>
                          </Box>
                          <Text>{c.texto}</Text>
                        </ListItem>
                        {i < data.comentariosQ19.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
              {/* Comentários Q23 */}
              {data.comentariosQ23 && data.comentariosQ23.length > 0 && (
                <Box mb={6} bg="white" borderRadius="lg" boxShadow="md" p={6}>
                  <Text fontSize="lg" fontWeight="bold" mb={2}>Comentários - {data.enunciadoQ23 || 'Pergunta 23'}</Text>
                  <List spacing={3}>
                    {data.comentariosQ23.map((c: any, i: number) => (
                      <React.Fragment key={i}>
                        <ListItem display="flex" flexDirection="column" alignItems="flex-start">
                          <Box mb={1} display="flex" alignItems="center" gap={2}>
                            <Badge colorScheme={c.tipo === 'Promotor' ? 'green' : c.tipo === 'Detrator' ? 'red' : 'yellow'}>
                              {c.nota.toFixed(1)}
                            </Badge>
                            <Text as="span" fontWeight="bold">{c.tipo}</Text>
                            <Text as="span">- {c.curso}</Text>
                          </Box>
                          <Text>{c.texto}</Text>
                        </ListItem>
                        {i < data.comentariosQ23.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )
        ) : (
          <Box textAlign="center" py={20}>
            <Text fontSize="lg" color="gray.500">
              Selecione um formulário acima para visualizar o dashboard
            </Text>
          </Box>
        )}
      </Box>
    </>
  );
} 