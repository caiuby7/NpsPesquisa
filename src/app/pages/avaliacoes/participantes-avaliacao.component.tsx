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
  periodosLetivos: any[];
  cursos: any[];
  turmas: any[];
  disciplinas: any[];
  tiposDisciplina: any[];
  professores: any[];
  coordenadores: any[];
  niveisEnsino: string[];
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
  nivelEnsino?: string;
  selecionado?: boolean;
}

interface FiltrosFormData {
  periodoLetivoId: string;
  cursoId: string;
  turmaId: string;
  disciplinaId: string;
  tipoDisciplina: string;
  tipoParticipante: string;
  tipoProfessor: string;
  nivelEnsino: string;
}

const AdicionarParticipantesAvaliacaoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: avaliacao, isLoading: loadingAvaliacao } = useGetAvaliacaoById(Number(id));
  const [filtros, setFiltros] = useState<FiltrosParticipantes>({
    periodosLetivos: [],
    cursos: [],
    turmas: [],
    disciplinas: [],
    tiposDisciplina: [],
    professores: [],
    coordenadores: [],
    niveisEnsino: []
  });
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [participantesSelecionados, setParticipantesSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingParticipantes, setLoadingParticipantes] = useState(false);
  const [filtrosForm, setFiltrosForm] = useState<FiltrosFormData>({
    periodoLetivoId: '',
    cursoId: '',
    turmaId: '',
    disciplinaId: '',
    tipoDisciplina: '',
    tipoParticipante: 'Professor', // Default para Professor
    tipoProfessor: '', // Default vazio para mostrar todos os tipos
    nivelEnsino: ''
  });

  const toast = useToast();
  const navigate = useNavigate();

  const carregarFiltros = useCallback(async () => {
    try {
      setLoading(true);
      
      // Validar se a avaliação tem instituição definida
      if (!avaliacao?.instituicaoId) {
        toast({
          title: 'Erro',
          description: 'Avaliação não possui instituição definida',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Carregar dados filtrados por instituição
      const [periodosRes, cursosRes, turmasRes, disciplinasRes, tiposDisciplinaRes, niveisEnsinoRes] = await Promise.all([
        api.get('/PeriodoLetivo'),
        api.get(`/Curso?instituicaoId=${avaliacao.instituicaoId}`),
        api.get(`/Turma?instituicaoId=${avaliacao.instituicaoId}`),
        api.get(`/Disciplina?instituicaoId=${avaliacao.instituicaoId}&tipoItemAvaliado=${avaliacao.tipoItemAvaliado || ''}`),
        api.get(`/Disciplina/tipos?instituicaoId=${avaliacao.instituicaoId}&tipoItemAvaliado=${avaliacao.tipoItemAvaliado || ''}`),
        api.get('/Aluno/niveis-ensino')
      ]);

      setFiltros({
        periodosLetivos: periodosRes.data || [],
        cursos: cursosRes.data || [],
        turmas: turmasRes.data || [],
        disciplinas: disciplinasRes.data || [],
        tiposDisciplina: tiposDisciplinaRes.data || [],
        professores: [], // Será carregado dinamicamente na busca
        coordenadores: [], // Será carregado dinamicamente na busca
        niveisEnsino: niveisEnsinoRes.data || []
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
  }, [toast, avaliacao?.instituicaoId]);

  useEffect(() => {
    if (avaliacao) {
      carregarFiltros();
    }
  }, [avaliacao, carregarFiltros]);

  const getFiltrosVisiveis = () => {
    // Instituição não é mais um filtro - sempre usa a da avaliação
    const filtrosVisiveis: string[] = ['periodoLetivo', 'curso'];
    
    // Adicionar filtros específicos baseados no tipo de participante
    switch (filtrosForm.tipoParticipante) {
      case 'Professor':
        // Professores podem ter turma, disciplina e tipo de professor
        filtrosVisiveis.push('tipoDisciplina', 'disciplina', 'turma', 'tipoProfessor');
        break;
      case 'Aluno':
        // Alunos sempre têm turma e podem ter disciplina específica e nível de ensino
        filtrosVisiveis.push('tipoDisciplina', 'disciplina', 'turma', 'nivelEnsino');
        break;
      case 'Coordenador':
        // Coordenadores não precisam de turma ou disciplina
        break;
    }
    
    return filtrosVisiveis;
  };

  const getDisciplinasFiltradas = () => {
    if (!filtrosForm.tipoDisciplina) {
      return filtros.disciplinas;
    }
    
    return filtros.disciplinas.filter((disciplina: any) => 
      disciplina.tipoDisciplina === filtrosForm.tipoDisciplina
    );
  };

  const handleTipoDisciplinaChange = (tipoDisciplina: string) => {
    setFiltrosForm(prev => ({
      ...prev,
      tipoDisciplina,
      disciplinaId: '' // Limpar disciplina selecionada quando mudar o tipo
    }));
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

      // Validar se a avaliação tem instituição definida
      if (!avaliacao?.instituicaoId) {
        toast({
          title: 'Erro',
          description: 'Avaliação não possui instituição definida',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Determinar o endpoint baseado no tipo de participante selecionado
      let endpoint = '';
      
      switch (filtrosForm.tipoParticipante) {
        case 'Professor':
          endpoint = '/Professor/com-filtros';
          break;
        case 'Aluno':
          endpoint = '/Aluno/com-filtros';
          break;
        case 'Coordenador':
          endpoint = '/Coordenador/com-filtros';
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
      
      // Construir parâmetros de query
      const params = new URLSearchParams();
      params.append('instituicaoId', avaliacao.instituicaoId.toString());
      
      if (filtrosForm.periodoLetivoId) {
        params.append('periodoLetivoId', filtrosForm.periodoLetivoId);
      }
      
      if (filtrosForm.cursoId) {
        params.append('cursoId', filtrosForm.cursoId);
      }
      
      if (filtrosForm.turmaId) {
        params.append('turmaId', filtrosForm.turmaId);
      }
      
      if (filtrosForm.disciplinaId) {
        params.append('disciplinaId', filtrosForm.disciplinaId);
      }
      
      if (filtrosForm.tipoDisciplina) {
        params.append('tipoDisciplina', filtrosForm.tipoDisciplina);
      }
      
      // Adicionar filtro de tipo de professor apenas para o endpoint de professores
      if (filtrosForm.tipoParticipante === 'Professor' && filtrosForm.tipoProfessor) {
        params.append('tipoProfessor', filtrosForm.tipoProfessor);
      }
      
      // Adicionar filtro de nível de ensino apenas para o endpoint de alunos
      if (filtrosForm.tipoParticipante === 'Aluno' && filtrosForm.nivelEnsino) {
        params.append('nivelEnsino', filtrosForm.nivelEnsino);
      }
      
      // Fazer a requisição para buscar os dados com filtros
      const response = await api.get(`${endpoint}?${params.toString()}`);
      const dados = response.data || [];
      
      // Transformar dados em formato de participantes
      const participantesFormatados: Participante[] = dados.map((item: any) => ({
        id: item.id || item.alunoId,
        nome: item.nome || 'Sem nome',
        email: item.email || '',
        tipo: filtrosForm.tipoParticipante,
        curso: item.curso?.nome || '',
        turma: item.turma?.nome || '',
        disciplina: item.disciplina?.nome || '',
        instituicao: item.instituicao?.nome || avaliacao.nomeInstituicao || '',
        periodoLetivo: item.periodoLetivo?.nome || '',
        nivelEnsino: item.nivelEnsino || '',
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

      // Preparar dados completos dos participantes selecionados
      const participantesParaAdicionar = participantes
        .filter(p => participantesSelecionados.includes(p.id))
        .map(participante => ({
          id: participante.id,
          nome: participante.nome,
          email: participante.email,
          tipo: participante.tipo,
          curso: participante.curso,
          turma: participante.turma,
          disciplina: participante.disciplina,
          instituicao: participante.instituicao,
          periodoLetivo: participante.periodoLetivo
        }));

      console.log('📤 Dados dos participantes para adicionar:', participantesParaAdicionar);

      // Adicionar participantes à avaliação com dados completos
      await api.post(`/Questionario/${id}/participantes-completos`, participantesParaAdicionar);

      toast({
        title: 'Sucesso',
        description: `${participantesSelecionados.length} participantes adicionados à avaliação`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Voltar para a lista de participantes da avaliação
      navigate(`/avaliacoes/${id}/participantes`);
    } catch (error: any) {
      console.error('❌ Erro ao adicionar participantes:', error);
      
      let errorMessage = 'Erro ao adicionar participantes';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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

              {/* Tipo Disciplina - Visível para Professor e Aluno */}
              {filtrosVisiveis.includes('tipoDisciplina') && (
                <FormControl>
                  <FormLabel>Tipo Disciplina</FormLabel>
                  <Select
                    value={filtrosForm.tipoDisciplina}
                    onChange={(e) => handleTipoDisciplinaChange(e.target.value)}
                    placeholder="Selecione o tipo"
                  >
                    <option value="">Todos os tipos</option>
                    {filtros.tiposDisciplina.map((tipo) => (
                      <option key={tipo.tipo} value={tipo.tipo}>
                        {tipo.tipo}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Disciplina - Visível para Professor e Aluno */}
              {filtrosVisiveis.includes('disciplina') && (
                <FormControl>
                  <FormLabel>Disciplina</FormLabel>
                  <Select
                    value={filtrosForm.disciplinaId}
                    onChange={(e) => setFiltrosForm({...filtrosForm, disciplinaId: e.target.value})}
                    placeholder="Selecione a disciplina"
                  >
                    {getDisciplinasFiltradas().map((disciplina) => (
                      <option key={disciplina.id} value={disciplina.id}>
                        {disciplina.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Tipo de Professor - Visível apenas para Professor */}
              {filtrosVisiveis.includes('tipoProfessor') && (
                <FormControl>
                  <FormLabel>Tipo de Professor</FormLabel>
                  <Select
                    value={filtrosForm.tipoProfessor}
                    onChange={(e) => setFiltrosForm({...filtrosForm, tipoProfessor: e.target.value})}
                    placeholder="Selecione o tipo"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Titular">Titular</option>
                    <option value="Coordenador">Coordenador</option>
                  </Select>
                </FormControl>
              )}

              {/* Nível de Ensino - Visível apenas para Aluno */}
              {filtrosVisiveis.includes('nivelEnsino') && (
                <FormControl>
                  <FormLabel>Nível de Ensino</FormLabel>
                  <Select
                    value={filtrosForm.nivelEnsino}
                    onChange={(e) => setFiltrosForm({...filtrosForm, nivelEnsino: e.target.value})}
                    placeholder="Selecione o nível"
                  >
                    <option value="">Todos os níveis</option>
                    <option value="GraduacaoPresencial">Graduação Presencial</option>
                    <option value="GraduacaoEAD">Graduação à Distância (EAD)</option>
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
                      {filtrosForm.tipoParticipante === 'Aluno' && <Th>Nível Ensino</Th>}
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
                        {filtrosForm.tipoParticipante === 'Aluno' && (
                          <Td>
                            {participante.nivelEnsino ? (
                              <Badge colorScheme="purple" variant="subtle">
                                {participante.nivelEnsino === 'GraduacaoPresencial' ? 'Graduação Presencial' : 
                                 participante.nivelEnsino === 'GraduacaoEAD' ? 'Graduação à Distância (EAD)' : 
                                 participante.nivelEnsino}
                              </Badge>
                            ) : (
                              <Text fontSize="sm" color="gray.400">-</Text>
                            )}
                          </Td>
                        )}
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
