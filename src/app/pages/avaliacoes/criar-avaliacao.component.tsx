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
import { ITEM_AVALIADO_TYPES, TipoQuestionarioEnum } from '../../services/form/form.services.types';
import { useGetQuestions } from '../../services/question';
import { api } from '../../services/api';

interface FiltrosAvaliacao {
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
}

const CriarAvaliacaoPage: React.FC = () => {
  const navigate = useNavigate();
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
    tipoParticipante: ''
  });
  
  // Estado para controlar quando mostrar validações
  const [showValidation, setShowValidation] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apiavaliacao.catolicasc.org.br/api';
  const toast = useToast();
  const { data: questionsData } = useGetQuestions();

  useEffect(() => {
    carregarFiltros();
  }, []);

  // Funções para os editores de texto rico
  const handleEditorChange = (state: EditorState) => {
    setEditorState(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    setFormData({...formData, textoBoasVindas: html});
  };

  const handleEditorConviteChange = (state: EditorState) => {
    setEditorConvite(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    setFormData({...formData, templateEmailConvite: html});
  };

  const handleEditorLembreteChange = (state: EditorState) => {
    setEditorLembrete(state);
    const content = state.getCurrentContent();
    const html = draftToHtml(convertToRaw(content));
    setFormData({...formData, templateEmailLembrete: html});
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
    if (!formData.titulo || !formData.descricao || !formData.tipoItemAvaliado || !formData.dataInicio || !formData.dataFim || !formData.instituicaoId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios, incluindo instituição, data e hora de início e fim.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    try {
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
        }))
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
      tipoParticipante: ''
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
                      
                      <FormControl isInvalid={showValidation && !formData.dataFim}>
                        <FormLabel>Data e Hora de Fim *</FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.dataFim || ''}
                          onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                        />
                        {showValidation && !formData.dataFim && (
                          <FormHelperText color="red.500">Data e hora de fim são obrigatórias</FormHelperText>
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

                {/* Botão de Criar */}
                <Box pt={4}>
                  <HStack justify="flex-end">
                                    <Button
                      leftIcon={<Send size={20} />}
                      colorScheme="green"
                      onClick={onNextStep}
                      isDisabled={!formData.titulo || !formData.descricao || !formData.tipoItemAvaliado || !formData.dataInicio || !formData.dataFim}
                      size="lg"
                    >
                      Próximo
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
                    leftIcon={<ArrowRight />}
                    size="lg"
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
