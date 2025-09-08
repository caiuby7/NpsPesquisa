import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text, 
  Textarea,
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
  Building2,
  FileText
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';

interface Instituicao {
  id: number;
  nome: string;
  descricao?: string;
  integracaoId: number;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao?: string;
}

interface InstituicaoFormData {
  nome: string;
  descricao: string;
  integracaoId: number;
}

const InstituicoesPage: React.FC = () => {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingInstituicao, setEditingInstituicao] = useState<Instituicao | null>(null);
  const [formData, setFormData] = useState<InstituicaoFormData>({
    nome: '',
    descricao: '',
    integracaoId: 0
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const toast = useToast();

  useEffect(() => {
    fetchInstituicoes();
  }, []);

  const fetchInstituicoes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Instituicao`);
      if (response.ok) {
        const data = await response.json();
        setInstituicoes(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar instituições',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar instituições',
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
      const url = editingInstituicao 
        ? `${API_BASE_URL}/Instituicao/${editingInstituicao.id}`
        : `${API_BASE_URL}/Instituicao`;
      
      const method = editingInstituicao ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingInstituicao?.id,
        ativo: true
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
          description: editingInstituicao 
            ? 'Instituição atualizada com sucesso!' 
            : 'Instituição criada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchInstituicoes();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao salvar instituição',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar instituição',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (instituicao: Instituicao) => {
    setEditingInstituicao(instituicao);
    setFormData({
      nome: instituicao.nome || '',
      descricao: instituicao.descricao || '',
      integracaoId: instituicao.integracaoId || 0
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Instituicao/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Instituição excluída com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchInstituicoes();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao excluir instituição',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir instituição',
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
      const response = await fetch(`${API_BASE_URL}/Instituicao/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: ativo 
            ? 'Instituição desativada com sucesso!' 
            : 'Instituição ativada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchInstituicoes();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao alterar status da instituição',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status da instituição',
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
      integracaoId: 0
    });
    setEditingInstituicao(null);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
            <Heading size="lg" color="gray.900">Instituições</Heading>
            <Text color="gray.600">Gerencie as instituições do sistema</Text>
          </Box>
        </HStack>
        
        <Button 
          leftIcon={<Plus size={20} />} 
          colorScheme="blue" 
          onClick={openNewDialog}
        >
          Nova Instituição
        </Button>
      </Flex>

      {/* Tabela de Instituições */}
      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Lista de Instituições</Heading>
        </Box>
        
        {instituicoes.length === 0 ? (
          <Center py={12} color="gray.500">
            <VStack spacing={4}>
              <Text>Nenhuma instituição cadastrada</Text>
              <Text fontSize="sm">Clique em "Nova Instituição" para começar</Text>
            </VStack>
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Descrição</Th>
                <Th>ID Integração</Th>
                <Th>Data Cadastro</Th>
                <Th>Status</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {instituicoes.map((instituicao) => (
                <Tr key={instituicao.id}>
                  <Td>
                    <HStack spacing={2}>
                      <Building2 size={16} color="gray.400" />
                      <Text fontWeight="medium">{instituicao.nome}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    {instituicao.descricao ? (
                      <HStack spacing={2}>
                        <FileText size={16} color="gray.400" />
                        <Text fontSize="sm" maxW="xs" isTruncated>
                          {instituicao.descricao}
                        </Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Sem descrição</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge variant="outline">
                      {instituicao.integracaoId || 'N/A'}
                    </Badge>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {formatDate(instituicao.dataCadastro)}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={instituicao.ativo ? "green" : "gray"}>
                      {instituicao.ativo ? "Ativa" : "Inativa"}
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
                        <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(instituicao)}>
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={<Eye size={16} />} 
                          onClick={() => handleToggleStatus(instituicao.id, instituicao.ativo)}
                        >
                          {instituicao.ativo ? 'Desativar' : 'Ativar'}
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem 
                          icon={<Trash2 size={16} />} 
                          color="red.600"
                          onClick={() => openDeleteAlert(instituicao.id)}
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
            {editingInstituicao ? 'Editar Instituição' : 'Nova Instituição'}
          </ModalHeader>
          <ModalCloseButton />
          
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <VStack spacing={6}>
                <Box w="full">
                  <Text mb={2} fontWeight="medium">Nome *</Text>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    placeholder="Nome da instituição"
                    required
                  />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Descrição</Text>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descrição da instituição"
                    rows={3}
                  />
                </Box>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">ID de Integração</Text>
                  <Input
                    type="number"
                    value={formData.integracaoId}
                    onChange={(e) => setFormData({...formData, integracaoId: parseInt(e.target.value) || 0})}
                    placeholder="ID do sistema externo"
                  />
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" colorScheme="blue">
                  {editingInstituicao ? 'Atualizar' : 'Criar'} Instituição
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
            Tem certeza que deseja excluir esta instituição? Esta ação não pode ser desfeita.
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

export default InstituicoesPage;
