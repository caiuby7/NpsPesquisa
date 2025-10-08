import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Input, 
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
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
  IconButton
} from '@chakra-ui/react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import draftToHtml from 'draftjs-to-html';
import { 
  Send,
  Users,
  UserCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../../components/layout/main-layout.component';
import Pagination from '../../components/Pagination/pagination.component';
import { ITEM_AVALIADO_TYPES, TipoQuestionarioEnum, TIPO_TURMA_OPTIONS } from '../../services/form/form.services.types';
import { useGetQuestions } from '../../services/question';
import { useGetNiveisEnsino, useGetTurnos, useGetTiposMatricula, useGetTiposDisciplina, useGetTiposTurma, useGetTiposProfessor } from '../../services/lookup/lookup.service.hooks';
import { api } from '../../services/api';
import FiltrosAvancados from '../../../components/FiltrosAvancados/FiltrosAvancados';
// NOTA: RegrasFiltroQuestionario removido - Regras em cascata agora são GLOBAIS
// Acesse: /configuracoes/regras-cascata para gerenciar
import { ENVIRONMENT } from '../../../config/environment';

interface FiltrosAvaliacao {
  instituicoes: any[];
  periodosLetivos: any[];
  cursos: any[];
  turmas: any[];
  disciplinas: any[];
  professores: any[];
  coordenadores: any[];
}

interface FiltrosAvancadosData {
  // Filtros básicos
  instituicaoId?: number;
  periodoLetivoId?: number;
  cursoId?: number;
  turmaId?: number;
  disciplinaId?: number;
  professorId?: number;
  
  // Filtros avançados
  nivelEnsino?: string[];
  tiposTurma?: string[];
  tiposProfessor?: string[];
  statusMatricula?: string[];
  tiposDisciplina?: string[];
  
  // Filtros de contexto
  contextoAluno?: string;
  incluirTurmasGerenciadas?: boolean;
  incluirTurmasNaoGerenciadas?: boolean;
}

interface Participante {
  id: number;
  nome: string;
  tipo: string;
  email?: string;
  curso?: string;
  turma?: string;
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
  aplicarFiltroContextoAluno: boolean;
  contextoAlunoPermitido: string;
  incluirTurmasGerenciadas: boolean;
  incluirTurmasNaoGerenciadas: boolean;
}

const CriarAvaliacaoPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: niveisEnsino = [] } = useGetNiveisEnsino();
  const { data: turnos = [] } = useGetTurnos();
  const { data: tiposMatricula = [] } = useGetTiposMatricula();
  const { data: tiposDisciplina = [] } = useGetTiposDisciplina();
  const { data: tiposTurma = [] } = useGetTiposTurma();
  const { data: tiposProfessor = [] } = useGetTiposProfessor();
  
  const [filtros, setFiltros] = useState<FiltrosAvaliacao>({
    instituicoes: [],
    periodosLetivos: [],
    cursos: [],
    turmas: [],
    disciplinas: [],
    professores: [],
    coordenadores: []
  });
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQuestionSelection, setShowQuestionSelection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Aumentado de 2 para 5 questões por página
  const { isOpen, onClose } = useDisclosure();
  const [filtrosAvancados, setFiltrosAvancados] = useState<FiltrosAvancadosData>({});
  const [usarFiltrosAvancados, setUsarFiltrosAvancados] = useState(false);

  // Função para validar se a data de fim é válida
  const isDataFimInvalida = (): boolean => {
    if (!formData.dataFim || formData.dataFim === '') return true;
    if (!formData.dataInicio || formData.dataInicio === '') return false;
    return new Date(formData.dataFim) <= new Date(formData.dataInicio);
  };

  // Função para verificar se o formulário é válido
  const isFormularioValido = () => {
    return Boolean(
      formData.titulo && 
      formData.descricao && 
      formData.tipoItemAvaliado && 
      formData.nivelEnsino && 
      formData.dataInicio && 
      formData.dataFim && 
      formData.instituicaoId &&
      formData.tiposTurma.length > 0
    );
  };
  
  // Editores de texto rico
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const [editorConvite, setEditorConvite] = useState(() => EditorState.createEmpty());
  const [editorLembrete, setEditorLembrete] = useState(() => EditorState.createEmpty());
  const [formData, setFormData] = useState<AvaliacaoFormData>({
    titulo: '',
    descricao: '',
    tipo: TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL,
    tipoItemAvaliado: '',
    nomeItemEspecifico: '',
    dataInicio: '',
    dataFim: '',
    permitirComentarios: false,
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
    aplicarFiltroContextoAluno: false,
    contextoAlunoPermitido: 'Ambos',
    incluirTurmasGerenciadas: true,
    incluirTurmasNaoGerenciadas: true
  });
  
  // Estado para controlar quando mostrar validações
  const [showValidation, setShowValidation] = useState(false);

  // Estado para regras de filtro
  const [regrasFiltro, setRegrasFiltro] = useState({
    aplicarFiltroContextoAluno: false,
    contextoAlunoPermitido: 'Ambos',
    tiposProfessorPermitidos: [] as string[],
    tiposDisciplinaPermitidos: [] as string[],
    tiposTurmaPermitidos: [] as string[],
    statusMatriculaPermitidos: [] as string[],
    niveisEnsinoPermitidos: [] as string[],
    incluirTurmasGerenciadas: true,
    incluirTurmasNaoGerenciadas: true
  });

  const API_BASE_URL = ENVIRONMENT.API_URL;
  const toast = useToast();
  const { data: questionsData } = useGetQuestions();

  useEffect(() => {
    carregarFiltros();
  }, []);

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

  // Funções para os editores de texto rico
  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    const cleanedHtml = cleanHtml(html);
    setFormData({...formData, textoBoasVindas: cleanedHtml});
  };

  const handleEditorConviteChange = (state: EditorState) => {
    setEditorConvite(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    const cleanedHtml = cleanHtml(html);
    setFormData({...formData, templateEmailConvite: cleanedHtml});
  };

  const handleEditorLembreteChange = (state: EditorState) => {
    setEditorLembrete(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    const cleanedHtml = cleanHtml(html);
    setFormData({...formData, templateEmailLembrete: cleanedHtml});
  };

  // Função para atualizar regras de filtro e sincronizar com formData
  const handleRegrasFiltroChange = (novasRegras: any) => {
    setRegrasFiltro(novasRegras);
    
    // Sincronizar com formData (converter arrays para JSON strings)
    setFormData(prev => ({
      ...prev,
      tiposDisciplinaPermitidos: JSON.stringify(novasRegras.tiposDisciplinaPermitidos),
      tiposProfessorPermitidos: JSON.stringify(novasRegras.tiposProfessorPermitidos),
      tiposTurmaPermitidos: JSON.stringify(novasRegras.tiposTurmaPermitidos),
      statusMatriculaPermitidos: JSON.stringify(novasRegras.statusMatriculaPermitidos),
      aplicarFiltroContextoAluno: novasRegras.aplicarFiltroContextoAluno,
      contextoAlunoPermitido: novasRegras.contextoAlunoPermitido,
      incluirTurmasGerenciadas: novasRegras.incluirTurmasGerenciadas,
      incluirTurmasNaoGerenciadas: novasRegras.incluirTurmasNaoGerenciadas
    }));
  };

  const carregarFiltros = async () => {
    try {
      setLoading(true);
      
      // Carregar dados básicos para os filtros
      const [instituicoesRes, periodosRes, cursosRes, turmasRes, disciplinasRes, professoresRes, coordenadoresRes] = await Promise.all([
        fetch(`${API_BASE_URL}/Instituicao`),
        fetch(`${API_BASE_URL}/PeriodoLetivo`),
        fetch(`${API_BASE_URL}/Curso`),
        fetch(`${API_BASE_URL}/Turma/combo`),
        fetch(`${API_BASE_URL}/Disciplina/combo`),
        fetch(`${API_BASE_URL}/Professor/combo`),
        fetch(`${API_BASE_URL}/Coordenador`)
      ]);

      const [instituicoes, periodos, cursos, turmas, disciplinas, professores, coordenadores] = await Promise.all([
        instituicoesRes.ok ? instituicoesRes.json() : [],
        periodosRes.ok ? periodosRes.json() : [],
        cursosRes.ok ? cursosRes.json() : [],
        turmasRes.ok ? turmasRes.json() : [],
        disciplinasRes.ok ? disciplinasRes.json() : [],
        professoresRes.ok ? professoresRes.json() : [],
        coordenadoresRes.ok ? coordenadoresRes.json() : []
      ]);

      setFiltros({
        instituicoes,
        periodosLetivos: periodos,
        cursos,
        turmas,
        disciplinas,
        professores,
        coordenadores
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
  };


  const criarAvaliacao = async () => {
    // Ativar validação visual
    setShowValidation(true);
    
    // Validar campos obrigatórios
    if (!formData.titulo || !formData.descricao || !formData.tipoItemAvaliado || !formData.nivelEnsino || !formData.dataInicio || !formData.dataFim || !formData.instituicaoId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios, incluindo nível de ensino, instituição, data e hora de início e fim.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar se data de fim é posterior à data de início
    const dataInicio = new Date(formData.dataInicio);
    const dataFim = new Date(formData.dataFim);
    
    if (dataFim <= dataInicio) {
      toast({
        title: 'Data inválida',
        description: 'A data e hora de fim deve ser posterior à data e hora de início.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar se pelo menos um tipo de turma foi selecionado
    if (formData.tiposTurma.length === 0) {
      toast({
        title: 'Tipos de turma',
        description: 'Selecione pelo menos um tipo de turma para a avaliação.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validar se pelo menos uma questão foi selecionada
    if (formData.questoes.length === 0) {
      toast({
        title: 'Questões obrigatórias',
        description: 'Selecione pelo menos uma questão para a avaliação.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      // Preparar dados no mesmo formato do create-form
      const avaliacaoData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        tipo: formData.tipo,
        permitirComentarios: formData.permitirComentarios,
        permitirSalvarAndamento: formData.permitirSalvarAndamento,
        tipoItemAvaliado: formData.tipoItemAvaliado,
        nomeItemEspecifico: formData.nomeItemEspecifico,
        instituicaoId: parseInt(formData.instituicaoId),
        nivelEnsinoId: formData.nivelEnsino ? parseInt(formData.nivelEnsino) : null,
        textoBoasVindas: formData.textoBoasVindas,
        templateEmailConvite: formData.templateEmailConvite,
        templateEmailLembrete: formData.templateEmailLembrete,
        lembrarACadaXDias: formData.lembrarACadaXDias,
        enviarLembreteAutomatico: formData.enviarLembreteAutomatico,
        enviarLembreteParaTodos: formData.enviarLembreteParaTodos,
        ativo: formData.ativo,
        questoes: formData.questoes.map((questaoId, index) => ({
          questaoId: questaoId,
          ordem: index + 1
        })),
        tiposTurmaNomes: formData.tiposTurma,
        tiposMatriculaIds: formData.tiposMatricula,
        tiposProfessorIds: formData.tiposProfessor
      };

      const response = await api.post('/Questionario/com-questoes', avaliacaoData);

      toast({
        title: 'Avaliação Criada!',
        description: `Avaliação "${formData.titulo}" foi criada com sucesso! Redirecionando...`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirecionar para a listagem de avaliações após 2 segundos
      setTimeout(() => {
        navigate('/avaliacoes');
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao criar avaliação';
      toast({
        title: 'Erro',
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL,
      tipoItemAvaliado: '',
      nomeItemEspecifico: '',
      dataInicio: '',
      dataFim: '',
      permitirComentarios: false,
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
      aplicarFiltroContextoAluno: false,
      contextoAlunoPermitido: 'Ambos',
      incluirTurmasGerenciadas: true,
      incluirTurmasNaoGerenciadas: true
    });
    setParticipantes([]);
  };

  const getFiltrosVisiveis = () => {
    const filtrosVisiveis: string[] = ['instituicao']; // Instituição sempre obrigatória
    
    switch (formData.tipoItemAvaliado) {
      case 'Professor':
      case 'Disciplina':
      case 'TurmaDisciplina':
      case 'Curso':
        filtrosVisiveis.push('periodoLetivo', 'curso');
        if (formData.tipoItemAvaliado === 'TurmaDisciplina') {
          filtrosVisiveis.push('turma');
        }
        break;
        
      case 'Estrutura':
        filtrosVisiveis.push('periodoLetivo');
        break;
        
      case 'Coordenador':
        filtrosVisiveis.push('curso');
        break;
        
      case 'Alunos':
        filtrosVisiveis.push('instituicao', 'periodoLetivo', 'curso', 'turma');
        break;
        
      case 'Turma':
        filtrosVisiveis.push('instituicao', 'periodoLetivo', 'curso', 'turma');
        break;
    }
    
    return filtrosVisiveis;
  };

  // Funções para gerenciar seleção de questões
  const toggleQuestionSelection = (questionId: number) => {
    const isSelected = formData.questoes.includes(questionId);
    const updated = isSelected
      ? formData.questoes.filter((id) => id !== questionId)
      : [...formData.questoes, questionId];
    setFormData({...formData, questoes: updated});
  };

  const onNextStep = () => {
    setShowQuestionSelection(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <Center minH="100vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box p={6} maxW="1200px" mx="auto">
        {/* Header */}
        <Flex align="center" justify="space-between" mb={6}>
          <HStack spacing={3}>
            <Box>
              <Heading size="lg" color="gray.900">Criar Avaliação</Heading>
              <Text color="gray.600">Configure uma nova avaliação institucional</Text>
            </Box>
          </HStack>
          {/* Indicador de Progresso */}
          <HStack spacing={2}>
            <Box
              bg={!showQuestionSelection ? "blue.500" : "gray.300"}
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              1. Configuração
            </Box>
            <Text color="gray.400">→</Text>
            <Box
              bg={showQuestionSelection ? "blue.500" : "gray.300"}
              color="white"
              px={3}
              py={1}
              borderRadius="full"
              fontSize="sm"
              fontWeight="medium"
            >
              2. Questões
            </Box>
          </HStack>
        </Flex>

        {/* Formulário de Avaliação - Só aparece se não estiver na seleção de questões */}
        {!showQuestionSelection && (
          <Card>
            <CardHeader>
              <Heading size="md">Configuração da Avaliação</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Informações Básicas */}
                <Box>
                  <Heading size="sm" mb={4}>Informações Básicas</Heading>
                  <VStack align="stretch" spacing={4}>
                    <FormControl isInvalid={showValidation && !formData.titulo}>
                      <FormLabel>Título da Avaliação *</FormLabel>
                      <Input
                        value={formData.titulo}
                        onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                        placeholder="Digite o título da avaliação"
                      />
                      {showValidation && !formData.titulo && (
                        <FormHelperText color="red.500">Título é obrigatório</FormHelperText>
                      )}
                    </FormControl>

                    <FormControl isInvalid={showValidation && !formData.descricao}>
                      <FormLabel>Descrição da Avaliação *</FormLabel>
                      <Input
                        value={formData.descricao}
                        onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                        placeholder="Digite a descrição da avaliação"
                      />
                      {showValidation && !formData.descricao && (
                        <FormHelperText color="red.500">Descrição é obrigatória</FormHelperText>
                      )}
                    </FormControl>

                    <FormControl isInvalid={showValidation && !formData.tipoItemAvaliado}>
                      <FormLabel>Tipo de Item Avaliado *</FormLabel>
                      <Select
                        value={formData.tipoItemAvaliado}
                        onChange={(e) => setFormData({...formData, tipoItemAvaliado: e.target.value})}
                        placeholder="Selecione o tipo"
                      >
                        {ITEM_AVALIADO_TYPES.map((type: any) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Select>
                      {showValidation && !formData.tipoItemAvaliado && (
                        <FormHelperText color="red.500">Tipo de item avaliado é obrigatório</FormHelperText>
                      )}
                    </FormControl>

                    <FormControl isInvalid={showValidation && !formData.nivelEnsino}>
                      <FormLabel>Nível de Ensino *</FormLabel>
                      <Select
                        value={formData.nivelEnsino}
                        onChange={(e) => setFormData({...formData, nivelEnsino: e.target.value})}
                        placeholder="Selecione o nível de ensino"
                      >
                        {niveisEnsino.map((nivel) => (
                          <option key={nivel.id} value={nivel.id.toString()}>
                            {nivel.nome}
                          </option>
                        ))}
                      </Select>
                      {showValidation && !formData.nivelEnsino && (
                        <FormHelperText color="red.500">Nível de ensino é obrigatório</FormHelperText>
                      )}
                    </FormControl>

                    <FormControl isInvalid={showValidation && formData.tiposTurma.length === 0}>
                      <FormLabel>Tipos de Turma *</FormLabel>
                      <VStack align="start" spacing={2}>
                        <HStack spacing={2} mb={2}>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              const todosTipos = TIPO_TURMA_OPTIONS.map(tipo => tipo.value);
                              setFormData(prev => ({
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
                              setFormData(prev => ({
                                ...prev,
                                tiposTurma: []
                              }));
                            }}
                          >
                            Deselecionar Todos
                          </Button>
                        </HStack>
                        <VStack align="start" spacing={2} maxH="200px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="md" p={3} w="full">
                          {TIPO_TURMA_OPTIONS.map((tipo) => (
                            <Checkbox
                              key={tipo.value}
                              isChecked={formData.tiposTurma.includes(tipo.value)}
                              onChange={() => {
                                const novosTipos = formData.tiposTurma.includes(tipo.value)
                                  ? formData.tiposTurma.filter(t => t !== tipo.value)
                                  : [...formData.tiposTurma, tipo.value];
                                setFormData(prev => ({
                                  ...prev,
                                  tiposTurma: novosTipos
                                }));
                              }}
                              size="sm"
                            >
                              {tipo.label}
                            </Checkbox>
                          ))}
                        </VStack>
                      </VStack>
                      <FormHelperText>
                        Selecione os tipos de turma que serão incluídos nesta avaliação
                      </FormHelperText>
                      {showValidation && formData.tiposTurma.length === 0 && (
                        <FormErrorMessage>Selecione pelo menos um tipo de turma</FormErrorMessage>
                      )}
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tipos de Matrícula (Opcional)</FormLabel>
                      <VStack align="start" spacing={2}>
                        <HStack spacing={2} mb={2}>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              const todosTipos = tiposMatricula.map(tipo => tipo.id.toString());
                              setFormData(prev => ({
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
                              setFormData(prev => ({
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
                              isChecked={formData.tiposMatricula.includes(tipo.id.toString())}
                              onChange={() => {
                                const tipoId = tipo.id.toString();
                                const novosTipos = formData.tiposMatricula.includes(tipoId)
                                  ? formData.tiposMatricula.filter(t => t !== tipoId)
                                  : [...formData.tiposMatricula, tipoId];
                                setFormData(prev => ({
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
                              setFormData(prev => ({
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
                              setFormData(prev => ({
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
                              isChecked={formData.tiposProfessor.includes(tipo.id.toString())}
                              onChange={() => {
                                const tipoId = tipo.id.toString();
                                const novosTipos = formData.tiposProfessor.includes(tipoId)
                                  ? formData.tiposProfessor.filter(t => t !== tipoId)
                                  : [...formData.tiposProfessor, tipoId];
                                setFormData(prev => ({
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

                    <FormControl isInvalid={showValidation && !formData.instituicaoId}>
                      <FormLabel>Instituição *</FormLabel>
                      <Select
                        value={formData.instituicaoId}
                        onChange={(e) => setFormData({...formData, instituicaoId: e.target.value})}
                        placeholder="Selecione a instituição"
                      >
                        {filtros.instituicoes.map((instituicao: any) => (
                          <option key={instituicao.id} value={instituicao.id}>
                            {instituicao.nome}
                          </option>
                        ))}
                      </Select>
                      {showValidation && !formData.instituicaoId && (
                        <FormHelperText color="red.500">Instituição é obrigatória</FormHelperText>
                      )}
                    </FormControl>

                    <FormControl isInvalid={Boolean(formData.nomeItemEspecifico && formData.nomeItemEspecifico.length > 2000)}>
                      <FormLabel>Nome Específico do Item</FormLabel>
                      <Input
                        value={formData.nomeItemEspecifico}
                        onChange={(e) => setFormData({...formData, nomeItemEspecifico: e.target.value})}
                        placeholder="Ex: Direito, Matemática, etc."
                        maxLength={2000}
                      />
                      <FormHelperText>
                        {formData.nomeItemEspecifico ? `${formData.nomeItemEspecifico.length}/2000 caracteres` : 'Máximo 2000 caracteres'}
                      </FormHelperText>
                      {formData.nomeItemEspecifico && formData.nomeItemEspecifico.length > 2000 && (
                        <FormErrorMessage>O nome do item deve ter no máximo 2000 caracteres</FormErrorMessage>
                      )}
                    </FormControl>
                  </VStack>
                </Box>

                <Divider />

                {/* Informações Adicionais */}
                <Box>
                  <Heading size="sm" mb={4}>Configurações da Avaliação</Heading>
                  <VStack align="stretch" spacing={4}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isInvalid={showValidation && !formData.dataInicio}>
                        <FormLabel>Data e Hora de Início *</FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.dataInicio || ''}
                          onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                        />
                        {showValidation && !formData.dataInicio && (
                          <FormHelperText color="red.500">Data e hora de início são obrigatórias</FormHelperText>
                        )}
                      </FormControl>
                      
                      <FormControl isInvalid={showValidation && isDataFimInvalida()}>
                        <FormLabel>Data e Hora de Fim *</FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.dataFim || ''}
                          onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                        />
                        {showValidation && !formData.dataFim && (
                          <FormHelperText color="red.500">Data e hora de fim são obrigatórias</FormHelperText>
                        )}
                        {showValidation && formData.dataInicio && formData.dataFim && new Date(formData.dataFim) <= new Date(formData.dataInicio) && (
                          <FormHelperText color="red.500">A data de fim deve ser posterior à data de início</FormHelperText>
                        )}
                      </FormControl>
                  </SimpleGrid>

                    <FormControl>
                      <FormLabel>Permitir comentários nas questões</FormLabel>
                      <Checkbox
                        isChecked={formData.permitirComentarios}
                        onChange={(e) => setFormData({...formData, permitirComentarios: e.target.checked})}
                      >
                        Permitir que participantes adicionem comentários
                      </Checkbox>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Permitir salvar andamento</FormLabel>
                      <Checkbox
                        isChecked={formData.permitirSalvarAndamento}
                        onChange={(e) => setFormData({...formData, permitirSalvarAndamento: e.target.checked})}
                      >
                        Permitir que participantes salvem o progresso
                      </Checkbox>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Texto de boas-vindas (aceita HTML)</FormLabel>
                      <Editor
                        editorState={editorState}
                        onEditorStateChange={handleEditorChange}
                        wrapperClassName="demo-wrapper"
                        editorClassName="demo-editor"
                        toolbar={{
                          options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Template de e-mail de convite (aceita HTML)</FormLabel>
                      <Editor
                        editorState={editorConvite}
                        onEditorStateChange={handleEditorConviteChange}
                        wrapperClassName="demo-wrapper"
                        editorClassName="demo-editor"
                        toolbar={{
                          options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Template de e-mail de lembrete (aceita HTML)</FormLabel>
                      <Editor
                        editorState={editorLembrete}
                        onEditorStateChange={handleEditorLembreteChange}
                        wrapperClassName="demo-wrapper"
                        editorClassName="demo-editor"
                        toolbar={{
                          options: ['inline', 'blockType', 'fontSize', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'emoji', 'remove', 'history'],
                        }}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Lembrar a cada X dias</FormLabel>
                      <Input
                        type="number"
                        value={formData.lembrarACadaXDias || ''}
                        onChange={(e) => setFormData({...formData, lembrarACadaXDias: parseInt(e.target.value) || 0})}
                        placeholder="Ex: 7"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Enviar lembrete automático</FormLabel>
                      <Checkbox
                        isChecked={formData.enviarLembreteAutomatico}
                        onChange={(e) => setFormData({...formData, enviarLembreteAutomatico: e.target.checked})}
                      >
                        Ativar lembretes automáticos
                      </Checkbox>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Enviar lembrete para todos</FormLabel>
                      <Checkbox
                        isChecked={formData.enviarLembreteParaTodos}
                        onChange={(e) => setFormData({...formData, enviarLembreteParaTodos: e.target.checked})}
                      >
                        Enviar lembretes para todos os participantes
                      </Checkbox>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Ativar avaliação</FormLabel>
                      <Checkbox
                        isChecked={formData.ativo}
                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      >
                        Ativar avaliação imediatamente após criação
                      </Checkbox>
                    </FormControl>
                  </VStack>
                </Box>

                {/* Filtros Avançados */}
                <Divider />
                <Box>
                  <Heading size="sm" mb={4}>Filtros de Participantes</Heading>
                  
                  <VStack spacing={4} align="stretch">
                    <HStack spacing={4}>
                      <Checkbox
                        isChecked={usarFiltrosAvancados}
                        onChange={(e) => setUsarFiltrosAvancados(e.target.checked)}
                        colorScheme="blue"
                      >
                        Usar filtros avançados
                      </Checkbox>
                      <Text fontSize="sm" color="gray.600">
                        Ative para usar filtros mais específicos baseados nas novas tabelas de relacionamento
                      </Text>
                    </HStack>

                    {usarFiltrosAvancados ? (
                      <FiltrosAvancados
                        tipoItemAvaliado={formData.tipoItemAvaliado}
                        onFiltrosChange={setFiltrosAvancados}
                        filtrosIniciais={filtrosAvancados}
                        isLoading={loading}
                      />
                    ) : (
                      <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.200">
                        <Text fontSize="sm" color="gray.600">
                          Os filtros básicos serão aplicados automaticamente baseados no tipo de item avaliado selecionado.
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>

                {/* NOTA: Regras de Filtro removidas daqui */}
                {/* Regras em cascata agora são GLOBAIS e gerenciadas em /configuracoes/regras-cascata */}
                {/* Use apenas os filtros específicos acima (Tipos permitidos, Contexto aluno, etc) */}

                {/* Botão de Criar */}
                <Box pt={4}>
                  <HStack justify="flex-end">
                    <Button
                      leftIcon={<Send size={20} />}
                      colorScheme="green"
                      onClick={onNextStep}
                      isDisabled={!isFormularioValido() || isDataFimInvalida()}
                      size="lg"
                    >
                      Próximo: Selecionar Questões
                    </Button>
                </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Seleção de Questões */}
        {showQuestionSelection && (
          <>
            {/* Resumo da Configuração */}
            <Card mb={6}>
              <CardHeader>
                <HStack spacing={4}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<ChevronLeft />}
                    onClick={() => setShowQuestionSelection(false)}
                  >
                    Voltar
                  </Button>
                  <Heading size="md">Resumo da Avaliação</Heading>
                </HStack>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Box>
                    <Text fontWeight="bold" color="gray.700">Título:</Text>
                    <Text color="gray.600">{formData.titulo}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.700">Tipo de Item:</Text>
                    <Text color="gray.600">{formData.tipoItemAvaliado}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.700">Data de Início:</Text>
                    <Text color="gray.600">{formData.dataInicio}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" color="gray.700">Data de Fim:</Text>
                    <Text color="gray.600">{formData.dataFim}</Text>
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Seleção de Questões */}
            <Card>
              <CardHeader>
                <VStack align="start" spacing={1}>
                  <Heading size="md">Selecionar Questões</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {formData.questoes.length > 0 
                      ? `${formData.questoes.length} questão(ões) selecionada(s)`
                      : 'Clique nas questões para selecioná-las'
                    }
                  </Text>
                </VStack>
              </CardHeader>
            <CardBody>
              <Stack>
                {!questionsData ? (
                  <Center py={8}>
                    <VStack spacing={4}>
                      <Spinner size="lg" color="blue.500" />
                      <Text color="gray.600">Carregando questões...</Text>
                    </VStack>
                  </Center>
                ) : questionsData.length === 0 ? (
                  <Center py={8}>
                    <VStack spacing={4}>
                      <Text color="gray.500" fontSize="lg">Nenhuma questão encontrada.</Text>
                      <Text color="gray.400" fontSize="sm">
                        Crie questões primeiro antes de configurar uma avaliação.
                      </Text>
                    </VStack>
                  </Center>
                ) : (() => {
                  // Verificar se questionsData é um array válido
                  const questions = Array.isArray(questionsData) ? questionsData : [];
                  const totalPages = Math.ceil(questions.length / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const endIndex = startIndex + itemsPerPage;
                  const currentQuestions = questions.slice(startIndex, endIndex);

                  return (
                    <>
                      {currentQuestions.length > 0 ? (
                        currentQuestions.map((question: any, index: number) => {
                          const isSelected = formData.questoes.includes(question.id);

                          return (
                            <Box
                              key={question.id}
                              borderWidth="2px"
                              p={4}
                              borderRadius="md"
                              borderColor={isSelected ? "blue.500" : "gray.200"}
                              bg={isSelected ? "blue.50" : "white"}
                              cursor="pointer"
                              onClick={() => toggleQuestionSelection(question.id)}
                              _hover={{
                                borderColor: isSelected ? "blue.600" : "gray.300",
                                bg: isSelected ? "blue.100" : "gray.50"
                              }}
                              position="relative"
                            >
                              {isSelected && (
                                <Box
                                  position="absolute"
                                  top={2}
                                  right={2}
                                  bg="blue.500"
                                  color="white"
                                  borderRadius="full"
                                  w={6}
                                  h={6}
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  ✓
                                </Box>
                              )}
                              <Stack>
                                <Box>
                                  <Text fontWeight="bold" mb={2}>
                                    {question.texto || 'Questão sem título'}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    Tipo: {question.tipo || 'Não especificado'}
                                  </Text>
                                  {question.opcoes && question.opcoes.length > 0 && (
                                    <VStack align="start" mt={2} spacing={1}>
                                      {question.opcoes.map((opcao: any, idx: number) => (
                                        <Text key={idx} fontSize="sm" color="gray.500">
                                          • {opcao.texto || `Opção ${idx + 1}`}
                                        </Text>
                                      ))}
                                    </VStack>
                                  )}
                                </Box>
                              </Stack>
                            </Box>
                          );
                        })
                      ) : (
                        <Center py={8}>
                          <VStack spacing={4}>
                            <Text color="gray.500">Nenhuma questão encontrada nesta página.</Text>
                          </VStack>
                        </Center>
                      )}

                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={questions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                        showInfo={true}
                        size="sm"
                      />
                    </>
                  );
                })()}
              </Stack>
            </CardBody>
            <CardFooter>
              <HStack justify="flex-end" w="full">
                {formData.questoes.length > 0 && (
                  <Button
                    colorScheme="green"
                    onClick={criarAvaliacao}
                    leftIcon={loading ? <Spinner size="sm" /> : <ArrowRight />}
                    size="lg"
                    isLoading={loading}
                    loadingText="Criando avaliação..."
                  >
                    {`Criar avaliação com ${formData.questoes.length} questões`}
                  </Button>
                )}
              </HStack>
            </CardFooter>
          </Card>
        </>
        )}

        {/* Modal de Participantes */}
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <Users size={24} />
                <Text>Participantes Encontrados</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  {participantes.length} participantes encontrados com base nos filtros selecionados.
                </Text>

                {participantes.length > 0 && (
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Nome</Th>
                          <Th>Tipo</Th>
                          <Th>Email</Th>
                          <Th>Curso</Th>
                          <Th>Turma</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {participantes.map((participante) => (
                          <Tr key={participante.id}>
                            <Td>
                              <HStack spacing={2}>
                                <UserCheck size={16} color="gray.400" />
                                <Text fontWeight="medium">{participante.nome}</Text>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge colorScheme="blue">
                                {participante.tipo}
                              </Badge>
                            </Td>
                            <Td>{participante.email || '-'}</Td>
                            <Td>{participante.curso || '-'}</Td>
                            <Td>{participante.turma || '-'}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </MainLayout>
  );
};

export default CriarAvaliacaoPage;
