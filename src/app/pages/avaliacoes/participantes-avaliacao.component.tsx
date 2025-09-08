import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Text,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  VStack,
  HStack,
  Flex,
  Heading,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  SimpleGrid,
  Checkbox,
  Card,
  CardBody,
  CardHeader
} from '@chakra-ui/react';
import { 
  Search,
  UserPlus,
  Users,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../../components/layout/main-layout.component';
import { useGetAvaliacaoById } from '../../services/avaliacao/avaliacao.service.hooks';
import { api } from '../../services/api';

interface FiltrosParticipantes {
  instituicoes: any[];
  periodosLetivos: any[];
  cursos: any[];
  turmas: any[];
  disciplinas: any[];
  professores: any[];
  coordenadores: any[];
}

interface Participante {
  id: number;
  nome: string;
  email?: string;
  tipo: string;
  curso?: string;
  turma?: string;
  disciplina?: string;
  instituicao?: string;
  periodoLetivo?: string;
  selecionado?: boolean;
}

interface FiltrosFormData {
  instituicaoId: string;
  periodoLetivoId: string;
  cursoId: string;
  turmaId: string;
  disciplinaId: string;
  tipoParticipante: string;
}

const AdicionarParticipantesAvaliacaoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: avaliacao, isLoading: loadingAvaliacao } = useGetAvaliacaoById(Number(id));
  const [filtros, setFiltros] = useState<FiltrosParticipantes>({
    instituicoes: [],
    periodosLetivos: [],
    cursos: [],
    turmas: [],
    disciplinas: [],
    professores: [],
    coordenadores: []
  });
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [participantesSelecionados, setParticipantesSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [filtrosForm, setFiltrosForm] = useState<FiltrosFormData>({
    instituicaoId: '',
    periodoLetivoId: '',
    cursoId: '',
    turmaId: '',
    disciplinaId: '',
    tipoParticipante: 'Professor' // Default para Professor
  });

  const toast = useToast();
  const navigate = useNavigate();

  const carregarFiltros = useCallback(async () => {
    try {
      setLoading(true);
      
      const [instituicoesRes, periodosRes, cursosRes, turmasRes, disciplinasRes, professoresRes, coordenadoresRes] = await Promise.all([
        api.get('/Instituicao'),
        api.get('/PeriodoLetivo'),
        api.get('/Curso'),
        api.get('/Turma'),
        api.get('/Disciplina'),
        api.get('/Professor'),
        api.get('/Coordenador')
      ]);

      setFiltros({
        instituicoes: instituicoesRes.data || [],
        periodosLetivos: periodosRes.data || [],
        cursos: cursosRes.data || [],
        turmas: turmasRes.data || [],
        disciplinas: disciplinasRes.data || [],
        professores: professoresRes.data || [],
        coordenadores: coordenadoresRes.data || []
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar filtros',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (avaliacao) {
      carregarFiltros();
    }
  }, [avaliacao, carregarFiltros]);

  const getFiltrosVisiveis = () => {
    // Agora os filtros são baseados no tipo de participante selecionado
    const filtrosVisiveis: string[] = ['instituicao', 'periodoLetivo', 'curso'];
    
    // Adicionar filtros específicos baseados no tipo de participante
    switch (filtrosForm.tipoParticipante) {
      case 'Professor':
        // Professores podem ter turma e disciplina
        filtrosVisiveis.push('turma', 'disciplina');
        break;
      case 'Aluno':
        // Alunos sempre têm turma
        filtrosVisiveis.push('turma');
        break;
      case 'Coordenador':
        // Coordenadores não precisam de turma ou disciplina
        break;
    }
    
    return filtrosVisiveis;
  };

  const pesquisarParticipantes = async () => {
    try {
      setLoadingParticipantes(true);
      
      // Validar se o tipo de participante foi selecionado
      if (!filtrosForm.tipoParticipante) {
        toast({
          title: 'Atenção',
          description: 'Selecione o tipo de participante',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Determinar o endpoint baseado no tipo de participante selecionado
      let endpoint = '';
      let dados: any[] = [];
      
      switch (filtrosForm.tipoParticipante) {
        case 'Professor':
          endpoint = '/Professor';
          break;
        case 'Aluno':
          endpoint = '/Aluno';
          break;
        case 'Coordenador':
          endpoint = '/Coordenador';
          break;
        default:
          toast({
            title: 'Erro',
            description: 'Tipo de participante não suportado',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
      }
      
      // Fazer a requisição para buscar os dados
      let response;
      if (filtrosForm.tipoParticipante === 'Professor' && filtrosForm.periodoLetivoId) {
        // Para professores, usar endpoint específico por período letivo
        response = await api.get(`/Professor/por-periodo-letivo/${filtrosForm.periodoLetivoId}`);
      } else {
        // Para outros tipos, usar endpoint padrão
        response = await api.get(endpoint);
      }
      dados = response.data || [];
      
      // Aplicar filtros locais baseados nos filtros selecionados
      let dadosFiltrados = dados;
      
      if (filtrosForm.instituicaoId) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.instituicao?.id === Number(filtrosForm.instituicaoId) || 
          item.instituicaoId === Number(filtrosForm.instituicaoId)
        );
      }
      
      if (filtrosForm.periodoLetivoId) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.periodoLetivo?.id === Number(filtrosForm.periodoLetivoId) || 
          item.periodoLetivoId === Number(filtrosForm.periodoLetivoId)
        );
      }
      
      if (filtrosForm.cursoId) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.curso?.id === Number(filtrosForm.cursoId) || 
          item.cursoId === Number(filtrosForm.cursoId)
        );
      }
      
      if (filtrosForm.turmaId) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.turma?.id === Number(filtrosForm.turmaId) || 
          item.turmaId === Number(filtrosForm.turmaId)
        );
      }
      
      if (filtrosForm.disciplinaId) {
        dadosFiltrados = dadosFiltrados.filter(item => 
          item.disciplina?.id === Number(filtrosForm.disciplinaId) || 
          item.disciplinaId === Number(filtrosForm.disciplinaId)
        );
      }
      
      // Transformar dados em formato de participantes
      const participantesFormatados: Participante[] = dadosFiltrados.map((item: any) => ({
        id: item.id,
        nome: item.nome || item.titulo || item.descricao || 'Sem nome',
        email: item.email || item.emailContato || '',
        tipo: filtrosForm.tipoParticipante,
        curso: item.curso?.nome || item.curso || '',
        turma: item.turma?.nome || item.turma || '',
        disciplina: item.disciplina?.nome || item.disciplina || '',
        instituicao: item.instituicao?.nome || item.instituicao || '',
        periodoLetivo: item.periodoLetivo?.nome || item.periodoLetivo || '',
        selecionado: false
      }));
      
      setParticipantes(participantesFormatados);
      
      toast({
        title: 'Pesquisa Concluída',
        description: `${participantesFormatados.length} participantes encontrados`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao pesquisar participantes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoadingParticipantes(false);
    }
  };

  const toggleParticipanteSelecionado = (participanteId: number) => {
    setParticipantesSelecionados(prev => {
      if (prev.includes(participanteId)) {
        return prev.filter(id => id !== participanteId);
      } else {
        return [...prev, participanteId];
      }
    });
  };

  const selecionarTodos = () => {
    const todosIds = participantes.map(p => p.id);
    setParticipantesSelecionados(todosIds);
  };

  const deselecionarTodos = () => {
    setParticipantesSelecionados([]);
  };

  const adicionarParticipantes = async () => {
    try {
      if (participantesSelecionados.length === 0) {
        toast({
          title: 'Atenção',
          description: 'Selecione pelo menos um participante',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Adicionar participantes à avaliação
      await api.post(`/Questionario/${id}/participantes`, participantesSelecionados);

      toast({
        title: 'Sucesso',
        description: `${participantesSelecionados.length} participantes adicionados à avaliação`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Voltar para a lista de participantes da avaliação
      navigate(`/avaliacoes/${id}/participantes`);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar participantes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  if (loadingAvaliacao || loading) {
    return (
      <MainLayout>
        <Center minH="100vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  if (!avaliacao) {
    return (
      <MainLayout>
        <Center minH="100vh">
          <Text>Avaliação não encontrada</Text>
        </Center>
      </MainLayout>
    );
  }

  const filtrosVisiveis = getFiltrosVisiveis();

  return (
    <MainLayout>
      <Box p={6} maxW="1200px" mx="auto">
        {/* Header */}
        <Flex align="center" justify="space-between" mb={6}>
          <HStack spacing={3}>
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft />}
              onClick={() => navigate(`/avaliacoes/${id}/participantes`)}
            >
              Voltar
            </Button>
            <Box>
              <Heading size="lg" color="gray.900">Adicionar Participantes</Heading>
              <Text color="gray.600">{avaliacao.titulo}</Text>
            </Box>
          </HStack>
        </Flex>

        {/* Filtros */}
        <Card mb={6}>
          <CardHeader>
            <HStack spacing={2}>
              <Filter size={20} />
              <Heading size="md">Filtros de Pesquisa</Heading>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {/* Tipo de Participante - Sempre visível */}
              <FormControl>
                <FormLabel>Tipo de Participante *</FormLabel>
                <Select
                  value={filtrosForm.tipoParticipante}
                  onChange={(e) => setFiltrosForm({...filtrosForm, tipoParticipante: e.target.value})}
                  placeholder="Selecione o tipo"
                >
                  <option value="Professor">Professor</option>
                  <option value="Aluno">Aluno</option>
                  <option value="Coordenador">Coordenador</option>
                </Select>
              </FormControl>
              {/* Instituição - Sempre visível */}
              <FormControl>
                <FormLabel>Instituição</FormLabel>
                <Select
                  value={filtrosForm.instituicaoId}
                  onChange={(e) => setFiltrosForm({...filtrosForm, instituicaoId: e.target.value})}
                  placeholder="Selecione a instituição"
                >
                  {filtros.instituicoes.map((instituicao) => (
                    <option key={instituicao.id} value={instituicao.id}>
                      {instituicao.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Período Letivo - Sempre visível */}
              <FormControl>
                <FormLabel>Período Letivo</FormLabel>
                <Select
                  value={filtrosForm.periodoLetivoId}
                  onChange={(e) => setFiltrosForm({...filtrosForm, periodoLetivoId: e.target.value})}
                  placeholder="Selecione o período"
                >
                  {filtros.periodosLetivos.map((periodo) => (
                    <option key={periodo.id} value={periodo.id}>
                      {periodo.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Curso - Sempre visível */}
              <FormControl>
                <FormLabel>Curso</FormLabel>
                <Select
                  value={filtrosForm.cursoId}
                  onChange={(e) => setFiltrosForm({...filtrosForm, cursoId: e.target.value})}
                  placeholder="Selecione o curso"
                >
                  {filtros.cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* Turma - Visível para Professor e Aluno */}
              {filtrosVisiveis.includes('turma') && (
                <FormControl>
                  <FormLabel>Turma</FormLabel>
                  <Select
                    value={filtrosForm.turmaId}
                    onChange={(e) => setFiltrosForm({...filtrosForm, turmaId: e.target.value})}
                    placeholder="Selecione a turma"
                  >
                    {filtros.turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Disciplina - Visível apenas para Professor */}
              {filtrosVisiveis.includes('disciplina') && (
                <FormControl>
                  <FormLabel>Disciplina</FormLabel>
                  <Select
                    value={filtrosForm.disciplinaId}
                    onChange={(e) => setFiltrosForm({...filtrosForm, disciplinaId: e.target.value})}
                    placeholder="Selecione a disciplina"
                  >
                    {filtros.disciplinas.map((disciplina) => (
                      <option key={disciplina.id} value={disciplina.id}>
                        {disciplina.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}
            </SimpleGrid>

            <HStack justify="flex-end" mt={4}>
              <Button
                leftIcon={<Search size={16} />}
                colorScheme="blue"
                onClick={pesquisarParticipantes}
                isLoading={loadingParticipantes}
              >
                Pesquisar
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Lista de Participantes */}
        {participantes.length > 0 && (
          <Card>
            <CardHeader>
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <Users size={20} />
                  <Heading size="md">
                    Participantes Encontrados ({participantes.length})
                  </Heading>
                </HStack>
                <HStack spacing={2}>
                  <Button size="sm" onClick={selecionarTodos}>
                    Selecionar Todos
                  </Button>
                  <Button size="sm" onClick={deselecionarTodos}>
                    Deselecionar Todos
                  </Button>
                </HStack>
              </Flex>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th width="50px">Selecionar</Th>
                      <Th>Nome</Th>
                      <Th>Email</Th>
                      <Th>Tipo</Th>
                      <Th>Curso</Th>
                      <Th>Turma</Th>
                      <Th>Instituição</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {participantes.map((participante) => (
                      <Tr key={participante.id}>
                        <Td>
                          <Checkbox
                            isChecked={participantesSelecionados.includes(participante.id)}
                            onChange={() => toggleParticipanteSelecionado(participante.id)}
                          />
                        </Td>
                        <Td>
                          <Text fontWeight="medium">{participante.nome}</Text>
                        </Td>
                        <Td>{participante.email || '-'}</Td>
                        <Td>
                          <Badge colorScheme="blue">{participante.tipo}</Badge>
                        </Td>
                        <Td>{participante.curso || '-'}</Td>
                        <Td>{participante.turma || '-'}</Td>
                        <Td>{participante.instituicao || '-'}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        )}

        {/* Botão de Adicionar */}
        {participantes.length > 0 && (
          <Box mt={6} textAlign="center">
            <Button
              leftIcon={<UserPlus size={20} />}
              colorScheme="green"
              size="lg"
              onClick={adicionarParticipantes}
              isDisabled={participantesSelecionados.length === 0}
            >
              Adicionar {participantesSelecionados.length} Participante(s) à Avaliação
            </Button>
          </Box>
        )}

        {/* Mensagem quando não há participantes */}
        {participantes.length === 0 && !loadingParticipantes && (
          <Center py={12}>
            <VStack spacing={4}>
              <Text color="gray.500">Nenhum participante encontrado</Text>
              <Text fontSize="sm" color="gray.400">
                Use os filtros acima para pesquisar participantes
              </Text>
            </VStack>
          </Center>
        )}
      </Box>
    </MainLayout>
  );
};

export default AdicionarParticipantesAvaliacaoPage;
