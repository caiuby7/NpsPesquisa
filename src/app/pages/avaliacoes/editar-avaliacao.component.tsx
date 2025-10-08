import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  Select,
  useToast,
  VStack,
  HStack,
  Flex,
  Heading,
  Spinner,
  Center,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Divider,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  SimpleGrid,
  Checkbox,
  Stack,
  Textarea
} from '@chakra-ui/react';
import { 
  Send,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Building,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ITEM_AVALIADO_TYPES, TipoQuestionarioEnum } from '../../services/form/form.services.types';
import { useNavigate } from 'react-router-dom';
import { useGetAvaliacaoById } from '../../services/avaliacao/avaliacao.service.hooks';
import { useGetTiposTurma } from '../../services/lookup/lookup.service.hooks';
import { api } from '../../services/api';
// NOTA: RegrasFiltroQuestionario removido - Regras em cascata agora são GLOBAIS
// Acesse: /configuracoes/regras-cascata para gerenciar
import { useGetNiveisEnsino, useGetTiposMatricula, useGetTiposProfessor } from '../../services/lookup/lookup.service.hooks';

interface EditarAvaliacaoComponentProps {
  id: string;
}

interface AvaliacaoFormData {
  titulo: string;
  descricao: string;
  tipo: string;
  tipoItemAvaliado: string;
  nomeItemEspecifico: string;
  dataInicio: string;
  dataFim: string;
  permitirComentarios: boolean;
  permitirSalvarAndamento: boolean;
  textoBoasVindas: string;
  templateEmailConvite: string;
  templateEmailLembrete: string;
  lembrarACadaXDias: number;
  enviarLembreteAutomatico: boolean;
  enviarLembreteParaTodos: boolean;
  ativo: boolean;
  questoes: number[];
  // Instituição obrigatória
  instituicaoId: string;
  periodoLetivoId: string;
  cursoId: string;
  turmaId: string;
  disciplinaId: string;
  tipoParticipante: string;
  nivelEnsino: string;
  tiposTurma: string[];
  tiposMatricula: string[];
  tiposProfessor: string[];
  // ===== NOVOS CAMPOS PARA REGRAS DE FILTRO =====
  tiposDisciplinaPermitidos: string;
  tiposProfessorPermitidos: string;
  tiposTurmaPermitidos: string;
  statusMatriculaPermitidos: string;
  niveisEnsinoPermitidos: string;
  aplicarFiltroContextoAluno: boolean;
  contextoAlunoPermitido: string;
  incluirTurmasGerenciadas: boolean;
  incluirTurmasNaoGerenciadas: boolean;
}

interface FiltrosFormData {
  instituicaoId: string;
  periodoLetivoId: string;
  cursoId: string;
  turmaId: string;
  disciplinaId: string;
}

interface Filtros {
  instituicoes: Array<{ id: number; nome: string }>;
  periodosLetivos: Array<{ id: number; nome: string }>;
  cursos: Array<{ id: number; nome: string }>;
  turmas: Array<{ id: number; nome: string }>;
  disciplinas: Array<{ id: number; nome: string }>;
}

interface QuestaoQuestionario {
  id: number;
  questaoId: number;
  questionarioId: number;
  ordem: number;
  questao: {
    id: number;
    texto: string;
    tipo: string;
    ordem: number;
    obrigatorio: boolean;
    isCondicional: boolean;
    opcoes: Array<{
      id: number;
      questaoId: number;
      texto: string;
      valor: string;
      ordem: number;
      peso: number;
      ehColuna: boolean;
      ativaCondicao: boolean;
      questaoCondicionalId: number | null;
    }>;
  };
}

