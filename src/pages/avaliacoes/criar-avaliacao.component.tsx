import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Badge, 
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Spinner,
  Center,
  Input,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  SimpleGrid
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical, 
  FiEye,
  FiUsers,
  FiCalendar,
  FiTarget,
  FiHome,
  FiBookOpen,
  FiSettings
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/main-layout.component';

// Tipos
interface Instituicao {
  id: number;
  nome: string;
}

interface PeriodoLetivo {
  id: number;
  nome: string;
  codigo: string;
}

interface Curso {
  id: number;
  nome: string;
  codigo: string;
}

interface Turma {
  id: number;
  nome: string;
  codigo: string;
}

interface Disciplina {
  id: number;
  nome: string;
  codigo: string;
}

interface Professor {
  id: number;
  nome: string;
  departamento?: string;
}

interface Coordenador {
  id: number;
  nome: string;
  departamento?: string;
}

interface FiltrosAvaliacao {
  tipoItemAvaliado: string;
  instituicaoId?: number;
  periodoLetivoId?: number;
  cursoId?: number;
  turmaId?: number;
  disciplinaId?: number;
  professorId?: number;
  turmaDisciplinaId?: number;
  coordenadorId?: number;
  tipoParticipante?: string;
}

interface FormData {
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  itemAvaliado: string;
  nomeItemEspecifico: string;
  descricaoItem: string;
  filtros: FiltrosAvaliacao;
}

const CriarAvaliacaoPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    itemAvaliado: '',
    nomeItemEspecifico: '',
    descricaoItem: '',
    filtros: {
      tipoItemAvaliado: ''
    }
  });

  const [filtrosDisponiveis, setFiltrosDisponiveis] = useState<string[]>([]);
  const [dadosFiltros, setDadosFiltros] = useState<{
    instituicoes: Instituicao[];
    periodosLetivos: PeriodoLetivo[];
    cursos: Curso[];
    turmas: Turma[];
    disciplinas: Disciplina[];
    professores: Professor[];
    coordenadores: Coordenador[];
  }>({
    instituicoes: [],
    periodosLetivos: [],
    cursos: [],
    turmas: [],
    disciplinas: [],
    professores: [],
    coordenadores: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [participantesPreview, setParticipantesPreview] = useState<any[]>([]);

  const navigate = useNavigate();
  const toast = useToast();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Carregar dados iniciais
  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Carregar filtros quando item avaliado mudar
  useEffect(() => {
    if (formData.itemAvaliado) {
      carregarFiltrosDisponiveis(formData.itemAvaliado);
      setFormData(prev => ({
        ...prev,
        filtros: { ...prev.filtros, tipoItemAvaliado: formData.itemAvaliado }
      }));
    }
  }, [formData.itemAvaliado]);

  const carregarDadosIniciais = async () => {
    try {
      // Carregar instituições
      const instituicoesResponse = await fetch('/api/instituicoes');
      const instituicoes = await instituicoesResponse.json();
      
      // Carregar períodos letivos
      const periodosResponse = await fetch('/api/periodosletivos');
      const periodos = await periodosResponse.json();
      
      // Carregar cursos
      const cursosResponse = await fetch('/api/cursos');
      const cursos = await cursosResponse.json();

      setDadosFiltros(prev => ({
        ...prev,
        instituicoes,
        periodosLetivos: periodos,
        cursos
      }));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados iniciais',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const carregarFiltrosDisponiveis = async (tipoItemAvaliado: string) => {
    try {
      const response = await fetch(`/api/avaliacao/filtros/${tipoItemAvaliado}`);
      const data = await response.json();
      
      setFiltrosDisponiveis(data.filtrosDisponiveis);
      
      // Carregar dados adicionais baseado no tipo
      if (data.filtrosDisponiveis.includes('Turma')) {
        await carregarTurmas();
      }
      if (data.filtrosDisponiveis.includes('Disciplina')) {
        await carregarDisciplinas();
      }
      if (data.filtrosDisponiveis.includes('Professor')) {
        await carregarProfessores();
      }
      if (data.filtrosDisponiveis.includes('Coordenador')) {
        await carregarCoordenadores();
      }
    } catch (error) {
      console.error('Erro ao carregar filtros:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar filtros disponíveis',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const carregarTurmas = async () => {
    try {
      const response = await fetch('/api/turmas');
      const turmas = await response.json();
      setDadosFiltros(prev => ({ ...prev, turmas }));
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const carregarDisciplinas = async () => {
    try {
      const response = await fetch('/api/disciplinas');
      const disciplinas = await response.json();
      setDadosFiltros(prev => ({ ...prev, disciplinas }));
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
    }
  };

  const carregarProfessores = async () => {
    try {
      const response = await fetch('/api/professores');
      const professores = await response.json();
      setDadosFiltros(prev => ({ ...prev, professores }));
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    }
  };

  const carregarCoordenadores = async () => {
    try {
      const response = await fetch('/api/coordenadores');
      const coordenadores = await response.json();
      setDadosFiltros(prev => ({ ...prev, coordenadores }));
    } catch (error) {
      console.error('Erro ao carregar coordenadores:', error);
    }
  };

  const handleFiltroChange = (campo: keyof FiltrosAvaliacao, valor: string | number) => {
    setFormData(prev => ({
      ...prev,
      filtros: {
        ...prev.filtros,
        [campo]: valor
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requestData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim,
        itemAvaliado: formData.itemAvaliado,
        nomeItemEspecifico: formData.nomeItemEspecifico,
        descricaoItem: formData.descricaoItem,
        ...formData.filtros
      };

      const response = await fetch('/api/avaliacao/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Sucesso',
          description: `Avaliação criada com sucesso! ${result.participantesMapeados} participantes mapeados.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/avaliacoes');
      } else {
        const error = await response.json();
        toast({
          title: 'Erro',
          description: `Erro ao criar avaliação: ${error.message}`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao criar avaliação:', error);
      toast({
        title: 'Erro',
        description: 'Erro interno ao criar avaliação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const previewParticipantes = async () => {
    try {
      const response = await fetch('/api/avaliacao/filtros/participantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData.filtros),
      });

      if (response.ok) {
        const data = await response.json();
        setParticipantesPreview(data.participantes);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Erro ao preview participantes:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar preview de participantes',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getIconeItemAvaliado = (tipo: string) => {
    switch (tipo) {
              case 'Professor': return <FiUsers size={20} />;
      case 'Disciplina': return <FiBookOpen size={20} />;
      case 'TurmaDisciplina': return <FiTarget size={20} />;
              case 'Curso': return <FiBookOpen size={20} />;
      case 'Turma': return <FiUsers size={20} />;
              case 'Coordenador': return <FiUsers size={20} />;
              case 'Estrutura': return <FiHome size={20} />;
      default: return <FiTarget size={20} />;
    }
  };

  const getLabelItemAvaliado = (tipo: string) => {
    switch (tipo) {
      case 'Professor': return 'Professor';
      case 'Disciplina': return 'Disciplina';
      case 'TurmaDisciplina': return 'Turma-Disciplina';
      case 'Curso': return 'Curso';
      case 'Turma': return 'Turma';
      case 'Coordenador': return 'Coordenador';
      case 'Estrutura': return 'Estrutura';
      default: return tipo;
    }
  };

  return (
    <MainLayout>
      <Box maxW="6xl" mx="auto" p={6}>
        <Box mb={6}>
          <HStack justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="lg" mb={2}>Criar Nova Avaliação</Heading>
              <Text color="gray.600">
                Configure uma nova avaliação institucional com filtros dinâmicos
              </Text>
            </Box>
          </HStack>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
          <Box bg="white" p={6} borderRadius="lg" border="1px" borderColor="gray.200" mb={6}>
            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
              <FiTarget />
              Informações Básicas
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
              <FormControl isRequired>
                <FormLabel>Título da Avaliação</FormLabel>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ex: Avaliação de Professores 2025/1"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Item Avaliado</FormLabel>
                <Select
                  value={formData.itemAvaliado}
                  onChange={(e) => setFormData({...formData, itemAvaliado: e.target.value})}
                  placeholder="Selecione o item a ser avaliado"
                >
                  <option value="Professor">Professor</option>
                  <option value="Disciplina">Disciplina</option>
                  <option value="TurmaDisciplina">Turma-Disciplina</option>
                  <option value="Curso">Curso</option>
                  <option value="Turma">Turma</option>
                  <option value="Coordenador">Coordenador</option>
                  <option value="Estagio">Estágio</option>
                  <option value="TCC">TCC</option>
                  <option value="ProjetoExtensionista">Projeto Extensionista</option>
                  <option value="Estrutura">Estrutura</option>
                </Select>
              </FormControl>
            </SimpleGrid>

            <FormControl mb={4}>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva o objetivo desta avaliação..."
                rows={3}
              />
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel>Data de Início</FormLabel>
                <Input
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Data de Fim</FormLabel>
                <Input
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({...formData, dataFim: e.target.value})}
                />
              </FormControl>
            </SimpleGrid>
          </Box>

          {/* Filtros Dinâmicos */}
          {formData.itemAvaliado && (
            <Box bg="white" p={6} borderRadius="lg" border="1px" borderColor="gray.200" mb={6}>
              <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
                <FiSettings />
                Filtros para {getLabelItemAvaliado(formData.itemAvaliado)}
              </Heading>
              
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={4}>
                {/* Instituição */}
                {filtrosDisponiveis.includes('Instituicao') && (
                  <FormControl>
                    <FormLabel>Instituição</FormLabel>
                    <Select
                      value={formData.filtros.instituicaoId?.toString() || ''}
                      onChange={(e) => handleFiltroChange('instituicaoId', e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="Selecione a instituição"
                    >
                      <option value="">Todas as instituições</option>
                      {dadosFiltros.instituicoes.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.nome}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Período Letivo */}
                {filtrosDisponiveis.includes('PeriodoLetivo') && (
                  <FormControl>
                    <FormLabel>Período Letivo</FormLabel>
                    <Select
                      value={formData.filtros.periodoLetivoId?.toString() || ''}
                      onChange={(e) => handleFiltroChange('periodoLetivoId', e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="Selecione o período"
                    >
                      <option value="">Todos os períodos</option>
                      {dadosFiltros.periodosLetivos.map((periodo) => (
                        <option key={periodo.id} value={periodo.id}>
                          {periodo.nome} ({periodo.codigo})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Curso */}
                {filtrosDisponiveis.includes('Curso') && (
                  <FormControl>
                    <FormLabel>Curso</FormLabel>
                    <Select
                      value={formData.filtros.cursoId?.toString() || ''}
                      onChange={(e) => handleFiltroChange('cursoId', e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="Selecione o curso"
                    >
                      <option value="">Todos os cursos</option>
                      {dadosFiltros.cursos.map((curso) => (
                        <option key={curso.id} value={curso.id}>
                          {curso.nome} ({curso.codigo})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Turma */}
                {filtrosDisponiveis.includes('Turma') && (
                  <FormControl>
                    <FormLabel>Turma</FormLabel>
                    <Select
                      value={formData.filtros.turmaId?.toString() || ''}
                      onChange={(e) => handleFiltroChange('turmaId', e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="Selecione a turma"
                    >
                      <option value="">Todas as turmas</option>
                      {dadosFiltros.turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome} ({turma.codigo})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Disciplina */}
                {filtrosDisponiveis.includes('Disciplina') && (
                  <FormControl>
                    <FormLabel>Disciplina</FormLabel>
                    <Select
                      value={formData.filtros.disciplinaId?.toString() || ''}
                      onChange={(e) => handleFiltroChange('disciplinaId', e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="Selecione a disciplina"
                    >
                      <option value="">Todas as disciplinas</option>
                      {dadosFiltros.disciplinas.map((disc) => (
                        <option key={disc.id} value={disc.id}>
                          {disc.nome} ({disc.codigo})
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Tipo de Participante (para Estrutura) */}
                {filtrosDisponiveis.includes('TipoParticipante') && (
                  <FormControl>
                    <FormLabel>Tipo de Participante</FormLabel>
                    <Select
                      value={formData.filtros.tipoParticipante || ''}
                      onChange={(e) => handleFiltroChange('tipoParticipante', e.target.value)}
                      placeholder="Selecione o tipo"
                    >
                      <option value="Aluno">Alunos</option>
                      <option value="Professor">Professores</option>
                    </Select>
                  </FormControl>
                )}
              </SimpleGrid>

              {/* Botão Preview */}
              <Box display="flex" justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previewParticipantes}
                  leftIcon={<FiUsers />}
                >
                  Preview Participantes
                </Button>
              </Box>
            </Box>
          )}

          {/* Item Específico */}
          <Box bg="white" p={6} borderRadius="lg" border="1px" borderColor="gray.200" mb={6}>
            <Heading size="md" mb={4} display="flex" alignItems="center" gap={2}>
              {getIconeItemAvaliado(formData.itemAvaliado)}
              Item Específico
            </Heading>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Nome do Item</FormLabel>
                <Input
                  value={formData.nomeItemEspecifico}
                  onChange={(e) => setFormData({...formData, nomeItemEspecifico: e.target.value})}
                  placeholder={`Ex: ${getLabelItemAvaliado(formData.itemAvaliado)} específico`}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descrição do Item</FormLabel>
                <Input
                  value={formData.descricaoItem}
                  onChange={(e) => setFormData({...formData, descricaoItem: e.target.value})}
                  placeholder="Descrição detalhada do item..."
                />
              </FormControl>
            </SimpleGrid>
          </Box>

          {/* Botões de Ação */}
          <Box display="flex" justifyContent="flex-end" gap={4}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/avaliacoes')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              leftIcon={<FiPlus />}
            >
              {isLoading ? 'Criando...' : 'Criar Avaliação'}
            </Button>
          </Box>
        </form>

        {/* Dialog de Preview de Participantes */}
        <AlertDialog isOpen={showPreview} onClose={() => setShowPreview(false)} leastDestructiveRef={cancelRef}>
          <AlertDialogOverlay>
            <AlertDialogContent maxW="4xl">
              <AlertDialogHeader>
                <Heading size="md">Preview de Participantes</Heading>
              </AlertDialogHeader>
              
              <Box maxH="96" overflowY="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Email</Th>
                      <Th>Tipo</Th>
                      <Th>Informação Específica</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {participantesPreview.map((participante, index) => (
                      <Tr key={index}>
                        <Td>{participante.nome}</Td>
                        <Td>{participante.email}</Td>
                        <Td>
                          <Badge colorScheme="blue">
                            {participante.tipo}
                          </Badge>
                        </Td>
                        <Td>{participante.informacaoEspecifica}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              
              <Box p={4} borderTop="1px" borderColor="gray.200">
                <Text fontSize="sm" color="gray.600">
                  Total de participantes: {participantesPreview.length}
                </Text>
              </Box>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </MainLayout>
  );
};

export default CriarAvaliacaoPage;
