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
  FileSpreadsheet
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';
import { ENVIRONMENT } from '../../../config/environment';

interface TurmaDisciplina {
  id: number;
  turmaId: number;
  disciplinaId: number;
  professorId: number;
  periodoLetivoId: number;
  ativo: boolean;
  turma?: {
    id: number;
    nome: string;
  };
  disciplina?: {
    id: number;
    nome: string;
  };
  periodoLetivo?: {
    id: number;
    nome: string;
  };
}

interface Professor {
  id: number;
  nome: string;
  email: string;
  departamento?: string;
  titulacao?: string;
  telefone?: string;
  cpf?: string;
  dataNascimento?: string;
  login?: string;
  tipoProfessor?: string;
  integracaoId?: string;
  instituicaoId?: number;
  instituicao?: {
    id: number;
    nome: string;
  };
  turmasDisciplinas?: TurmaDisciplina[];
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
}

interface ProfessorFormData {
  nome: string;
  email: string;
  departamento: string;
  titulacao: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  login: string;
  tipoProfessor: string;
  integracaoId: string;
  instituicaoId: string;
  ativo: boolean;
}

const ProfessoresPage: React.FC = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState<ProfessorFormData>({
    nome: '',
    email: '',
    departamento: '',
    titulacao: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    login: '',
    tipoProfessor: '',
    integracaoId: '',
    instituicaoId: '',
    ativo: true
  });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || ENVIRONMENT.API_URL;
  const toast = useToast();

  useEffect(() => {
    fetchProfessores();
    fetchInstituicoes();
  }, []);

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

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Professor`);
      if (response.ok) {
        const data = await response.json();
        setProfessores(data);
      } else {
        toast({
          title: 'Erro ao carregar professores',
          description: 'Não foi possível carregar os professores.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar professores',
        description: 'Não foi possível carregar os professores.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessoresPorPeriodoLetivo = async (periodoLetivoId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Professor/por-periodo-letivo/${periodoLetivoId}`);

      if (response.ok) {
        const data = await response.json();
        setProfessores(data);
      } else {
        toast({
          title: 'Erro ao carregar professores',
          description: 'Não foi possível carregar a lista de professores para o período selecionado.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar professores',
        description: 'Não foi possível carregar a lista de professores.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProfessor 
        ? `${API_BASE_URL}/Professor/${editingProfessor.id}`
        : `${API_BASE_URL}/Professor`;
      
      const method = editingProfessor ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingProfessor?.id,
        dataNascimento: formData.dataNascimento ? new Date(formData.dataNascimento).toISOString() : null,
        instituicaoId: formData.instituicaoId ? parseInt(formData.instituicaoId) : null,
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
          title: editingProfessor 
            ? 'Professor atualizado com sucesso!' 
            : 'Professor criado com sucesso!',
          description: editingProfessor 
            ? 'O professor foi atualizado com sucesso.' 
            : 'O professor foi criado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchProfessores();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro ao salvar professor',
          description: errorData.message || 'Não foi possível salvar o professor.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao salvar professor',
        description: 'Não foi possível salvar o professor.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      nome: professor.nome || '',
      email: professor.email || '',
      departamento: professor.departamento || '',
      titulacao: professor.titulacao || '',
      telefone: professor.telefone || '',
      cpf: professor.cpf || '',
      dataNascimento: professor.dataNascimento ? professor.dataNascimento.split('T')[0] : '',
      login: professor.login || '',
      tipoProfessor: professor.tipoProfessor || '',
      integracaoId: professor.integracaoId || '',
      instituicaoId: professor.instituicaoId?.toString() || '',
      ativo: professor.ativo
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Professor/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Professor excluído com sucesso!',
          description: 'O professor foi excluído com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchProfessores();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro ao excluir professor',
          description: errorData.message || 'Não foi possível excluir o professor.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao excluir professor',
        description: 'Não foi possível excluir o professor.',
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
      const response = await fetch(`${API_BASE_URL}/Professor/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 
            ativo 
              ? 'Professor desativado com sucesso!' 
              : 'Professor ativado com sucesso!',
          description: 
            ativo 
              ? 'O professor foi desativado com sucesso.' 
              : 'O professor foi ativado com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        fetchProfessores();
      } else {
        toast({
          title: 'Erro ao alterar status do professor',
          description: 'Não foi possível alterar o status do professor.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao alterar status do professor',
        description: 'Não foi possível alterar o status do professor.',
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
      email: '',
      departamento: '',
      titulacao: '',
      telefone: '',
      cpf: '',
      dataNascimento: '',
      login: '',
      tipoProfessor: '',
      integracaoId: '',
      instituicaoId: '',
      ativo: true
    });
    setEditingProfessor(null);
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

      const response = await fetch(`${API_BASE_URL}/Professor/importar`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast({
          title: 'Importação realizada com sucesso!',
          description: 'Os professores foram importados com sucesso.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        setImportModalOpen(false);
        setImportFile(null);
        fetchProfessores();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro na importação',
          description: errorData.message || 'Não foi possível importar os professores.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Não foi possível importar os professores.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setImportLoading(false);
    }
  };

  const getTitulacaoLabel = (titulacao: string) => {
    const titulacoes: { [key: string]: string } = {
      'Graduado': 'Graduado',
      'Especialista': 'Especialista',
      'Mestre': 'Mestre',
      'Doutor': 'Doutor',
      'Pós-Doutor': 'Pós-Doutor'
    };
    return titulacoes[titulacao] || titulacao;
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
          <GraduationCap className="h-8 w-8 text-blue-600" />
          <Box ml={3}>
            <Heading size="lg" fontWeight="bold" color="gray.900">Professores</Heading>
            <Text fontSize="md" color="gray.600">Gerencie os professores do sistema</Text>
          </Box>
        </Flex>
        
        <HStack spacing={3}>
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="blue"
            onClick={openNewDialog}
            size="md"
          >
            Criar Professor
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
      
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">
              {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
            </Heading>
          </ModalHeader>
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Nome *</Text>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome completo do professor"
                      required
                    />
                  </Box>
                  
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
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Departamento</Text>
                    <Input
                      value={formData.departamento}
                      onChange={(e) => setFormData({...formData, departamento: e.target.value})}
                      placeholder="Ex: Ciência da Computação"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>Titulação</Text>
                    <Select
                      value={formData.titulacao}
                      onChange={(e) => setFormData({...formData, titulacao: e.target.value})}
                    >
                      <option value="">Não informada</option>
                      <option value="Graduado">Graduado</option>
                      <option value="Especialista">Especialista</option>
                      <option value="Mestre">Mestre</option>
                      <option value="Doutor">Doutor</option>
                      <option value="Pós-Doutor">Pós-Doutor</option>
                    </Select>
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Telefone</Text>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text>CPF</Text>
                    <Input
                      value={formData.cpf}
                      onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </Box>
                </HStack>

                <HStack spacing={4}>
                  <Box flex={1}>
                    <Text>Login</Text>
                    <Input
                      value={formData.login}
                      onChange={(e) => setFormData({...formData, login: e.target.value})}
                      placeholder="exemplo.usuario"
                      required
                    />
                  </Box>
                  <Box flex={1}>
                    <Text>Tipo de Professor</Text>
                    <Select
                      value={formData.tipoProfessor}
                      onChange={(e) => setFormData({...formData, tipoProfessor: e.target.value})}
                    >
                      <option value="">Não informado</option>
                      <option value="Professor">Professor</option>
                      <option value="Coordenador">Coordenador</option>
                    </Select>
                  </Box>
                </HStack>

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
                    <Text>Instituição</Text>
                    <Select
                      value={formData.instituicaoId}
                      onChange={(e) => setFormData({...formData, instituicaoId: e.target.value})}
                    >
                      <option value="">Selecione uma instituição</option>
                      {instituicoes.map((instituicao) => (
                        <option key={instituicao.id} value={instituicao.id}>
                          {instituicao.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>

                <VStack align="stretch" spacing={2}>
                  <Text>Data de Nascimento</Text>
                  <Input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                  />
                </VStack>

                <VStack align="stretch" spacing={2}>
                  <Checkbox
                    isChecked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  >
                    Professor ativo
                  </Checkbox>
                </VStack>

                {/* Botões */}
                <ModalFooter>
                  <Button variant="outline" onClick={closeDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" colorScheme="blue">
                    {editingProfessor ? 'Atualizar' : 'Criar'} Professor
                  </Button>
                </ModalFooter>
              </VStack>
            </ModalBody>
          </form>
        </ModalContent>
      </Modal>

      {/* Tabela de Professores */}
      <Box bg="white" borderRadius="lg" p={6} shadow="md">
        <Heading size="md" mb={4}>Lista de Professores</Heading>
        <Box overflowX="auto">
          <Table variant="simple" minW="1200px">
          <Thead>
            <Tr>
              <Th minW="200px">Nome</Th>
              <Th minW="250px">Email</Th>
              <Th minW="150px">Departamento</Th>
              <Th minW="120px">Titulação</Th>
              <Th minW="150px">Instituição</Th>
              <Th minW="120px">Telefone</Th>
              <Th minW="120px">Data Cadastro</Th>
              <Th minW="80px">Status</Th>
              <Th minW="100px">Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {professores.length === 0 ? (
              <Tr>
                <Td colSpan={9} textAlign="center" py={8} color="gray.500">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <Text>Nenhum professor cadastrado</Text>
                  <Text fontSize="sm">Clique em "Novo Professor" para começar</Text>
                </Td>
              </Tr>
            ) : (
              <>
                {professores.map((professor) => (
                  <Tr key={professor.id}>
                    <Td>
                      <HStack>
                        <GraduationCap className="h-4 w-4 text-blue-400" />
                        <Box maxW="180px">
                          <Text fontWeight="medium" isTruncated title={professor.nome}>{professor.nome}</Text>
                          {professor.cpf && (
                            <Text fontSize="sm" color="gray.500" isTruncated>{professor.cpf}</Text>
                          )}
                        </Box>
                      </HStack>
                    </Td>
                    <Td>
                      <HStack>
                        <Mail className="h-4 w-4 text-gray-400" />
                        <Text fontSize="sm" isTruncated maxW="220px" title={professor.email}>{professor.email}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      {professor.departamento ? (
                        <HStack>
                          <Building className="h-4 w-4 text-gray-400" />
                          <Text fontSize="sm" isTruncated maxW="120px" title={professor.departamento}>{professor.departamento}</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">Não informado</Text>
                      )}
                    </Td>
                    <Td>
                      {professor.titulacao ? (
                        <HStack>
                          <Award className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline">
                            {getTitulacaoLabel(professor.titulacao)}
                          </Badge>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">Não informada</Text>
                      )}
                    </Td>
                    <Td>
                      {professor.instituicao ? (
                        <HStack>
                          <Building className="h-4 w-4 text-gray-400" />
                          <Text fontSize="sm" isTruncated maxW="120px" title={professor.instituicao.nome}>{professor.instituicao.nome}</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">Não informada</Text>
                      )}
                    </Td>
                    <Td>
                      {professor.telefone ? (
                        <HStack>
                          <Phone className="h-4 w-4 text-gray-400" />
                          <Text fontSize="sm">{professor.telefone}</Text>
                        </HStack>
                      ) : (
                        <Text fontSize="sm" color="gray.400">Não informado</Text>
                      )}
                    </Td>
                    <Td>
                      <HStack>
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <Text fontSize="sm" color="gray.600">
                          {formatDate(professor.dataCadastro)}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={professor.ativo ? "green" : "gray"}>
                        {professor.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<ChevronDown size={16} />} variant="ghost" />
                        <MenuList>
                          <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(professor)}>
                            Editar
                          </MenuItem>
                          <MenuItem 
                            icon={<Eye size={16} />} 
                            onClick={() => handleToggleStatus(professor.id, professor.ativo)}
                          >
                            {professor.ativo ? (
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
                            onClick={() => handleDelete(professor.id)}
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
      </Box>

      {/* Modal de Importação XLS */}
      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="md">Importar Professores via Excel</Heading>
          </ModalHeader>
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                Selecione um arquivo Excel (.xls ou .xlsx) contendo os dados dos professores.
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

export default ProfessoresPage;
