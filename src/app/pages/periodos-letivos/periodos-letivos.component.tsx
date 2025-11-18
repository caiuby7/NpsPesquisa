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
  Calendar,
  GraduationCap
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';
import { ENVIRONMENT } from '../../../config/environment';

interface PeriodoLetivo {
  id: number;
  nome: string;
  codigo: string;
  tipoCurso: string;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao: string;
}

interface PeriodoLetivoFormData {
  nome: string;
  codigo: string;
  tipoCurso: string;
  ativo: boolean;
}

const PeriodosLetivosPage: React.FC = () => {
  const [periodosLetivos, setPeriodosLetivos] = useState<PeriodoLetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingPeriodoLetivo, setEditingPeriodoLetivo] = useState<PeriodoLetivo | null>(null);
  const [formData, setFormData] = useState<PeriodoLetivoFormData>({
    nome: '',
    codigo: '',
    tipoCurso: '',
    ativo: true
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || ENVIRONMENT.API_URL;
  const toast = useToast();

  useEffect(() => {
    fetchPeriodosLetivos();
  }, []);

  const fetchPeriodosLetivos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/PeriodoLetivo`);
      if (response.ok) {
        const data = await response.json();
        setPeriodosLetivos(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar períodos letivos',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar períodos letivos',
        status: 'error',
        duration: 3000,
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
      const url = editingPeriodoLetivo 
        ? `${API_BASE_URL}/PeriodoLetivo/${editingPeriodoLetivo.id}`
        : `${API_BASE_URL}/PeriodoLetivo`;
      
      const method = editingPeriodoLetivo ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingPeriodoLetivo?.id,
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
          description: editingPeriodoLetivo 
            ? 'Período letivo atualizado com sucesso!' 
            : 'Período letivo criado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchPeriodosLetivos();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao salvar período letivo',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar período letivo',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (periodoLetivo: PeriodoLetivo) => {
    setEditingPeriodoLetivo(periodoLetivo);
    setFormData({
      nome: periodoLetivo.nome,
      codigo: periodoLetivo.codigo,
      tipoCurso: periodoLetivo.tipoCurso,
      ativo: periodoLetivo.ativo
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/PeriodoLetivo/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Período letivo excluído com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPeriodosLetivos();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao excluir período letivo',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir período letivo',
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
      const response = await fetch(`${API_BASE_URL}/PeriodoLetivo/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: ativo 
            ? 'Período letivo desativado com sucesso!' 
            : 'Período letivo ativado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchPeriodosLetivos();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao alterar status do período letivo',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do período letivo',
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
      codigo: '',
      tipoCurso: '',
      ativo: true
    });
    setEditingPeriodoLetivo(null);
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
            <Heading size="lg" color="gray.900">Períodos Letivos</Heading>
            <Text color="gray.600">Gerencie os períodos letivos do sistema</Text>
          </Box>
        </HStack>
        
        <Button 
          leftIcon={<Plus size={20} />} 
          colorScheme="blue" 
          onClick={openNewDialog}
        >
          Novo Período Letivo
        </Button>
      </Flex>

      {/* Tabela de Períodos Letivos */}
      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Lista de Períodos Letivos</Heading>
        </Box>
        
        {periodosLetivos.length === 0 ? (
          <Center py={12} color="gray.500">
            <VStack spacing={4}>
              <Text>Nenhum período letivo cadastrado</Text>
              <Text fontSize="sm">Clique em "Novo Período Letivo" para começar</Text>
            </VStack>
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Código</Th>
                <Th>Tipo de Curso</Th>
                <Th>Status</Th>
                <Th>Data Cadastro</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {periodosLetivos.map((periodoLetivo) => (
                <Tr key={periodoLetivo.id}>
                  <Td>
                    <HStack spacing={2}>
                      <Calendar size={16} color="gray.400" />
                      <Text fontWeight="medium">{periodoLetivo.nome}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge variant="outline">
                      {periodoLetivo.codigo}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <GraduationCap size={16} color="gray.400" />
                      <Text fontSize="sm">{periodoLetivo.tipoCurso}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={periodoLetivo.ativo ? "green" : "gray"}>
                      {periodoLetivo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {new Date(periodoLetivo.dataCadastro).toLocaleDateString('pt-BR')}
                    </Text>
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
                        <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(periodoLetivo)}>
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={<Eye size={16} />} 
                          onClick={() => handleToggleStatus(periodoLetivo.id, periodoLetivo.ativo)}
                        >
                          {periodoLetivo.ativo ? 'Desativar' : 'Ativar'}
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem 
                          icon={<Trash2 size={16} />} 
                          color="red.600"
                          onClick={() => openDeleteAlert(periodoLetivo.id)}
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
            {editingPeriodoLetivo ? 'Editar Período Letivo' : 'Novo Período Letivo'}
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
                      placeholder="Ex: 2025.1, 2024.2"
                      required
                    />
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Código *</Text>
                    <Input
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      placeholder="Ex: 2025.1, 2024.2"
                      required
                    />
                  </Box>
                </HStack>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Tipo de Curso *</Text>
                  <Select
                    value={formData.tipoCurso}
                    onChange={(e) => setFormData({...formData, tipoCurso: e.target.value})}
                    placeholder="Selecione o tipo de curso"
                    required
                  >
                    <option value="Graduação">Graduação</option>
                    <option value="Pós-Graduação">Pós-Graduação</option>
                    <option value="Técnico">Técnico</option>
                    <option value="EJA">EJA</option>
                    <option value="Outros">Outros</option>
                  </Select>
                </Box>

                <HStack spacing={2} w="full">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <Text>Período letivo ativo</Text>
                </HStack>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" colorScheme="blue">
                  {editingPeriodoLetivo ? 'Atualizar' : 'Criar'} Período Letivo
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
            Tem certeza que deseja excluir este período letivo? Esta ação não pode ser desfeita.
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

export default PeriodosLetivosPage;