const EditarAvaliacaoComponent: React.FC<EditarAvaliacaoComponentProps> = ({ id }) => {
  console.log('🎯 EditarAvaliacaoComponent renderizado - ID:', id);
  
  const { data: avaliacao, isLoading, error } = useGetAvaliacaoById(Number(id));
  const { data: niveisEnsino = [] } = useGetNiveisEnsino();
  const { data: tiposMatricula = [] } = useGetTiposMatricula();
  const { data: tiposProfessor = [] } = useGetTiposProfessor();
  const { data: tiposTurma = [] } = useGetTiposTurma();
  const navigate = useNavigate();
  const toast = useToast();

  console.log('EditarAvaliacaoComponent - Debug:', {
    id,
    isLoading,
    error,
    avaliacao: avaliacao ? 'dados carregados' : 'sem dados'
  });

  const [avaliacaoForm, setAvaliacaoForm] = useState<AvaliacaoFormData>({
    titulo: '',
    descricao: '',
    tipo: TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL,
    tipoItemAvaliado: '',
    nomeItemEspecifico: '',
    dataInicio: '',
    dataFim: '',
    permitirComentarios: true,
    permitirSalvarAndamento: false,
    textoBoasVindas: '',
    templateEmailConvite: '',
    templateEmailLembrete: '',
    lembrarACadaXDias: 0,
    enviarLembreteAutomatico: false,
    enviarLembreteParaTodos: false,
    ativo: true,
    questoes: [],
    instituicaoId: '',
    periodoLetivoId: '',
    cursoId: '',
    turmaId: '',
    disciplinaId: '',
    tipoParticipante: '',
    nivelEnsino: '',
    tiposTurma: [],
    tiposMatricula: [],
    tiposProfessor: [],
    // ===== NOVOS CAMPOS PARA REGRAS DE FILTRO =====
    tiposDisciplinaPermitidos: '',
    tiposProfessorPermitidos: '',
    tiposTurmaPermitidos: '',
    statusMatriculaPermitidos: '',
    niveisEnsinoPermitidos: '',
    aplicarFiltroContextoAluno: false,
    contextoAlunoPermitido: '',
    incluirTurmasGerenciadas: true,
    incluirTurmasNaoGerenciadas: true
  });

  const [filtrosForm, setFiltrosForm] = useState<FiltrosFormData>({
    instituicaoId: '',
    periodoLetivoId: '',
    cursoId: '',
    turmaId: '',
    disciplinaId: ''
  });

  const [filtros, setFiltros] = useState<Filtros>({
    instituicoes: [],
    periodosLetivos: [],
    cursos: [],
    turmas: [],
    disciplinas: []
  });

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [editorConvite, setEditorConvite] = useState(EditorState.createEmpty());
  const [editorLembrete, setEditorLembrete] = useState(EditorState.createEmpty());
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [questoes, setQuestoes] = useState<QuestaoQuestionario[]>([]);
  const [isLoadingQuestoes, setIsLoadingQuestoes] = useState(false);

  // Carregar dados da avaliação
  useEffect(() => {
    if (avaliacao) {
      setAvaliacaoForm({
        titulo: avaliacao.titulo || '',
        descricao: avaliacao.descricao || '',
        tipo: avaliacao.tipo || TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL,
        tipoItemAvaliado: avaliacao.tipoItemAvaliado || '',
        nomeItemEspecifico: avaliacao.nomeItemEspecifico || '',
        dataInicio: avaliacao.dataInicio ? new Date(avaliacao.dataInicio).toISOString().slice(0, 16) : '',
        dataFim: avaliacao.dataFim ? new Date(avaliacao.dataFim).toISOString().slice(0, 16) : '',
        permitirComentarios: avaliacao.permitirComentarios ?? true,
        permitirSalvarAndamento: avaliacao.permitirSalvarAndamento ?? false,
        textoBoasVindas: avaliacao.textoBoasVindas || '',
        templateEmailConvite: avaliacao.templateEmailConvite || '',
        templateEmailLembrete: avaliacao.templateEmailLembrete || '',
        lembrarACadaXDias: avaliacao.lembrarACadaXDias || 0,
        enviarLembreteAutomatico: avaliacao.enviarLembreteAutomatico ?? false,
        enviarLembreteParaTodos: avaliacao.enviarLembreteParaTodos ?? false,
        ativo: avaliacao.ativo ?? true,
        questoes: [],
        instituicaoId: avaliacao.instituicaoId?.toString() || '',
        periodoLetivoId: '',
        cursoId: '',
        turmaId: '',
        disciplinaId: '',
        tipoParticipante: avaliacao.tipoParticipante || '',
        nivelEnsino: avaliacao.nivelEnsinoId?.toString() || '',
        tiposTurma: avaliacao.tiposTurma || [],
        tiposMatricula: avaliacao.tiposMatricula || [],
        tiposProfessor: avaliacao.tiposProfessor || [],
        // ===== NOVOS CAMPOS PARA REGRAS DE FILTRO =====
        tiposDisciplinaPermitidos: avaliacao.tiposDisciplinaPermitidos || '',
        tiposProfessorPermitidos: avaliacao.tiposProfessorPermitidos || '',
        tiposTurmaPermitidos: avaliacao.tiposTurmaPermitidos || '',
        statusMatriculaPermitidos: avaliacao.statusMatriculaPermitidos || '',
        niveisEnsinoPermitidos: avaliacao.niveisEnsinoPermitidos || '',
        aplicarFiltroContextoAluno: avaliacao.aplicarFiltroContextoAluno ?? false,
        contextoAlunoPermitido: avaliacao.contextoAlunoPermitido || '',
        incluirTurmasGerenciadas: avaliacao.incluirTurmasGerenciadas ?? true,
        incluirTurmasNaoGerenciadas: avaliacao.incluirTurmasNaoGerenciadas ?? true
      });

      // Configurar editores de texto rico
      if (avaliacao.descricao) {
        const contentState = EditorState.createWithContent(
          EditorState.createEmpty().getCurrentContent()
        );
        setEditorState(contentState);
      }
      
      if (avaliacao.templateEmailConvite) {
        const conviteState = EditorState.createWithContent(
          EditorState.createEmpty().getCurrentContent()
        );
        setEditorConvite(conviteState);
      }
      
      if (avaliacao.templateEmailLembrete) {
        const lembreteState = EditorState.createWithContent(
          EditorState.createEmpty().getCurrentContent()
        );
        setEditorLembrete(lembreteState);
      }
    }
  }, [avaliacao]);

  // Carregar filtros sempre, independente do ID
  useEffect(() => {
    console.log('🚀 useEffect executado - ID:', id);
    carregarFiltros();
    if (id) {
      carregarQuestoes();
    }
  }, [id]);

  // Carregar filtros imediatamente quando o componente monta
  useEffect(() => {
    console.log('🎯 Componente montado - carregando filtros imediatamente');
    carregarFiltros();
  }, []);

  // Debug: monitorar mudanças nos filtros
  useEffect(() => {
    console.log('🏢 Filtros atualizados:', filtros);
  }, [filtros]);

  const carregarFiltros = async () => {
    console.log('🔍 Carregando filtros...');
    try {
      // Testar apenas instituições primeiro
      console.log('🌐 Fazendo chamada para /Instituicao...');
      const instituicoesRes = await api.get('/Instituicao');
      console.log('✅ Resposta da API Instituicao:', instituicoesRes.data);

      // Se funcionou, carregar os outros
      const [periodosRes, cursosRes, turmasRes, disciplinasRes] = await Promise.all([
        api.get('/PeriodoLetivo'),
        api.get('/Curso'),
        api.get('/Turma'),
        api.get('/Disciplina')
      ]);

      console.log('📊 Todos os dados recebidos:', {
        instituicoes: instituicoesRes.data,
        periodos: periodosRes.data,
        cursos: cursosRes.data,
        turmas: turmasRes.data,
        disciplinas: disciplinasRes.data
      });

      setFiltros({
        instituicoes: instituicoesRes.data,
        periodosLetivos: periodosRes.data,
        cursos: cursosRes.data,
        turmas: turmasRes.data,
        disciplinas: disciplinasRes.data
      });
      
      console.log('✅ Filtros atualizados com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao carregar filtros:', error);
      console.error('❌ Detalhes do erro:', error.response?.data || error.message);
    }
  };

  const carregarQuestoes = async () => {
    setIsLoadingQuestoes(true);
    try {
      const response = await api.get(`/QuestaoQuestionario/questionario/${id}`);
      setQuestoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar questões:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar questões da avaliação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingQuestoes(false);
    }
  };

  const handleInputChange = (field: keyof AvaliacaoFormData, value: string | boolean | number) => {
    setAvaliacaoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para limpar HTML desnecessário
  const cleanHtml = (html: string) => {
    if (!html) return '';
    
    // Remover <p></p> vazias
    let cleaned = html.replace(/<p><\/p>/g, '');
    
    // Remover <p>&nbsp;</p>
    cleaned = cleaned.replace(/<p>&nbsp;<\/p>/g, '');
    
    // Remover <p> </p> (com espaços)
    cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');
    
    // Se ficou vazio, retornar string vazia
    if (cleaned.trim() === '' || cleaned.trim() === '<p></p>') {
      return '';
    }
    
    return cleaned;
  };

  const handleEditorChange = (editorState: EditorState) => {
    setEditorState(editorState);
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const cleanedHtml = cleanHtml(htmlContent);
    setAvaliacaoForm(prev => ({
      ...prev,
      descricao: cleanedHtml
    }));
  };

  const handleEditorConviteChange = (editorState: EditorState) => {
    setEditorConvite(editorState);
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const cleanedHtml = cleanHtml(htmlContent);
    setAvaliacaoForm(prev => ({
      ...prev,
      templateEmailConvite: cleanedHtml
    }));
  };

  const handleEditorLembreteChange = (editorState: EditorState) => {
    setEditorLembrete(editorState);
    const htmlContent = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    const cleanedHtml = cleanHtml(htmlContent);
    setAvaliacaoForm(prev => ({
      ...prev,
      templateEmailLembrete: cleanedHtml
    }));
  };

  const handleUpdateAvaliacao = async () => {
    if (!avaliacaoForm.titulo || !avaliacaoForm.dataInicio || !avaliacaoForm.dataFim || !avaliacaoForm.instituicaoId) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoadingUpdate(true);
    try {
      const avaliacaoData = {
        titulo: avaliacaoForm.titulo,
        descricao: draftToHtml(convertToRaw(editorState.getCurrentContent())),
        tipo: avaliacaoForm.tipo,
        tipoItemAvaliado: avaliacaoForm.tipoItemAvaliado,
        nomeItemEspecifico: avaliacaoForm.nomeItemEspecifico,
        dataInicio: new Date(avaliacaoForm.dataInicio).toISOString(),
        dataFim: new Date(avaliacaoForm.dataFim).toISOString(),
        permitirComentarios: avaliacaoForm.permitirComentarios,
        permitirSalvarAndamento: avaliacaoForm.permitirSalvarAndamento,
        textoBoasVindas: avaliacaoForm.textoBoasVindas,
        templateEmailConvite: draftToHtml(convertToRaw(editorConvite.getCurrentContent())),
        templateEmailLembrete: draftToHtml(convertToRaw(editorLembrete.getCurrentContent())),
        lembrarACadaXDias: avaliacaoForm.lembrarACadaXDias,
        enviarLembreteAutomatico: avaliacaoForm.enviarLembreteAutomatico,
        enviarLembreteParaTodos: avaliacaoForm.enviarLembreteParaTodos,
        ativo: avaliacaoForm.ativo,
        instituicaoId: Number(avaliacaoForm.instituicaoId),
        tipoParticipante: avaliacaoForm.tipoParticipante,
        nivelEnsinoId: avaliacaoForm.nivelEnsino ? parseInt(avaliacaoForm.nivelEnsino) : null,
        tiposTurmaNomes: avaliacaoForm.tiposTurma,
        tiposMatriculaIds: avaliacaoForm.tiposMatricula,
        tiposProfessorIds: avaliacaoForm.tiposProfessor,
        // Questões são obrigatórias para o endpoint /com-questoes
        questoes: questoes.map((q, index) => ({
          questaoId: q.questao.id,
          ordem: q.ordem || index + 1
        })),
        // ===== NOVOS CAMPOS PARA REGRAS DE FILTRO =====
        tiposDisciplinaPermitidos: avaliacaoForm.tiposDisciplinaPermitidos,
        tiposProfessorPermitidos: avaliacaoForm.tiposProfessorPermitidos,
        tiposTurmaPermitidos: avaliacaoForm.tiposTurmaPermitidos,
        statusMatriculaPermitidos: avaliacaoForm.statusMatriculaPermitidos,
        aplicarFiltroContextoAluno: avaliacaoForm.aplicarFiltroContextoAluno,
        contextoAlunoPermitido: avaliacaoForm.contextoAlunoPermitido,
        incluirTurmasGerenciadas: avaliacaoForm.incluirTurmasGerenciadas,
        incluirTurmasNaoGerenciadas: avaliacaoForm.incluirTurmasNaoGerenciadas
      };

      await api.put(`/Questionario/${id}/com-questoes`, avaliacaoData);

      toast({
        title: 'Sucesso',
        description: 'Avaliação atualizada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/avaliacoes');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar avaliação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setIsLoadingUpdate(false);
    }
  };

  const moverQuestao = async (questaoId: number, direcao: 'up' | 'down') => {
    try {
      const questaoIndex = questoes.findIndex(q => q.id === questaoId);
      if (questaoIndex === -1) return;

      const novaOrdem = direcao === 'up' ? questaoIndex - 1 : questaoIndex + 1;
      if (novaOrdem < 0 || novaOrdem >= questoes.length) return;

      // Trocar as ordens
      const questoesAtualizadas = [...questoes];
      const questaoAtual = questoesAtualizadas[questaoIndex];
      const questaoAdjacente = questoesAtualizadas[novaOrdem];

      // Atualizar no backend
      await api.put(`/QuestaoQuestionario/${questaoAtual.id}`, { ordem: novaOrdem + 1 });
      await api.put(`/QuestaoQuestionario/${questaoAdjacente.id}`, { ordem: questaoIndex + 1 });

      // Atualizar estado local
      questoesAtualizadas[questaoIndex] = { ...questaoAtual, ordem: novaOrdem + 1 };
      questoesAtualizadas[novaOrdem] = { ...questaoAdjacente, ordem: questaoIndex + 1 };

      setQuestoes(questoesAtualizadas.sort((a, b) => a.ordem - b.ordem));

      toast({
        title: 'Sucesso',
        description: 'Questão reordenada com sucesso!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao reordenar questão:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao reordenar questão',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const removerQuestao = async (questaoId: number) => {
    try {
      await api.delete(`/QuestaoQuestionario/${questaoId}`);
      setQuestoes(questoes.filter(q => q.id !== questaoId));

      toast({
        title: 'Sucesso',
        description: 'Questão removida com sucesso!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao remover questão:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao remover questão',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Center minH="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Carregando avaliação...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Text color="red.500">Erro ao carregar avaliação: {error.message}</Text>
      </Box>
    );
  }

  if (!avaliacao) {
    return (
      <Box p={6}>
        <Text>Avaliação não encontrada</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/avaliacoes')}
            >
              Voltar
            </Button>
            <Divider orientation="vertical" height="30px" />
            <Heading size="lg" color="blue.600">
              Editar Avaliação
            </Heading>
          </HStack>
        </Flex>

        {/* Formulário da Avaliação */}
        <Card>
          <CardHeader>
            <HStack>
              <FileText color="#3182CE" />
              <Text fontWeight="bold">Informações da Avaliação</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Informações Básicas */}
              <Box>
                <Text fontWeight="bold" mb={4}>Informações Básicas</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Título da Avaliação</FormLabel>
                    <Input
                      value={avaliacaoForm.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="Digite o título da avaliação"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Tipo de Item Avaliado</FormLabel>
                    <Select
                      value={avaliacaoForm.tipoItemAvaliado}
                      onChange={(e) => handleInputChange('tipoItemAvaliado', e.target.value)}
                      placeholder="Selecione o tipo"
                    >
                      {ITEM_AVALIADO_TYPES.map((tipo) => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Nível de Ensino</FormLabel>
                    <Select
                      value={avaliacaoForm.nivelEnsino}
                      onChange={(e) => handleInputChange('nivelEnsino', e.target.value)}
                      placeholder="Selecione o nível de ensino"
                    >
                      {niveisEnsino.map((nivel) => (
                        <option key={nivel.id} value={nivel.id.toString()}>
                          {nivel.nome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Tipos de Turma</FormLabel>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2} mb={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            const todosTipos = tiposTurma.map(tipo => tipo.nome);
                            setAvaliacaoForm(prev => ({
                              ...prev,
                              tiposTurma: todosTipos
                            }));
                          }}
                        >
                          Selecionar Todos
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setAvaliacaoForm(prev => ({
                              ...prev,
                              tiposTurma: []
                            }));
                          }}
                        >
                          Deselecionar Todos
                        </Button>
                      </HStack>
                      <VStack align="start" spacing={2} maxH="200px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md" p={3} w="full">
                        {tiposTurma.map((tipo) => (
                          <Checkbox
                            key={tipo.id}
                            isChecked={avaliacaoForm.tiposTurma.includes(tipo.nome)}
                            onChange={() => {
                              const novosTipos = avaliacaoForm.tiposTurma.includes(tipo.nome)
                                ? avaliacaoForm.tiposTurma.filter(t => t !== tipo.nome)
                                : [...avaliacaoForm.tiposTurma, tipo.nome];
                              setAvaliacaoForm(prev => ({
                                ...prev,
                                tiposTurma: novosTipos
                              }));
                            }}
                            size="sm"
                          >
                            {tipo.nome}
                          </Checkbox>
                        ))}
                      </VStack>
                    </VStack>
                    <FormHelperText>
                      Selecione os tipos de turma que serão incluídos nesta avaliação
                    </FormHelperText>
                    {avaliacaoForm.tiposTurma.length === 0 && (
                      <FormErrorMessage>Selecione pelo menos um tipo de turma</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Instituição</FormLabel>
                    <Select
                      value={avaliacaoForm.instituicaoId}
                      onChange={(e) => handleInputChange('instituicaoId', e.target.value)}
                      placeholder="Selecione a instituição"
                    >
                      {filtros.instituicoes.map((instituicao) => (
                        <option key={instituicao.id} value={instituicao.id}>
                          {instituicao.nome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Configurações Específicas */}
              <Box>
                <Text fontWeight="bold" mb={4}>Configurações Específicas</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isInvalid={Boolean(avaliacaoForm.nomeItemEspecifico && avaliacaoForm.nomeItemEspecifico.length > 2000)}>
                    <FormLabel>Nome Específico do Item</FormLabel>
                    <Input
                      value={avaliacaoForm.nomeItemEspecifico}
                      onChange={(e) => handleInputChange('nomeItemEspecifico', e.target.value)}
                      placeholder="Digite o nome específico"
                      maxLength={2000}
                    />
                    <FormHelperText>
                      {avaliacaoForm.nomeItemEspecifico ? `${avaliacaoForm.nomeItemEspecifico.length}/2000 caracteres` : 'Máximo 2000 caracteres'}
                    </FormHelperText>
                    {avaliacaoForm.nomeItemEspecifico && avaliacaoForm.nomeItemEspecifico.length > 2000 && (
                      <FormErrorMessage>O nome específico deve ter no máximo 2000 caracteres</FormErrorMessage>
                    )}
                  </FormControl>
                </SimpleGrid>
              </Box>

              {/* Filtros Opcionais */}
              <Box>
                <Text fontWeight="bold" mb={4} color="gray.600">Filtros Opcionais</Text>
                <Text fontSize="sm" color="gray.500" mb={4}>
                  Configure filtros adicionais para limitar o escopo da avaliação
                </Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Tipos de Matrícula</FormLabel>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2} mb={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            const todosTipos = tiposMatricula.map(tipo => tipo.id.toString());
                            setAvaliacaoForm(prev => ({
                              ...prev,
                              tiposMatricula: todosTipos
                            }));
                          }}
                        >
                          Selecionar Todos
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setAvaliacaoForm(prev => ({
                              ...prev,
                              tiposMatricula: []
                            }));
                          }}
                        >
                          Deselecionar Todos
                        </Button>
                      </HStack>
                      <VStack align="start" spacing={2} maxH="200px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md" p={3} w="full">
                        {tiposMatricula.map((tipo) => (
                          <Checkbox
                            key={tipo.id}
                            isChecked={avaliacaoForm.tiposMatricula.includes(tipo.id.toString())}
                            onChange={() => {
                              const tipoId = tipo.id.toString();
                              const novosTipos = avaliacaoForm.tiposMatricula.includes(tipoId)
                                ? avaliacaoForm.tiposMatricula.filter(t => t !== tipoId)
                                : [...avaliacaoForm.tiposMatricula, tipoId];
                              setAvaliacaoForm(prev => ({
                                ...prev,
                                tiposMatricula: novosTipos
                              }));
                            }}
                            size="sm"
                          >
                            {tipo.nome}
                          </Checkbox>
                        ))}
                      </VStack>
                    </VStack>
                    <FormHelperText>
                      Deixe vazio para incluir todos os tipos de matrícula
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tipos de Professor (Opcional)</FormLabel>
                    <VStack align="start" spacing={2}>
                      <HStack spacing={2} mb={2}>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            const todosTipos = tiposProfessor.map(tipo => tipo.id.toString());
                            setAvaliacaoForm(prev => ({
                              ...prev,
                              tiposProfessor: todosTipos
                            }));
                          }}
                        >
                          Selecionar Todos
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => {
                            setAvaliacaoForm(prev => ({
                              ...prev,
                              tiposProfessor: []
                            }));
                          }}
                        >
                          Deselecionar Todos
                        </Button>
                      </HStack>
                      <VStack align="start" spacing={2} maxH="200px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md" p={3} w="full">
                        {tiposProfessor.map((tipo) => (
                          <Checkbox
                            key={tipo.id}
                            isChecked={avaliacaoForm.tiposProfessor.includes(tipo.id.toString())}
                            onChange={() => {
                              const tipoId = tipo.id.toString();
                              const novosTipos = avaliacaoForm.tiposProfessor.includes(tipoId)
                                ? avaliacaoForm.tiposProfessor.filter(t => t !== tipoId)
                                : [...avaliacaoForm.tiposProfessor, tipoId];
                              setAvaliacaoForm(prev => ({
                                ...prev,
                                tiposProfessor: novosTipos
                              }));
                            }}
                            size="sm"
                          >
                            {tipo.nome}
                          </Checkbox>
                        ))}
                      </VStack>
                    </VStack>
                    <FormHelperText>
                      Deixe vazio para incluir todos os tipos de professor
                    </FormHelperText>
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Período */}
              <Box>
                <Text fontWeight="bold" mb={4}>Período de Realização</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl isRequired>
                    <FormLabel>Data e Hora de Início</FormLabel>
                    <Input
                      type="datetime-local"
                      value={avaliacaoForm.dataInicio}
                      onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Data e Hora de Fim</FormLabel>
                    <Input
                      type="datetime-local"
                      value={avaliacaoForm.dataFim}
                      onChange={(e) => handleInputChange('dataFim', e.target.value)}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Configurações */}
              <Box>
                <Text fontWeight="bold" mb={4}>Configurações</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Permitir comentários nas questões</FormLabel>
                    <Checkbox
                      isChecked={avaliacaoForm.permitirComentarios}
                      onChange={(e) => handleInputChange('permitirComentarios', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Permitir salvar andamento</FormLabel>
                    <Checkbox
                      isChecked={avaliacaoForm.permitirSalvarAndamento}
                      onChange={(e) => handleInputChange('permitirSalvarAndamento', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Lembrar a cada X dias</FormLabel>
                    <Input
                      type="number"
                      value={avaliacaoForm.lembrarACadaXDias}
                      onChange={(e) => handleInputChange('lembrarACadaXDias', Number(e.target.value))}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Enviar lembrete automático</FormLabel>
                    <Checkbox
                      isChecked={avaliacaoForm.enviarLembreteAutomatico}
                      onChange={(e) => handleInputChange('enviarLembreteAutomatico', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Enviar lembrete para todos</FormLabel>
                    <Checkbox
                      isChecked={avaliacaoForm.enviarLembreteParaTodos}
                      onChange={(e) => handleInputChange('enviarLembreteParaTodos', e.target.checked)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Ativar avaliação</FormLabel>
                    <Checkbox
                      isChecked={avaliacaoForm.ativo}
                      onChange={(e) => handleInputChange('ativo', e.target.checked)}
                    />
                  </FormControl>
                </SimpleGrid>
              </Box>

              <Divider />

              {/* Textos e Templates */}
              <Box>
                <Text fontWeight="bold" mb={4}>Textos e Templates</Text>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Descrição da Avaliação</FormLabel>
                    <Box border="1px" borderColor="gray.200" borderRadius="md" p={2}>
                      <Editor
                        editorState={editorState}
                        onEditorStateChange={handleEditorChange}
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarClassName="toolbar-class"
                      />
                    </Box>
                    <FormHelperText>
                      Use o editor para criar a descrição da avaliação
                    </FormHelperText>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Texto de boas-vindas (aceita HTML)</FormLabel>
                    <Input
                      value={avaliacaoForm.textoBoasVindas}
                      onChange={(e) => handleInputChange('textoBoasVindas', e.target.value)}
                      placeholder="Digite o texto de boas-vindas"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Template de e-mail de convite (aceita HTML)</FormLabel>
                    <Box border="1px" borderColor="gray.200" borderRadius="md" p={2}>
                      <Editor
                        editorState={editorConvite}
                        onEditorStateChange={handleEditorConviteChange}
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarClassName="toolbar-class"
                      />
                    </Box>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Template de e-mail de lembrete (aceita HTML)</FormLabel>
                    <Box border="1px" borderColor="gray.200" borderRadius="md" p={2}>
                      <Editor
                        editorState={editorLembrete}
                        onEditorStateChange={handleEditorLembreteChange}
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarClassName="toolbar-class"
                      />
                    </Box>
                  </FormControl>
                </VStack>
              </Box>

              {/* NOTA: Regras de Filtro removidas daqui */}
              {/* Regras em cascata agora são GLOBAIS e gerenciadas em /configuracoes/regras-cascata */}
              {/* Use apenas os filtros específicos acima (Tipos permitidos, Contexto aluno, etc) */}
              
              {avaliacaoForm.tipo === TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL && (
                <Box>
                  <Divider mb={6} />
                  <Text fontWeight="bold" mb={4} color="gray.600" fontSize="sm">
                    ℹ️ Regras em cascata agora são configuradas globalmente
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Para gerenciar regras de combinação entre tipos, acesse:{' '}
                    <Text as="span" fontWeight="bold" color="blue.500">/configuracoes/regras-cascata</Text>
                  </Text>
                  {/* Componente removido:
                  <RegrasFiltroQuestionario
                    regras={{...}}
                    onRegrasChange={(novasRegras) => {
                      setAvaliacaoForm(prev => ({
                        ...prev,
                        tiposDisciplinaPermitidos: JSON.stringify(novasRegras.tiposDisciplinaPermitidos),
                        tiposProfessorPermitidos: JSON.stringify(novasRegras.tiposProfessorPermitidos),
                        tiposTurmaPermitidos: JSON.stringify(novasRegras.tiposTurmaPermitidos),
                        statusMatriculaPermitidos: JSON.stringify(novasRegras.statusMatriculaPermitidos),
                        niveisEnsinoPermitidos: JSON.stringify(novasRegras.niveisEnsinoPermitidos),
                        aplicarFiltroContextoAluno: novasRegras.aplicarFiltroContextoAluno,
                        contextoAlunoPermitido: novasRegras.contextoAlunoPermitido,
                        incluirTurmasGerenciadas: novasRegras.incluirTurmasGerenciadas,
                        incluirTurmasNaoGerenciadas: novasRegras.incluirTurmasNaoGerenciadas
                      }));
                    }}
                  /> */}
                </Box>
              )}
            </VStack>
          </CardBody>
          <CardFooter>
            <HStack spacing={4}>
              <Button
                colorScheme="blue"
                leftIcon={<Send />}
                onClick={handleUpdateAvaliacao}
                isLoading={isLoadingUpdate}
                loadingText="Atualizando..."
              >
                Atualizar Avaliação
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/avaliacoes')}
              >
                Cancelar
              </Button>
            </HStack>
          </CardFooter>
        </Card>

        {/* Seção de Questões */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <FileText color="#3182CE" />
                <Text fontWeight="bold">Questões da Avaliação</Text>
                <Text fontSize="sm" color="gray.500">
                  ({questoes.length} questões)
                </Text>
              </HStack>
              <Button
                leftIcon={<Plus />}
                colorScheme="blue"
                size="sm"
                onClick={() => navigate('/create-question')}
              >
                Adicionar Questão
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            {isLoadingQuestoes ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Spinner size="lg" color="blue.500" />
                  <Text>Carregando questões...</Text>
                </VStack>
              </Center>
            ) : questoes.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Text color="gray.500">Nenhuma questão adicionada ainda</Text>
                  <Button
                    leftIcon={<Plus />}
                    colorScheme="blue"
                    onClick={() => navigate('/create-question')}
                  >
                    Criar Primeira Questão
                  </Button>
                </VStack>
              </Center>
            ) : (
              <VStack spacing={4} align="stretch">
                {questoes.map((questaoQuestionario, index) => (
                  <Box
                    key={questaoQuestionario.id}
                    p={4}
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <HStack justify="space-between" align="start">
                      <HStack spacing={4} align="start" flex={1}>
                        <VStack spacing={1}>
                          <Button
                            size="sm"
                            variant="ghost"
                            isDisabled={index === 0}
                            onClick={() => moverQuestao(questaoQuestionario.id, 'up')}
                          >
                            <ChevronUp size={16} />
                          </Button>
                          <Text fontSize="xs" color="gray.500">
                            {questaoQuestionario.ordem}
                          </Text>
                          <Button
                            size="sm"
                            variant="ghost"
                            isDisabled={index === questoes.length - 1}
                            onClick={() => moverQuestao(questaoQuestionario.id, 'down')}
                          >
                            <ChevronDown size={16} />
                          </Button>
                        </VStack>
                        
                        <VStack align="start" spacing={2} flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {questaoQuestionario.questao.texto}
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="gray.500">
                              Tipo: {questaoQuestionario.questao.tipo}
                            </Text>
                            {questaoQuestionario.questao.obrigatorio && (
                              <Text fontSize="xs" color="red.500" fontWeight="medium">
                                Obrigatória
                              </Text>
                            )}
                            {questaoQuestionario.questao.isCondicional && (
                              <Text fontSize="xs" color="purple.500" fontWeight="medium">
                                Condicional
                              </Text>
                            )}
                          </HStack>
                          {questaoQuestionario.questao.opcoes.length > 0 && (
                            <Text fontSize="xs" color="gray.500">
                              {questaoQuestionario.questao.opcoes.length} opções
                            </Text>
                          )}
                        </VStack>
                      </HStack>

                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<Edit size={14} />}
                          onClick={() => navigate(`/create-question/${questaoQuestionario.questao.id}`)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          leftIcon={<Trash2 size={14} />}
                          onClick={() => removerQuestao(questaoQuestionario.id)}
                        >
                          Remover
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default EditarAvaliacaoComponent;
