import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  Textarea,
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
  BookOpen,
  Building
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';

interface Instituicao {
  id: number;
  nome: string;
}

interface Disciplina {
  id: number;
  nome: string;
  descricao?: string;
  codigo?: string;
  ativo: boolean;
  idInstituicao: number;
  instituicao?: Instituicao;
}

interface DisciplinaFormData {
  nome: string;
  descricao: string;
  codigo: string;
  ativo: boolean;
  instituicaoId: string;
}

const DisciplinasPage: React.FC = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingDisciplina, setEditingDisciplina] = useState<Disciplina | null>(null);
  const [formData, setFormData] = useState<DisciplinaFormData>({
    nome: '',
    descricao: '',
    codigo: '',
    ativo: true,
    instituicaoId: ''
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const toast = useToast();

  useEffect(() => {
    fetchDisciplinas();
    fetchInstituicoes();
  }, []);

  const fetchDisciplinas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Disciplina`);
      if (response.ok) {
        const data = await response.json();
        setDisciplinas(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar disciplinas',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar disciplinas',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
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
      const url = editingDisciplina 
        ? `${API_BASE_URL}/Disciplina/${editingDisciplina.id}`
        : `${API_BASE_URL}/Disciplina`;
      
      const method = editingDisciplina ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingDisciplina?.id,
        idInstituicao: parseInt(formData.instituicaoId),
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
          description: editingDisciplina 
            ? 'Disciplina atualizada com sucesso!' 
            : 'Disciplina criada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchDisciplinas();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao salvar disciplina',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar disciplina',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (disciplina: Disciplina) => {
    setEditingDisciplina(disciplina);
    setFormData({
      nome: disciplina.nome || '',
      descricao: disciplina.descricao || '',
      codigo: disciplina.codigo || '',
      ativo: disciplina.ativo,
      instituicaoId: disciplina.idInstituicao.toString()
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Disciplina/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Disciplina excluída com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchDisciplinas();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao excluir disciplina',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir disciplina',
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
      const response = await fetch(`${API_BASE_URL}/Disciplina/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: ativo 
            ? 'Disciplina desativada com sucesso!' 
            : 'Disciplina ativada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchDisciplinas();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao alterar status da disciplina',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da disciplina',
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
      codigo: '',
      ativo: true,
      instituicaoId: ''
    });
    setEditingDisciplina(null);
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
            <Heading size="lg" color="gray.900">Disciplinas</Heading>
            <Text color="gray.600">Gerencie as disciplinas do sistema</Text>
          </Box>
        </HStack>
        
        <Button 
          leftIcon={<Plus size={20} />} 
          colorScheme="blue" 
          onClick={openNewDialog}
        >
          Nova Disciplina
        </Button>
      </Flex>

      {/* Tabela de Disciplinas */}
      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Lista de Disciplinas</Heading>
        </Box>
        
        {disciplinas.length === 0 ? (
          <Center py={12} color="gray.500">
            <VStack spacing={4}>
              <Text>Nenhuma disciplina cadastrada</Text>
              <Text fontSize="sm">Clique em "Nova Disciplina" para começar</Text>
            </VStack>
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Código</Th>
                <Th>Descrição</Th>
                <Th>Instituição</Th>
                <Th>Status</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {disciplinas.map((disciplina) => (
                <Tr key={disciplina.id}>
                  <Td>
                    <HStack spacing={2}>
                      <BookOpen size={16} color="gray.400" />
                      <Text fontWeight="medium">{disciplina.nome}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    {disciplina.codigo ? (
                      <Badge variant="outline">
                        {disciplina.codigo}
                      </Badge>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Sem código</Text>
                    )}
                  </Td>
                  <Td>
                    {disciplina.descricao ? (
                      <Text fontSize="sm" maxW="xs" isTruncated>
                        {disciplina.descricao}
                      </Text>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Sem descrição</Text>
                    )}
                  </Td>
                  <Td>
                    {disciplina.instituicao ? (
                      <HStack spacing={2}>
                        <Building size={16} color="gray.400" />
                        <Text fontSize="sm">{disciplina.instituicao.nome}</Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Instituição não encontrada</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={disciplina.ativo ? "green" : "gray"}>
                      {disciplina.ativo ? "Ativa" : "Inativa"}
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
                        <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(disciplina)}>
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={<Eye size={16} />} 
                          onClick={() => handleToggleStatus(disciplina.id, disciplina.ativo)}
                        >
                          {disciplina.ativo ? 'Desativar' : 'Ativar'}
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem 
                          icon={<Trash2 size={16} />} 
                          color="red.600"
                          onClick={() => openDeleteAlert(disciplina.id)}
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
            {editingDisciplina ? 'Editar Disciplina' : 'Nova Disciplina'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={6}>
                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Nome *</Text>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      placeholder="Nome da disciplina"
                      required
                    />
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Código</Text>
                    <Input
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      placeholder="Código da disciplina"
                    />
                  </Box>
                </HStack>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Descrição</Text>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descrição da disciplina"
                    rows={3}
                  />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Instituição *</Text>
                  <Select
                    value={formData.instituicaoId}
                    onChange={(e) => setFormData({...formData, instituicaoId: e.target.value})}
                    placeholder="Selecione a instituição"
                    required
                  >
                    {instituicoes.map((instituicao) => (
                      <option key={instituicao.id} value={instituicao.id}>
                        {instituicao.nome}
                      </option>
                    ))}
                  </Select>
                </Box>

                <HStack spacing={2} w="full">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <Text>Disciplina ativa</Text>
                </HStack>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" colorScheme="blue">
                  {editingDisciplina ? 'Atualizar' : 'Criar'} Disciplina
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
            Tem certeza que deseja excluir esta disciplina? Esta ação não pode ser desfeita.
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

export default DisciplinasPage;
