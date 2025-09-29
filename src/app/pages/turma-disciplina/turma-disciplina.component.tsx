import React, { useState, useEffect, useRef } from 'react';
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
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { 
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Link,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Settings,
  ExternalLink,
  Users2
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';

interface Turma {
  id: number;
  nome: string;
  curso?: {
    nome: string;
    codigo: string;
  };
}

interface Disciplina {
  id: number;
  nome: string;
  codigo?: string;
}

interface Professor {
  id: number;
  nome: string;
}

interface PeriodoLetivo {
  id: number;
  nome: string;
  codigo: string;
}

interface TurmaDisciplina {
  id: number;
  turmaId: number;
  turma?: Turma;
  disciplinaId: number;
  disciplina?: Disciplina;
  professorId?: number;
  professor?: Professor;
  periodoLetivoId: number;
  periodoLetivo?: PeriodoLetivo;
  gerenciada: boolean;
  idTurmaDisciplinaGerenciada?: number;
  turmaDisciplinaGerenciada?: TurmaDisciplina;
  integracaoId?: string;
  ativo: boolean;
  nivelEnsino?: string;
}

interface TurmaDisciplinaFormData {
  turmaId: string;
  disciplinaId: string;
  professorId: string;
  periodoLetivoId: string;
  gerenciada: boolean;
  idTurmaDisciplinaGerenciada: string;
  integracaoId: string;
  ativo: boolean;
  nivelEnsino: string;
}

const TurmaDisciplinaPage: React.FC = () => {
  const [turmasDisciplinas, setTurmasDisciplinas] = useState<TurmaDisciplina[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [periodosLetivos, setPeriodosLetivos] = useState<PeriodoLetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingTurmaDisciplina, setEditingTurmaDisciplina] = useState<TurmaDisciplina | null>(null);
  const [formData, setFormData] = useState<TurmaDisciplinaFormData>({
    turmaId: '',
    disciplinaId: '',
    professorId: '',
    periodoLetivoId: '',
    gerenciada: false,
    idTurmaDisciplinaGerenciada: '',
    integracaoId: '',
    ativo: true,
    nivelEnsino: ''
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apiavaliacao.catolicasc.org.br/api';
  const toast = useToast();

  useEffect(() => {
    fetchTurmasDisciplinas();
    fetchTurmas();
    fetchDisciplinas();
    fetchProfessores();
    fetchPeriodosLetivos();
  }, []);

  const fetchTurmasDisciplinas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/TurmaDisciplina`);
      if (response.ok) {
        const data = await response.json();
        setTurmasDisciplinas(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar turmas-disciplinas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar turmas-disciplinas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTurmas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Turma/combo`);
      if (response.ok) {
        const data = await response.json();
        setTurmas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const fetchDisciplinas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Disciplina/combo`);
      if (response.ok) {
        const data = await response.json();
        setDisciplinas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
    }
  };

  const fetchProfessores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Professor/combo`);
      if (response.ok) {
        const data = await response.json();
        setProfessores(data);
      }
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTurmaDisciplina 
        ? `${API_BASE_URL}/TurmaDisciplina/${editingTurmaDisciplina.id}`
        : `${API_BASE_URL}/TurmaDisciplina`;
      
      const method = editingTurmaDisciplina ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingTurmaDisciplina?.id,
        turmaId: parseInt(formData.turmaId),
        disciplinaId: parseInt(formData.disciplinaId),
        professorId: formData.professorId ? parseInt(formData.professorId) : null,
        periodoLetivoId: parseInt(formData.periodoLetivoId),
        idTurmaDisciplinaGerenciada: formData.idTurmaDisciplinaGerenciada ? parseInt(formData.idTurmaDisciplinaGerenciada) : null,
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
          title: 'Sucesso',
          description: editingTurmaDisciplina 
            ? 'Turma-Disciplina atualizada com sucesso!' 
            : 'Turma-Disciplina criada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchTurmasDisciplinas();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao salvar turma-disciplina',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar turma-disciplina',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (turmaDisciplina: TurmaDisciplina) => {
    setEditingTurmaDisciplina(turmaDisciplina);
    setFormData({
      turmaId: turmaDisciplina.turmaId.toString(),
      disciplinaId: turmaDisciplina.disciplinaId.toString(),
      professorId: turmaDisciplina.professorId?.toString() || '',
      periodoLetivoId: turmaDisciplina.periodoLetivoId.toString(),
      gerenciada: turmaDisciplina.gerenciada,
      idTurmaDisciplinaGerenciada: turmaDisciplina.idTurmaDisciplinaGerenciada?.toString() || '',
      integracaoId: turmaDisciplina.integracaoId || '',
      ativo: turmaDisciplina.ativo,
      nivelEnsino: turmaDisciplina.nivelEnsino || ''
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/TurmaDisciplina/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Turma-Disciplina excluída com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchTurmasDisciplinas();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao excluir turma-disciplina',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir turma-disciplina',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleToggleStatus = async (id: number, ativo: boolean) => {
    try {
      const endpoint = ativo ? 'desativar' : 'ativar';
      const response = await fetch(`${API_BASE_URL}/TurmaDisciplina/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: ativo 
            ? 'Turma-Disciplina desativada com sucesso!' 
            : 'Turma-Disciplina ativada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchTurmasDisciplinas();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao alterar status da turma-disciplina',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da turma-disciplina',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      turmaId: '',
      disciplinaId: '',
      professorId: '',
      periodoLetivoId: '',
      gerenciada: false,
      idTurmaDisciplinaGerenciada: '',
      integracaoId: '',
      ativo: true,
      nivelEnsino: ''
    });
    setEditingTurmaDisciplina(null);
  };

  const openNewDialog = () => {
    resetForm();
    onOpen();
  };

  const closeDialog = () => {
    onClose();
    resetForm();
  };

  const openDeleteAlert = (id: number) => {
    setDeleteId(id);
    setIsDeleteAlertOpen(true);
  };

  const closeDeleteAlert = () => {
    setDeleteId(null);
    setIsDeleteAlertOpen(false);
  };

  const confirmDelete = () => {
    if (deleteId) {
      handleDelete(deleteId);
      closeDeleteAlert();
    }
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <MainLayout>
      <Box p={6} maxW="1200px" mx="auto">
      {/* Header */}
      <Flex align="center" justify="space-between" mb={6}>
        <HStack spacing={3}>
          <Box>
            <Heading size="lg" color="gray.900">Turmas-Disciplinas</Heading>
            <Text color="gray.600">Gerencie as relações entre turmas e disciplinas</Text>
          </Box>
        </HStack>
        
        <Button 
          leftIcon={<Plus size={20} />} 
          colorScheme="blue" 
          onClick={openNewDialog}
        >
          Nova Turma-Disciplina
        </Button>
      </Flex>

      {/* Tabela de Turmas-Disciplinas */}
      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Lista de Turmas-Disciplinas</Heading>
        </Box>
        
        {turmasDisciplinas.length === 0 ? (
          <Center py={12} color="gray.500">
            <VStack spacing={4}>
              <Text>Nenhuma turma-disciplina cadastrada</Text>
              <Text fontSize="sm">Clique em "Nova Turma-Disciplina" para começar</Text>
            </VStack>
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Turma</Th>
                <Th>Disciplina</Th>
                <Th>Professor</Th>
                <Th>Período Letivo</Th>
                <Th>Nível de Ensino</Th>
                <Th>Gerenciada</Th>
                <Th>Status</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {turmasDisciplinas.map((turmaDisciplina) => (
                <Tr key={turmaDisciplina.id}>
                  <Td>
                    {turmaDisciplina.turma ? (
                      <HStack spacing={2}>
                        <Users size={16} color="gray.400" />
                        <Text fontSize="sm">{turmaDisciplina.turma.nome}</Text>
                        {turmaDisciplina.turma.curso && (
                          <Text fontSize="xs" color="gray.500">
                            ({turmaDisciplina.turma.curso.codigo})
                          </Text>
                        )}
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Turma não encontrada</Text>
                    )}
                  </Td>
                  <Td>
                    {turmaDisciplina.disciplina ? (
                      <HStack spacing={2}>
                        <BookOpen size={16} color="gray.400" />
                        <Text fontSize="sm">{turmaDisciplina.disciplina.nome}</Text>
                        {turmaDisciplina.disciplina.codigo && (
                          <Text fontSize="xs" color="gray.500">
                            ({turmaDisciplina.disciplina.codigo})
                          </Text>
                        )}
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Disciplina não encontrada</Text>
                    )}
                  </Td>
                  <Td>
                    {turmaDisciplina.professor ? (
                      <HStack spacing={2}>
                        <GraduationCap size={16} color="gray.400" />
                        <Text fontSize="sm">{turmaDisciplina.professor.nome}</Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Não atribuído</Text>
                    )}
                  </Td>
                  <Td>
                    {turmaDisciplina.periodoLetivo ? (
                      <HStack spacing={2}>
                        <Calendar size={16} color="gray.400" />
                        <Text fontSize="sm">{turmaDisciplina.periodoLetivo.codigo} - {turmaDisciplina.periodoLetivo.nome}</Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Período não encontrado</Text>
                    )}
                  </Td>
                  <Td>
                    {turmaDisciplina.nivelEnsino ? (
                      <Badge colorScheme="purple" variant="subtle">
                        {turmaDisciplina.nivelEnsino === 'GraduacaoPresencial' ? 'Graduação Presencial' : 
                         turmaDisciplina.nivelEnsino === 'GraduacaoEAD' ? 'Graduação à Distância (EAD)' : 
                         turmaDisciplina.nivelEnsino}
                      </Badge>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Não informado</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={turmaDisciplina.gerenciada ? "orange" : "blue"}>
                      {turmaDisciplina.gerenciada ? "Gerenciada" : "Normal"}
                    </Badge>
                    {turmaDisciplina.gerenciada && turmaDisciplina.turmaDisciplinaGerenciada && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Consolida: {turmaDisciplina.turmaDisciplinaGerenciada.turma?.nome} - {turmaDisciplina.turmaDisciplinaGerenciada.disciplina?.nome}
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={turmaDisciplina.ativo ? "green" : "gray"}>
                      {turmaDisciplina.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Ações"
                        icon={<ChevronDown size={16} />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(turmaDisciplina)}>
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={<Eye size={16} />} 
                          onClick={() => handleToggleStatus(turmaDisciplina.id, turmaDisciplina.ativo)}
                        >
                          {turmaDisciplina.ativo ? 'Desativar' : 'Ativar'}
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem 
                          icon={<Trash2 size={16} />} 
                          color="red.600"
                          onClick={() => openDeleteAlert(turmaDisciplina.id)}
                        >
                          Excluir
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Modal de Criação/Edição */}
      <Modal isOpen={isOpen} onClose={closeDialog} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingTurmaDisciplina ? 'Editar Turma-Disciplina' : 'Nova Turma-Disciplina'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={6}>
                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Turma *</Text>
                    <Select
                      value={formData.turmaId}
                      onChange={(e) => setFormData({...formData, turmaId: e.target.value})}
                      placeholder="Selecione a turma"
                      required
                    >
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome} {turma.curso && `(${turma.curso.codigo})`}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Disciplina *</Text>
                    <Select
                      value={formData.disciplinaId}
                      onChange={(e) => setFormData({...formData, disciplinaId: e.target.value})}
                      placeholder="Selecione a disciplina"
                      required
                    >
                      {disciplinas.map((disciplina) => (
                        <option key={disciplina.id} value={disciplina.id}>
                          {disciplina.nome} {disciplina.codigo && `(${disciplina.codigo})`}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>

                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Professor</Text>
                    <Select
                      value={formData.professorId}
                      onChange={(e) => setFormData({...formData, professorId: e.target.value})}
                      placeholder="Selecione o professor"
                    >
                      <option value="">Não atribuído</option>
                      {professores.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                          {professor.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Período Letivo *</Text>
                    <Select
                      value={formData.periodoLetivoId}
                      onChange={(e) => setFormData({...formData, periodoLetivoId: e.target.value})}
                      placeholder="Selecione o período letivo"
                      required
                    >
                      {periodosLetivos.map((periodo) => (
                        <option key={periodo.id} value={periodo.id}>
                          {periodo.codigo} - {periodo.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>
                </HStack>

                <Box w="full">
                  <HStack spacing={2} mb={2}>
                    <Checkbox
                      id="gerenciada"
                      checked={formData.gerenciada}
                      onChange={(e) => setFormData({...formData, gerenciada: e.target.checked})}
                    />
                    <Text fontWeight="medium">Turma-Disciplina Gerenciada (Consolidação)</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Marque esta opção se esta turma-disciplina consolida outras turmas com poucos alunos
                  </Text>
                </Box>

                {formData.gerenciada && (
                  <Box w="full">
                    <Text mb={2} fontWeight="medium">Turma-Disciplina Consolidadora</Text>
                    <Select
                      value={formData.idTurmaDisciplinaGerenciada}
                      onChange={(e) => setFormData({...formData, idTurmaDisciplinaGerenciada: e.target.value})}
                      placeholder="Selecione a turma-disciplina que será consolidada"
                    >
                      <option value="">Selecione...</option>
                      {turmasDisciplinas
                        .filter(td => !td.gerenciada && td.id !== editingTurmaDisciplina?.id)
                        .map((td) => (
                          <option key={td.id} value={td.id}>
                            {td.turma?.nome} - {td.disciplina?.nome}
                          </option>
                        ))}
                    </Select>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Selecione qual turma-disciplina será consolidada nesta turma gerenciada
                    </Text>
                  </Box>
                )}

                <Box w="full">
                  <Text mb={2} fontWeight="medium">ID de Integração</Text>
                  <Input
                    value={formData.integracaoId}
                    onChange={(e) => setFormData({...formData, integracaoId: e.target.value})}
                    placeholder="ID do sistema externo"
                  />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Nível de Ensino</Text>
                  <Select
                    value={formData.nivelEnsino}
                    onChange={(e) => setFormData({...formData, nivelEnsino: e.target.value})}
                    placeholder="Selecione o nível de ensino"
                  >
                    <option value="">Selecione...</option>
                    <option value="GraduacaoPresencial">Graduação Presencial</option>
                    <option value="GraduacaoEAD">Graduação à Distância (EAD)</option>
                  </Select>
                </Box>

                <HStack spacing={2} w="full">
                  <Checkbox
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <Text>Turma-Disciplina ativa</Text>
                </HStack>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" colorScheme="blue">
                  {editingTurmaDisciplina ? 'Atualizar' : 'Criar'} Turma-Disciplina
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Alert Dialog de Confirmação de Exclusão */}
      <AlertDialog isOpen={isDeleteAlertOpen} onClose={closeDeleteAlert} leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Confirmar exclusão
          </AlertDialogHeader>
          <AlertDialogBody>
            Tem certeza que deseja excluir esta turma-disciplina? Esta ação não pode ser desfeita.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={closeDeleteAlert}>
              Cancelar
            </Button>
            <Button colorScheme="red" onClick={confirmDelete} ml={3}>
              Excluir
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </Box>
    </MainLayout>
  );
};

export default TurmaDisciplinaPage;
