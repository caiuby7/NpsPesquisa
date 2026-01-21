import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Icon,
  HStack,
  Badge,
  Divider,
  Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  FiBarChart2,
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiLayers,
  FiGitMerge,
  FiPieChart,
  FiTable
} from 'react-icons/fi';
import MainLayout from '../../components/layout/main-layout.component';
import { useAuth } from '../../contexts/AuthContext';
import { participanteService, ParticipanteDadosRelatorioDto } from '../../services/participante.service';

interface RelatorioCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  badgeColor?: string;
  category: string;
}

const RelatoriosPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dadosParticipante, setDadosParticipante] = useState<ParticipanteDadosRelatorioDto | null>(null);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  useEffect(() => {
    const carregarDadosParticipante = async () => {
      try {
        // Apenas carregar dados se não for administrador ou CPA
        if (user?.perfil && ['aluno', 'professor', 'coordenador'].includes(user.perfil.toLowerCase())) {
          const dados = await participanteService.obterMeusDados();
          setDadosParticipante(dados);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do participante:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDadosParticipante();
  }, [user]);

  const relatorios: RelatorioCard[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Geral',
      description: 'Visão geral com métricas e indicadores principais do sistema',
      icon: FiBarChart2,
      href: '/dashboard',
      badge: 'GERAL',
      badgeColor: 'blue',
      category: 'Geral'
    },
    {
      id: 'acompanhamento',
      title: 'Acompanhamento de Respondentes',
      description: 'Acompanhe o status das respostas, taxas de participação e métricas de engajamento',
      icon: FiUsers,
      href: '/relatorios/acompanhamento',
      badge: 'ACOMP',
      badgeColor: 'green',
      category: 'Acompanhamento'
    },
    {
      id: 'avaliacao-graficos',
      title: 'Relatórios de Avaliação - Gráficos',
      description: 'Visualize os resultados das avaliações através de gráficos interativos com análise de sentimentos',
      icon: FiPieChart,
      href: '/relatorios/avaliacao/graficos',
      badge: 'GRAF',
      badgeColor: 'purple',
      category: 'Avaliação'
    },
    {
      id: 'avaliacao-tabelas',
      title: 'Relatórios de Avaliação - Tabelas',
      description: 'Visualize os resultados das avaliações em formato tabular detalhado',
      icon: FiTable,
      href: '/relatorios/avaliacao/tabelas',
      badge: 'TAB',
      badgeColor: 'orange',
      category: 'Avaliação'
    },
    {
      id: 'avaliacao-por-curso',
      title: 'Avaliação por Curso',
      description: 'Relatórios agrupados por curso com análise detalhada dos resultados',
      icon: FiLayers,
      href: '/relatorios/avaliacao/tabelas/por-curso',
      badge: 'CURSO',
      badgeColor: 'teal',
      category: 'Agrupados'
    },
    {
      id: 'avaliacao-por-curso-turno',
      title: 'Avaliação por Curso e Turno',
      description: 'Relatórios agrupados por curso e turno para análise segmentada',
      icon: FiLayers,
      href: '/relatorios/avaliacao/tabelas/por-curso-turno',
      badge: 'CURSO-TURNO',
      badgeColor: 'cyan',
      category: 'Agrupados'
    },
    {
      id: 'avaliacao-por-turma',
      title: 'Avaliação por Turma',
      description: 'Relatórios específicos por turma com resultados detalhados',
      icon: FiFileText,
      href: '/relatorios/avaliacao/tabelas/por-turma',
      badge: 'TURMA',
      badgeColor: 'pink',
      category: 'Agrupados'
    },
    {
      id: 'avaliacao-por-disciplina',
      title: 'Avaliação por Disciplina',
      description: 'Relatórios agrupados por disciplina com análise de desempenho',
      icon: FiFileText,
      href: '/relatorios/avaliacao/tabelas/por-disciplina',
      badge: 'DISC',
      badgeColor: 'yellow',
      category: 'Agrupados'
    },
    {
      id: 'comparativo',
      title: 'Relatório Comparativo',
      description: 'Compare resultados entre diferentes tipos de participantes (Alunos, Professores, Coordenadores)',
      icon: FiGitMerge,
      href: '/relatorios/comparativo',
      badge: 'COMP',
      badgeColor: 'red',
      category: 'Comparativo'
    },
    {
      id: 'comparativo-por-curso',
      title: 'Comparativo por Curso',
      description: 'Compare resultados agrupados por curso entre diferentes tipos de participantes',
      icon: FiGitMerge,
      href: '/relatorios/comparativo/por-curso',
      badge: 'COMP-CURSO',
      badgeColor: 'red',
      category: 'Comparativo'
    },
    {
      id: 'comparativo-por-curso-turno',
      title: 'Comparativo por Curso/Turno',
      description: 'Compare resultados agrupados por curso e turno entre diferentes tipos de participantes',
      icon: FiGitMerge,
      href: '/relatorios/comparativo/por-curso-turno',
      badge: 'COMP-CURSO-TURNO',
      badgeColor: 'red',
      category: 'Comparativo'
    },
    {
      id: 'comparativo-por-turma',
      title: 'Comparativo por Turma',
      description: 'Compare resultados agrupados por turma entre diferentes tipos de participantes',
      icon: FiGitMerge,
      href: '/relatorios/comparativo/por-turma',
      badge: 'COMP-TURMA',
      badgeColor: 'red',
      category: 'Comparativo'
    },
    {
      id: 'comparativo-por-disciplina',
      title: 'Comparativo por Disciplina',
      description: 'Compare resultados agrupados por disciplina entre diferentes tipos de participantes',
      icon: FiGitMerge,
      href: '/relatorios/comparativo/por-disciplina',
      badge: 'COMP-DISC',
      badgeColor: 'red',
      category: 'Comparativo'
    }
  ];

  // Filtrar relatórios baseado no perfil do usuário
  const relatoriosFiltrados = React.useMemo(() => {
    if (!user?.perfil) return relatorios;
    
    const perfil = user.perfil.toLowerCase();
    
    // Administrador e CPA veem todos os relatórios
    if (perfil === 'administrador' || perfil === 'cpa') {
      return relatorios;
    }

    // Aluno, Professor e Coordenador veem apenas relatórios relevantes
    const relatoriosPermitidos = relatorios.filter(rel => {
      // Relatórios gerais sempre disponíveis
      if (rel.category === 'Acompanhamento' || rel.category === 'Avaliação') {
        return true;
      }

      // Relatórios agrupados e comparativos só aparecem se o participante tiver dados
      if (rel.category === 'Agrupados' || rel.category === 'Comparativo') {
        if (!dadosParticipante) return false;
        
        // Verificar se o relatório é relevante para o participante
        if (rel.id.includes('por-curso') && dadosParticipante.cursoIds.length === 0) {
          return false;
        }
        if (rel.id.includes('por-turma') && dadosParticipante.turmaIds.length === 0) {
          return false;
        }
        if (rel.id.includes('por-disciplina') && dadosParticipante.disciplinaIds.length === 0) {
          return false;
        }
        
        return true;
      }

      return false;
    });

    return relatoriosPermitidos;
  }, [user, dadosParticipante, relatorios]);

  const categorias = ['Acompanhamento', 'Avaliação', 'Agrupados', 'Comparativo'];

  const relatoriosPorCategoria = categorias.map(categoria => ({
    categoria,
    relatorios: relatoriosFiltrados.filter(r => r.category === categoria)
  }));

  if (loading) {
    return (
      <MainLayout>
        <Container maxW="7xl" py={8}>
          <VStack spacing={8} align="center" justify="center" minH="400px">
            <Spinner size="xl" />
            <Text color="gray.600">Carregando relatórios disponíveis...</Text>
          </VStack>
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
              📊 Central de Relatórios
            </Heading>
            <Text color="gray.600" fontSize="lg">
              {user?.perfil && ['aluno', 'professor', 'coordenador'].includes(user.perfil.toLowerCase())
                ? 'Relatórios disponíveis para você'
                : 'Acesse todos os relatórios e análises disponíveis no sistema'}
            </Text>
          </Box>

          {/* Relatórios por Categoria */}
          {relatoriosPorCategoria.map(({ categoria, relatorios: rels }) => (
            rels.length > 0 && (
              <Box key={categoria}>
                <Heading size="md" color="gray.700" mb={4}>
                  {categoria}
                </Heading>
                <Divider mb={4} />
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {rels.map((relatorio) => (
                    <Card
                      key={relatorio.id}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      cursor="pointer"
                      transition="all 0.2s"
                      _hover={{
                        transform: 'translateY(-4px)',
                        boxShadow: 'lg',
                        bg: hoverBg
                      }}
                      onClick={() => navigate(relatorio.href)}
                    >
                      <CardHeader>
                        <HStack justify="space-between" align="start">
                          <HStack spacing={3}>
                            <Icon
                              as={relatorio.icon}
                              w={6}
                              h={6}
                              color="blue.500"
                            />
                            <VStack align="start" spacing={0}>
                              <Heading size="sm">{relatorio.title}</Heading>
                            </VStack>
                          </HStack>
                          {relatorio.badge && (
                            <Badge colorScheme={relatorio.badgeColor}>
                              {relatorio.badge}
                            </Badge>
                          )}
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <Text color="gray.600" fontSize="sm">
                          {relatorio.description}
                        </Text>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </Box>
            )
          ))}
        </VStack>
      </Container>
    </MainLayout>
  );
};

export default RelatoriosPage;
