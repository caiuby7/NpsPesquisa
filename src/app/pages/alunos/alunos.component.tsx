import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  Select,
  Checkbox,
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
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Flex,
  Heading,
  Spinner,
  Center
} from '@chakra-ui/react';
import { 
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Mail,
  Building,
  Award,
  Phone,
  Calendar,
  FileSpreadsheet,
  Users
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';

interface Aluno {
  alunoId: number;
  nome: string;
  matricula: string;
  cpf?: string;
  dataNascimento?: string;
  sexo?: number;
  email: string;
  emailPessoal?: string;
  telefone?: string;
  cursoId: number;
  turmaId?: number;
  periodoLetivoId: number;
  instituicaoId: number;
  turno?: number;
  fase?: number;
  grade?: string;
  habilitacao?: string;
  dataIngressoCurso?: string;
  tipoMatricula?: number;
  dataMatricula?: string;
  statusNoPeriodoLetivo?: string;
  turmaAtiva: boolean;
  aceitaContato: boolean;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
  integracaoId?: string;
  turmaDisciplinaIntegracaoId?: string;
  cursoIntegracaoId?: string;
  turmaIntegracaoId?: string;
  periodoLetivoIntegracaoId?: string;
  instituicaoIntegracaoId?: string;
  curso?: {
    id: number;
    nome: string;
    codigo: string;
  };
  turma?: {
    id: number;
    nome: string;
  };
  periodoLetivo?: {
    id: number;
    nome: string;
  };
  instituicao?: {
    id: number;
    nome: string;
  };
  turmasDisciplinas?: TurmaDisciplina[];
}

interface AlunoFormData {
  nome: string;
  matricula: string;
  cpf: string;
  dataNascimento: string;
  sexo: string;
  email: string;
  emailPessoal: string;
  telefone: string;
  cursoId: string;
  turmaId: string;
  periodoLetivoId: string;
  instituicaoId: string;
  turno: string;
  fase: string;
  grade: string;
  habilitacao: string;
  dataIngressoCurso: string;
  tipoMatricula: string;
  dataMatricula: string;
  statusNoPeriodoLetivo: string;
  turmaAtiva: boolean;
  aceitaContato: boolean;
  ativo: boolean;
  integracaoId: string;
  turmaDisciplinaIntegracaoId: string;
  cursoIntegracaoId: string;
  turmaIntegracaoId: string;
  periodoLetivoIntegracaoId: string;
  instituicaoIntegracaoId: string;
  turmaDisciplinaIds: number[];
}

interface Curso {
  id: number;
  nome: string;
  codigo: string;
}

interface Turma {
  id: number;
  nome: string;
}

interface TurmaDisciplina {
  id: number;
  turma: {
    id: number;
    nome: string;
  };
  disciplina: {
    id: number;
    nome: string;
  };
  professor: {
    id: number;
    nome: string;
  };
  ativo: boolean;
}

interface PeriodoLetivo {
  id: number;
  nome: string;
}

interface Instituicao {
  id: number;
  nome: string;
}

const AlunosPage: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmasDisciplinas, setTurmasDisciplinas] = useState<TurmaDisciplina[]>([]);
  const [periodosLetivos, setPeriodosLetivos] = useState<PeriodoLetivo[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [formData, setFormData] = useState<AlunoFormData>({
    nome: '',
    matricula: '',
    cpf: '',
    dataNascimento: '',
    sexo: '',
    email: '',
    emailPessoal: '',
    telefone: '',
    cursoId: '',
    turmaId: '',
    periodoLetivoId: '',
    instituicaoId: '',
    turno: '',
    fase: '',
    grade: '',
    habilitacao: '',
    dataIngressoCurso: '',
    tipoMatricula: '',
    dataMatricula: '',
    statusNoPeriodoLetivo: '',
    turmaAtiva: true,
    aceitaContato: true,
    ativo: true,
    integracaoId: '',
    turmaDisciplinaIntegracaoId: '',
    cursoIntegracaoId: '',
    turmaIntegracaoId: '',
    periodoLetivoIntegracaoId: '',
    instituicaoIntegracaoId: '',
    turmaDisciplinaIds: []
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const toast = useToast();

  useEffect(() => {
    fetchAlunos();
    fetchCursos();
    fetchTurmas();
    fetchTurmasDisciplinas();
    fetchPeriodosLetivos();
    fetchInstituicoes();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Aluno`);
      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
      } else {
        toast({
          title: 'Erro ao carregar alunos',
          description: 'Não foi possível carregar os alunos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar alunos',
        description: 'Não foi possível carregar os alunos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCursos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Curso`);
      if (response.ok) {
        const data = await response.json();
        setCursos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const fetchTurmas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Turma`);
      if (response.ok) {
        const data = await response.json();
        setTurmas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const fetchTurmasDisciplinas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/TurmaDisciplina`);
      if (response.ok) {
        const data = await response.json();
        setTurmasDisciplinas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas-disciplinas:', error);
    }
  };

  const fetchPeriodosLetivos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/PeriodoLetivo`);
      if (response.ok) {
        const data = await response.json();
        setPeriodosLetivos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar períodos letivos:', error);
    }
  };

  const fetchInstituicoes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Instituicao`);
      if (response.ok) {
        const data = await response.json();
        setInstituicoes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingAluno 
        ? `${API_BASE_URL}/Aluno/${editingAluno.alunoId}`
        : `${API_BASE_URL}/Aluno`;
      
      const method = editingAluno ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        cursoId: parseInt(formData.cursoId),
        turmaId: formData.turmaId ? parseInt(formData.turmaId) : null,
        periodoLetivoId: parseInt(formData.periodoLetivoId),
        instituicaoId: parseInt(formData.instituicaoId),
        fase: formData.fase ? parseInt(formData.fase) : null,
        sexo: formData.sexo ? parseInt(formData.sexo) : null,
        turno: formData.turno ? parseInt(formData.turno) : null,
        tipoMatricula: formData.tipoMatricula ? parseInt(formData.tipoMatricula) : null,
        dataNascimento: formData.dataNascimento ? new Date(formData.dataNascimento).toISOString() : null,
        dataIngressoCurso: formData.dataIngressoCurso ? new Date(formData.dataIngressoCurso).toISOString() : null,
        dataMatricula: formData.dataMatricula ? new Date(formData.dataMatricula).toISOString() : null,
        ativo: formData.ativo
      };
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: editingAluno 
            ? 'Aluno atualizado com sucesso!' 
            : 'Aluno criado com sucesso!',
          description: editingAluno 
            ? 'O aluno foi atualizado com sucesso.' 
            : 'O aluno foi criado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchAlunos();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro ao salvar aluno',
          description: errorData.message || 'Não foi possível salvar o aluno.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar aluno',
        description: 'Não foi possível salvar o aluno.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormData({
      nome: aluno.nome || '',
      matricula: aluno.matricula || '',
      cpf: aluno.cpf || '',
      dataNascimento: aluno.dataNascimento ? aluno.dataNascimento.split('T')[0] : '',
      sexo: aluno.sexo?.toString() || '',
      email: aluno.email || '',
      emailPessoal: aluno.emailPessoal || '',
      telefone: aluno.telefone || '',
      cursoId: aluno.cursoId?.toString() || '',
      turmaId: aluno.turmaId?.toString() || '',
      periodoLetivoId: aluno.periodoLetivoId?.toString() || '',
      instituicaoId: aluno.instituicaoId?.toString() || '',
      turno: aluno.turno?.toString() || '',
      fase: aluno.fase?.toString() || '',
      grade: aluno.grade || '',
      habilitacao: aluno.habilitacao || '',
      dataIngressoCurso: aluno.dataIngressoCurso ? aluno.dataIngressoCurso.split('T')[0] : '',
      tipoMatricula: aluno.tipoMatricula?.toString() || '',
      dataMatricula: aluno.dataMatricula ? aluno.dataMatricula.split('T')[0] : '',
      statusNoPeriodoLetivo: aluno.statusNoPeriodoLetivo || '',
      turmaAtiva: aluno.turmaAtiva,
      aceitaContato: aluno.aceitaContato,
      ativo: aluno.ativo,
      integracaoId: aluno.integracaoId || '',
      turmaDisciplinaIntegracaoId: aluno.turmaDisciplinaIntegracaoId || '',
      cursoIntegracaoId: aluno.cursoIntegracaoId || '',
      turmaIntegracaoId: aluno.turmaIntegracaoId || '',
      periodoLetivoIntegracaoId: aluno.periodoLetivoIntegracaoId || '',
      instituicaoIntegracaoId: aluno.instituicaoIntegracaoId || '',
      turmaDisciplinaIds: aluno.turmasDisciplinas?.map(td => td.id) || []
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Aluno/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Aluno excluído com sucesso!',
          description: 'O aluno foi excluído com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchAlunos();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro ao excluir aluno',
          description: errorData.message || 'Não foi possível excluir o aluno.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao excluir aluno',
        description: 'Não foi possível excluir o aluno.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleToggleStatus = async (id: number, ativo: boolean) => {
    try {
      const endpoint = ativo ? 'desativar' : 'ativar';
      const response = await fetch(`${API_BASE_URL}/Aluno/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 
            ativo 
              ? 'Aluno desativado com sucesso!' 
              : 'Aluno ativado com sucesso!',
          description: 
            ativo 
              ? 'O aluno foi desativado com sucesso.' 
              : 'O aluno foi ativado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchAlunos();
      } else {
        toast({
          title: 'Erro ao alterar status do aluno',
          description: 'Não foi possível alterar o status do aluno.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao alterar status do aluno',
        description: 'Não foi possível alterar o status do aluno.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      matricula: '',
      cpf: '',
      dataNascimento: '',
      sexo: '',
      email: '',
      emailPessoal: '',
      telefone: '',
      cursoId: '',
      turmaId: '',
      periodoLetivoId: '',
      instituicaoId: '',
      turno: '',
      fase: '',
      grade: '',
      habilitacao: '',
      dataIngressoCurso: '',
      tipoMatricula: '',
      dataMatricula: '',
      statusNoPeriodoLetivo: '',
      turmaAtiva: true,
      aceitaContato: true,
      ativo: true,
      integracaoId: '',
      turmaDisciplinaIntegracaoId: '',
      cursoIntegracaoId: '',
      turmaIntegracaoId: '',
      periodoLetivoIntegracaoId: '',
      instituicaoIntegracaoId: '',
      turmaDisciplinaIds: []
    });
    setEditingAluno(null);
  };

  const openNewDialog = () => {
    resetForm();
    onOpen();
  };

  const closeDialog = () => {
    onClose();
    resetForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/vnd.ms-excel' || 
                 file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                 file.name.endsWith('.xls') || file.name.endsWith('.xlsx'))) {
      setImportFile(file);
    } else {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione um arquivo Excel (.xls ou .xlsx)',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione um arquivo para importar',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setImportLoading(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch(`${API_BASE_URL}/Aluno/importar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Importação realizada com sucesso!',
          description: 'Os alunos foram importados com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setImportModalOpen(false);
        setImportFile(null);
        fetchAlunos();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro na importação',
          description: errorData.message || 'Não foi possível importar os alunos.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível importar os alunos.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setImportLoading(false);
    }
  };

  const getSexoLabel = (sexo: string | number) => {
    const sexos: { [key: string]: string } = {
      '1': 'Masculino',
      '2': 'Feminino',
      'Masculino': 'Masculino',
      'Feminino': 'Feminino'
    };
    return sexos[sexo?.toString()] || sexo?.toString() || 'N/A';
  };

  const getTurnoLabel = (turno: string | number) => {
    const turnos: { [key: string]: string } = {
      '1': 'Matutino',
      '2': 'Vespertino',
      '3': 'Noturno',
      'Matutino': 'Matutino',
      'Vespertino': 'Vespertino',
      'Noturno': 'Noturno'
    };
    return turnos[turno?.toString()] || turno?.toString() || 'N/A';
  };

  const getTipoMatriculaLabel = (tipoMatricula: string | number) => {
    const tipos: { [key: string]: string } = {
      '1': 'Calouro',
      '2': 'Veterano',
      '3': 'Formando',
      'Calouro': 'Calouro',
      'Veterano': 'Veterano',
      'Formando': 'Formando'
    };
    return tipos[tipoMatricula?.toString()] || tipoMatricula?.toString() || 'N/A';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  return (
    <MainLayout>
      <Box p={6} maxW="1200px" mx="auto">
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between" mb={6}>
        <Flex alignItems="center">
          <Users className="h-8 w-8 text-blue-600" />
          <Box ml={3}>
            <Heading size="lg" fontWeight="bold" color="gray.900">Alunos</Heading>
            <Text fontSize="md" color="gray.600">Gerencie os alunos do sistema</Text>
          </Box>
        </Flex>
        
        <HStack spacing={3}>
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="blue"
            onClick={openNewDialog}
            size="md"
          >
            Criar Aluno
          </Button>
          <Button
            leftIcon={<FileSpreadsheet size={16} />}
            colorScheme="green"
            onClick={() => setImportModalOpen(true)}
            size="md"
          >
            Importar XLS
          </Button>
        </HStack>
      </Flex>
      
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">
              {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
            </Heading>
          </ModalHeader>
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Dados Pessoais */}
                <Heading size="sm" color="gray.700">Dados Pessoais</Heading>
                
                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Nome *</Text>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome completo do aluno"
                      required
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Matrícula *</Text>
                    <Input
                      value={formData.matricula}
                      onChange={(e) => setFormData({...formData, matricula: e.target.value})}
                      placeholder="Número da matrícula"
                      required
                    />
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>CPF</Text>
                    <Input
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Data de Nascimento</Text>
                    <Input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Sexo</Text>
                    <Select
                      value={formData.sexo}
                      onChange={(e) => setFormData({...formData, sexo: e.target.value})}
                    >
                      <option value="">Não informado</option>
                      <option value="1">Masculino</option>
                      <option value="2">Feminino</option>
                    </Select>
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Email *</Text>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="email@exemplo.com"
                      required
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Email Pessoal</Text>
                    <Input
                      type="email"
                      value={formData.emailPessoal}
                      onChange={(e) => setFormData({...formData, emailPessoal: e.target.value})}
                      placeholder="email.pessoal@exemplo.com"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Telefone</Text>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </Box>
                </HStack>

                {/* Dados Acadêmicos */}
                <Heading size="sm" color="gray.700" mt={4}>Dados Acadêmicos</Heading>
                
                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Curso *</Text>
                    <Select
                      value={formData.cursoId}
                      onChange={(e) => setFormData({...formData, cursoId: e.target.value})}
                      required
                    >
                      <option value="">Selecione um curso</option>
                      {cursos.map((curso) => (
                        <option key={curso.id} value={curso.id}>
                          {curso.codigo} - {curso.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Turma</Text>
                    <Select
                      value={formData.turmaId}
                      onChange={(e) => setFormData({...formData, turmaId: e.target.value})}
                    >
                      <option value="">Selecione uma turma</option>
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Período Letivo *</Text>
                    <Select
                      value={formData.periodoLetivoId}
                      onChange={(e) => setFormData({...formData, periodoLetivoId: e.target.value})}
                      required
                    >
                      <option value="">Selecione um período</option>
                      {periodosLetivos.map((periodo) => (
                        <option key={periodo.id} value={periodo.id}>
                          {periodo.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Instituição *</Text>
                    <Select
                      value={formData.instituicaoId}
                      onChange={(e) => setFormData({...formData, instituicaoId: e.target.value})}
                      required
                    >
                      <option value="">Selecione uma instituição</option>
                      {instituicoes.map((instituicao) => (
                        <option key={instituicao.id} value={instituicao.id}>
                          {instituicao.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Turno</Text>
                    <Select
                      value={formData.turno}
                      onChange={(e) => setFormData({...formData, turno: e.target.value})}
                    >
                      <option value="">Não informado</option>
                      <option value="1">Matutino</option>
                      <option value="2">Vespertino</option>
                      <option value="3">Noturno</option>
                    </Select>
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Fase</Text>
                    <Input
                      type="number"
                      value={formData.fase}
                      onChange={(e) => setFormData({...formData, fase: e.target.value})}
                      placeholder="Ex: 1"
                    />
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Grade</Text>
                    <Input
                      value={formData.grade}
                      onChange={(e) => setFormData({...formData, grade: e.target.value})}
                      placeholder="Ex: 2020.1"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Habilitação</Text>
                    <Input
                      value={formData.habilitacao}
                      onChange={(e) => setFormData({...formData, habilitacao: e.target.value})}
                      placeholder="Ex: Bacharelado"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Data de Ingresso no Curso</Text>
                    <Input
                      type="date"
                      value={formData.dataIngressoCurso}
                      onChange={(e) => setFormData({...formData, dataIngressoCurso: e.target.value})}
                    />
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Tipo de Matrícula</Text>
                    <Select
                      value={formData.tipoMatricula}
                      onChange={(e) => setFormData({...formData, tipoMatricula: e.target.value})}
                    >
                      <option value="">Não informado</option>
                      <option value="1">Calouro</option>
                      <option value="2">Veterano</option>
                      <option value="3">Formando</option>
                    </Select>
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Data da Matrícula</Text>
                    <Input
                      type="date"
                      value={formData.dataMatricula}
                      onChange={(e) => setFormData({...formData, dataMatricula: e.target.value})}
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Status no Período Letivo</Text>
                    <Input
                      value={formData.statusNoPeriodoLetivo}
                      onChange={(e) => setFormData({...formData, statusNoPeriodoLetivo: e.target.value})}
                      placeholder="Ex: Matriculado"
                    />
                  </Box>
                </HStack>

                {/* Campos de Integração */}
                <Heading size="sm" color="gray.700" mt={4}>Campos de Integração</Heading>
                
                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>ID de Integração</Text>
                    <Input
                      value={formData.integracaoId}
                      onChange={(e) => setFormData({...formData, integracaoId: e.target.value})}
                      placeholder="123456789"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>ID Turma-Disciplina</Text>
                    <Input
                      value={formData.turmaDisciplinaIntegracaoId}
                      onChange={(e) => setFormData({...formData, turmaDisciplinaIntegracaoId: e.target.value})}
                      placeholder="123456789"
                    />
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>ID Curso</Text>
                    <Input
                      value={formData.cursoIntegracaoId}
                      onChange={(e) => setFormData({...formData, cursoIntegracaoId: e.target.value})}
                      placeholder="123456789"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>ID Turma</Text>
                    <Input
                      value={formData.turmaIntegracaoId}
                      onChange={(e) => setFormData({...formData, turmaIntegracaoId: e.target.value})}
                      placeholder="123456789"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>ID Período Letivo</Text>
                    <Input
                      value={formData.periodoLetivoIntegracaoId}
                      onChange={(e) => setFormData({...formData, periodoLetivoIntegracaoId: e.target.value})}
                      placeholder="123456789"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>ID Instituição</Text>
                    <Input
                      value={formData.instituicaoIntegracaoId}
                      onChange={(e) => setFormData({...formData, instituicaoIntegracaoId: e.target.value})}
                      placeholder="123456789"
                    />
                  </Box>
                </HStack>

                                 {/* Turmas-Disciplinas */}
                 <Heading size="sm" color="gray.700" mt={4}>Turmas-Disciplinas</Heading>
                 <Text fontSize="sm" color="gray.600" mb={2}>
                   Selecione as turmas-disciplinas em que o aluno está matriculado:
                 </Text>
                 
                 <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
                   {turmasDisciplinas.map((turmaDisciplina) => (
                     <Checkbox
                       key={turmaDisciplina.id}
                       isChecked={formData.turmaDisciplinaIds.includes(turmaDisciplina.id)}
                       onChange={(e) => {
                         if (e.target.checked) {
                           setFormData({
                             ...formData,
                             turmaDisciplinaIds: [...formData.turmaDisciplinaIds, turmaDisciplina.id]
                           });
                         } else {
                           setFormData({
                             ...formData,
                             turmaDisciplinaIds: formData.turmaDisciplinaIds.filter(id => id !== turmaDisciplina.id)
                           });
                         }
                       }}
                     >
                       <Box>
                         <Text fontWeight="medium">
                           {turmaDisciplina.turma?.nome} - {turmaDisciplina.disciplina?.nome}
                         </Text>
                         <Text fontSize="sm" color="gray.500">
                           Prof: {turmaDisciplina.professor?.nome}
                         </Text>
                       </Box>
                     </Checkbox>
                   ))}
                 </VStack>

                 {/* Opções */}
                 <VStack align="stretch" spacing={2}>
                   <Checkbox
                     isChecked={formData.turmaAtiva}
                     onChange={(e) => setFormData({...formData, turmaAtiva: e.target.checked})}
                   >
                     Turma ativa
                   </Checkbox>
                   
                   <Checkbox
                     isChecked={formData.aceitaContato}
                     onChange={(e) => setFormData({...formData, aceitaContato: e.target.checked})}
                   >
                     Aceita contato
                   </Checkbox>
                   
                   <Checkbox
                     isChecked={formData.ativo}
                     onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                   >
                     Aluno ativo
                   </Checkbox>
                 </VStack>

                {/* Botões */}
                <ModalFooter>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" colorScheme="blue">
                    {editingAluno ? 'Atualizar' : 'Criar'} Aluno
                  </Button>
                </ModalFooter>
              </VStack>
            </ModalBody>
          </form>
        </ModalContent>
      </Modal>

      {/* Tabela de Alunos */}
      <Box bg="white" borderRadius="lg" p={6} shadow="md">
        <Heading size="md" mb={4}>Lista de Alunos</Heading>
        <Table variant="simple">
                     <Thead>
             <Tr>
               <Th>Nome</Th>
               <Th>Matrícula</Th>
               <Th>Email</Th>
               <Th>Curso</Th>
               <Th>Turma</Th>
               <Th>Período</Th>
               <Th>Turmas-Disciplinas</Th>
               <Th>Status</Th>
               <Th>Ações</Th>
             </Tr>
           </Thead>
          <Tbody>
                         {alunos.length === 0 ? (
               <Tr>
                 <Td colSpan={9} textAlign="center" py={8} color="gray.500">
                   <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                   <Text>Nenhum aluno cadastrado</Text>
                   <Text fontSize="sm">Clique em "Criar Aluno" para começar</Text>
                 </Td>
               </Tr>
             ) : (
              <>
                {alunos.map((aluno) => (
                  <Tr key={aluno.alunoId}>
                    <Td>
                      <HStack>
                        <Users className="h-4 w-4 text-blue-400" />
                        <Box>
                          <Text fontWeight="medium">{aluno.nome}</Text>
                          {aluno.cpf && (
                            <Text fontSize="sm" color="gray.500">{aluno.cpf}</Text>
                          )}
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge variant="outline" colorScheme="blue">
                        {aluno.matricula}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Mail className="h-4 w-4 text-gray-400" />
                        <Text fontSize="sm">{aluno.email}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      {aluno.curso ? (
                        <HStack>
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <Text fontSize="sm">{aluno.curso.codigo} - {aluno.curso.nome}</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">Não informado</Text>
                      )}
                    </Td>
                    <Td>
                      {aluno.turma ? (
                        <HStack>
                          <Building className="h-4 w-4 text-gray-400" />
                          <Text fontSize="sm">{aluno.turma.nome}</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">Não informada</Text>
                      )}
                    </Td>
                                         <Td>
                       {aluno.periodoLetivo ? (
                         <HStack>
                           <Calendar className="h-4 w-4 text-gray-400" />
                           <Text fontSize="sm">{aluno.periodoLetivo.nome}</Text>
                         </HStack>
                       ) : (
                         <Text fontSize="sm" color="gray.400">Não informado</Text>
                       )}
                     </Td>
                     <Td>
                       {aluno.turmasDisciplinas && aluno.turmasDisciplinas.length > 0 ? (
                         <VStack align="start" spacing={1}>
                           {aluno.turmasDisciplinas.slice(0, 2).map((td, index) => (
                             <Badge key={index} size="sm" colorScheme="blue" variant="subtle">
                               {td.disciplina?.nome} ({td.professor?.nome})
                             </Badge>
                           ))}
                           {aluno.turmasDisciplinas.length > 2 && (
                             <Text fontSize="xs" color="gray.500">
                               +{aluno.turmasDisciplinas.length - 2} mais
                             </Text>
                           )}
                         </VStack>
                       ) : (
                         <Text fontSize="sm" color="gray.400">Nenhuma</Text>
                       )}
                     </Td>
                     <Td>
                       <Badge colorScheme={aluno.ativo ? "green" : "gray"}>
                         {aluno.ativo ? "Ativo" : "Inativo"}
                       </Badge>
                     </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<ChevronDown size={16} />} variant="ghost" />
                        <MenuList>
                          <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(aluno)}>
                            Editar
                          </MenuItem>
                          <MenuItem 
                            icon={<Eye size={16} />} 
                            onClick={() => handleToggleStatus(aluno.alunoId, aluno.ativo)}
                          >
                            {aluno.ativo ? (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Ativar
                              </>
                            )}
                          </MenuItem>
                          <MenuDivider />
                          <MenuItem 
                            icon={<Trash2 size={16} />} 
                            color="red.600"
                            onClick={() => handleDelete(aluno.alunoId)}
                          >
                            Excluir
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </>
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de Importação XLS */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Importar Alunos via Excel</Heading>
          </ModalHeader>
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Selecione um arquivo Excel (.xls ou .xlsx) contendo os dados dos alunos.
              </Text>
              
              <Box>
                <Text mb={2}>Arquivo Excel</Text>
                <Input
                  type="file"
                  accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                />
                {importFile && (
                  <Text fontSize="sm" color="green.600" mt={2}>
                    Arquivo selecionado: {importFile.name}
                  </Text>
                )}
              </Box>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setImportModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={handleImportSubmit}
              isLoading={importLoading}
              loadingText="Importando..."
              isDisabled={!importFile}
            >
              Importar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      </Box>
    </MainLayout>
  );
};

export default AlunosPage;
