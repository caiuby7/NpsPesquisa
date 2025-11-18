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
  Eye
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';
import { ENVIRONMENT } from '../../../config/environment';

interface Curso {
  id: number;
  nome: string;
  codigo: string;
}

interface PeriodoLetivo {
  id: number;
  nome: string;
  codigo: string;
}

interface Turma {
  id: number;
  nome: string;
  descricao?: string;
  cursoId: number;
  curso?: Curso;
  periodoLetivoId: number;
  periodoLetivo?: PeriodoLetivo;
  turno?: number;
  integracaoId?: string;
  ativo: boolean;
}

interface TurmaFormData {
  nome: string;
  descricao: string;
  cursoId: string;
  periodoLetivoId: string;
  turno: string;
  integracaoId: string;
  ativo: boolean;
}

const TurmasPage: React.FC = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [periodosLetivos, setPeriodosLetivos] = useState<PeriodoLetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState<TurmaFormData>({
    nome: '',
    descricao: '',
    cursoId: '',
    periodoLetivoId: '',
    turno: '',
    integracaoId: '',
    ativo: true
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const API_BASE_URL = process.env.REACT_APP_API_URL || ENVIRONMENT.API_URL;

  useEffect(() => {
    fetchTurmas();
    fetchCursos();
    fetchPeriodosLetivos();
  }, []);

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Turma`);
      if (response.ok) {
        const data = await response.json();
        setTurmas(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar turmas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar turmas',
        status: 'error',
        duration: 3000,
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
      const url = editingTurma 
        ? `${API_BASE_URL}/Turma/${editingTurma.id}`
        : `${API_BASE_URL}/Turma`;
      
      const method = editingTurma ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingTurma?.id,
        cursoId: parseInt(formData.cursoId),
        periodoLetivoId: parseInt(formData.periodoLetivoId),
        turno: formData.turno ? parseInt(formData.turno) : null,
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
          description: editingTurma 
            ? 'Turma atualizada com sucesso!' 
            : 'Turma criada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchTurmas();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao salvar turma',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar turma',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome || '',
      descricao: turma.descricao || '',
      cursoId: turma.cursoId.toString(),
      periodoLetivoId: turma.periodoLetivoId.toString(),
      turno: turma.turno?.toString() || '',
      integracaoId: turma.integracaoId || '',
      ativo: turma.ativo
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Turma/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Turma excluída com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchTurmas();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao excluir turma',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir turma',
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
      const response = await fetch(`${API_BASE_URL}/Turma/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: ativo 
            ? 'Turma desativada com sucesso!' 
            : 'Turma ativada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchTurmas();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao alterar status da turma',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da turma',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      cursoId: '',
      periodoLetivoId: '',
      turno: '',
      integracaoId: '',
      ativo: true
    });
    setEditingTurma(null);
  };

  const openNewDialog = () => {
    resetForm();
    onOpen();
  };

  const closeDialog = () => {
    onClose();
    resetForm();
  };

  const getTurnoLabel = (turno?: number) => {
    if (!turno) return 'Não informado';
    const turnos = {
      1: 'Manhã',
      2: 'Tarde',
      3: 'Noite'
    };
    return turnos[turno as keyof typeof turnos] || 'Não informado';
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
            <Heading size="lg" color="gray.900">Turmas</Heading>
            <Text color="gray.600">Gerencie as turmas do sistema</Text>
          </Box>
        </HStack>
        
        <Button 
          leftIcon={<Plus size={20} />} 
          colorScheme="blue" 
          onClick={openNewDialog}
        >
          Nova Turma
        </Button>
      </Flex>

      {/* Tabela de Turmas */}
      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Lista de Turmas</Heading>
        </Box>
        
        {turmas.length === 0 ? (
          <Center py={12} color="gray.500">
            <VStack spacing={4}>
              <Text>Nenhuma turma cadastrada</Text>
              <Text fontSize="sm">Clique em "Nova Turma" para começar</Text>
            </VStack>
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Curso</Th>
                <Th>Período Letivo</Th>
                <Th>Turno</Th>
                <Th>Status</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {turmas.map((turma) => (
                <Tr key={turma.id}>
                  <Td>
                    <Box>
                      <Text fontWeight="medium">{turma.nome}</Text>
                      {turma.descricao && (
                        <Text fontSize="sm" color="gray.500" maxW="xs" isTruncated>
                          {turma.descricao}
                        </Text>
                      )}
                    </Box>
                  </Td>
                  <Td>
                    {turma.curso ? (
                      <Text fontSize="sm">{turma.curso.codigo} - {turma.curso.nome}</Text>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Curso não encontrado</Text>
                    )}
                  </Td>
                  <Td>
                    {turma.periodoLetivo ? (
                      <Text fontSize="sm">{turma.periodoLetivo.codigo} - {turma.periodoLetivo.nome}</Text>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Período não encontrado</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge variant="outline">
                      {getTurnoLabel(turma.turno)}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={turma.ativo ? "green" : "gray"}>
                      {turma.ativo ? "Ativa" : "Inativa"}
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
                        <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(turma)}>
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={<Eye size={16} />} 
                          onClick={() => handleToggleStatus(turma.id, turma.ativo)}
                        >
                          {turma.ativo ? 'Desativar' : 'Ativar'}
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem 
                          icon={<Trash2 size={16} />} 
                          color="red.600"
                          onClick={() => handleDelete(turma.id)}
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
            {editingTurma ? 'Editar Turma' : 'Nova Turma'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={6}>
                {/* Informações Básicas */}
                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Nome *</Text>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Ex: Turma A"
                      required
                    />
                  </Box>
                  
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Turno</Text>
                    <Select
                      value={formData.turno}
                      onChange={(e) => setFormData({...formData, turno: e.target.value})}
                      placeholder="Selecione o turno"
                    >
                      <option value="">Não informado</option>
                      <option value="1">Manhã</option>
                      <option value="2">Tarde</option>
                      <option value="3">Noite</option>
                    </Select>
                  </Box>
                </HStack>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Descrição</Text>
                  <Input
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descrição da turma"
                  />
                </Box>

                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Curso *</Text>
                    <Select
                      value={formData.cursoId}
                      onChange={(e) => setFormData({...formData, cursoId: e.target.value})}
                      placeholder="Selecione o curso"
                      required
                    >
                      {cursos.map((curso) => (
                        <option key={curso.id} value={curso.id}>
                          {curso.codigo} - {curso.nome}
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
                  <Text mb={2} fontWeight="medium">ID de Integração</Text>
                  <Input
                    value={formData.integracaoId}
                    onChange={(e) => setFormData({...formData, integracaoId: e.target.value})}
                    placeholder="ID do sistema externo"
                  />
                </Box>

                <HStack spacing={2} w="full">
                  <Checkbox
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <Text>Turma ativa</Text>
                </HStack>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" colorScheme="blue">
                  {editingTurma ? 'Atualizar' : 'Criar'} Turma
                </Button>
              </HStack>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      </Box>
    </MainLayout>
  );
};

export default TurmasPage;
