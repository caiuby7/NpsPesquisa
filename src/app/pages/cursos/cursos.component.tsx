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
  GraduationCap,
  Building,
  Hash
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';
import { ENVIRONMENT } from '../../../config/environment';

interface Instituicao {
  id: number;
  nome: string;
}

interface Curso {
  id: number;
  nome: string;
  descricao?: string;
  codigo: string;
  modalidade: string;
  tipoCurso: string;
  integracaoId?: string;
  codigoFilial?: string;
  ativo: boolean;
  instituicaoId?: number;
  instituicao?: Instituicao;
  dataCadastro: string;
  dataAtualizacao?: string;
}

interface CursoFormData {
  nome: string;
  descricao: string;
  codigo: string;
  modalidade: string;
  tipoCurso: string;
  integracaoId: string;
  codigoFilial: string;
  ativo: boolean;
  instituicaoId: string;
}

const CursosPage: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [formData, setFormData] = useState<CursoFormData>({
    nome: '',
    descricao: '',
    codigo: '',
    modalidade: '',
    tipoCurso: '',
    integracaoId: '',
    codigoFilial: '',
    ativo: true,
    instituicaoId: ''
  });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || ENVIRONMENT.API_URL;
  const toast = useToast();

  useEffect(() => {
    fetchCursos();
    fetchInstituicoes();
  }, []);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/Curso`);
      if (response.ok) {
        const data = await response.json();
        setCursos(data);
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao carregar cursos',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar cursos',
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
      const url = editingCurso 
        ? `${API_BASE_URL}/Curso/${editingCurso.id}`
        : `${API_BASE_URL}/Curso`;
      
      const method = editingCurso ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        id: editingCurso?.id,
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
          title: 'Sucesso',
          description: editingCurso 
            ? 'Curso atualizado com sucesso!' 
            : 'Curso criado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        resetForm();
        fetchCursos();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao salvar curso',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar curso',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleEdit = (curso: Curso) => {
    setEditingCurso(curso);
    setFormData({
      nome: curso.nome,
      descricao: curso.descricao || '',
      codigo: curso.codigo,
      modalidade: curso.modalidade,
      tipoCurso: curso.tipoCurso,
      integracaoId: curso.integracaoId || '',
      codigoFilial: curso.codigoFilial || '',
      ativo: curso.ativo,
      instituicaoId: curso.instituicaoId?.toString() || ''
    });
    onOpen();
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Curso/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Curso excluído com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchCursos();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Erro',
          description: errorData.message || 'Erro ao excluir curso',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir curso',
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
      const response = await fetch(`${API_BASE_URL}/Curso/${id}/${endpoint}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: ativo 
            ? 'Curso desativado com sucesso!' 
            : 'Curso ativado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchCursos();
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao alterar status do curso',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao alterar status do curso',
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
      modalidade: '',
      tipoCurso: '',
      integracaoId: '',
      codigoFilial: '',
      ativo: true,
      instituicaoId: ''
    });
    setEditingCurso(null);
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
            <Heading size="lg" color="gray.900">Cursos</Heading>
            <Text color="gray.600">Gerencie os cursos do sistema</Text>
          </Box>
        </HStack>
        
        <Button 
          leftIcon={<Plus size={20} />} 
          colorScheme="blue" 
          onClick={openNewDialog}
        >
          Novo Curso
        </Button>
      </Flex>

      {/* Tabela de Cursos */}
      <Box bg="white" rounded="lg" shadow="sm" overflow="hidden">
        <Box p={6} borderBottom="1px" borderColor="gray.200">
          <Heading size="md">Lista de Cursos</Heading>
        </Box>
        
        {cursos.length === 0 ? (
          <Center py={12} color="gray.500">
            <VStack spacing={4}>
              <Text>Nenhum curso cadastrado</Text>
              <Text fontSize="sm">Clique em "Novo Curso" para começar</Text>
            </VStack>
          </Center>
        ) : (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Código</Th>
                <Th>Modalidade</Th>
                <Th>Tipo</Th>
                <Th>Instituição</Th>
                <Th>Status</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {cursos.map((curso) => (
                <Tr key={curso.id}>
                  <Td>
                    <HStack spacing={2}>
                      <GraduationCap size={16} color="gray.400" />
                      <Text fontWeight="medium">{curso.nome}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge variant="outline">
                      {curso.codigo}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue" variant="outline">
                      {curso.modalidade}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="green" variant="outline">
                      {curso.tipoCurso}
                    </Badge>
                  </Td>
                  <Td>
                    {curso.instituicao ? (
                      <HStack spacing={2}>
                        <Building size={16} color="gray.400" />
                        <Text fontSize="sm">{curso.instituicao.nome}</Text>
                      </HStack>
                    ) : (
                      <Text fontSize="sm" color="gray.400">Instituição não encontrada</Text>
                    )}
                  </Td>
                  <Td>
                    <Badge colorScheme={curso.ativo ? "green" : "gray"}>
                      {curso.ativo ? "Ativo" : "Inativo"}
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
                        <MenuItem icon={<Edit size={16} />} onClick={() => handleEdit(curso)}>
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={<Eye size={16} />} 
                          onClick={() => handleToggleStatus(curso.id, curso.ativo)}
                        >
                          {curso.ativo ? 'Desativar' : 'Ativar'}
                        </MenuItem>
                        <MenuDivider />
                        <MenuItem 
                          icon={<Trash2 size={16} />} 
                          color="red.600"
                          onClick={() => openDeleteAlert(curso.id)}
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
            {editingCurso ? 'Editar Curso' : 'Novo Curso'}
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
                      placeholder="Nome do curso"
                      required
                    />
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Código *</Text>
                    <Input
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      placeholder="Código do curso"
                      required
                    />
                  </Box>
                </HStack>

                <Box w="full">
                  <Text mb={2} fontWeight="medium">Descrição</Text>
                  <Textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    placeholder="Descrição do curso"
                    rows={3}
                  />
                </Box>

                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Modalidade *</Text>
                    <Select
                      value={formData.modalidade}
                      onChange={(e) => setFormData({...formData, modalidade: e.target.value})}
                      placeholder="Selecione a modalidade"
                      required
                    >
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="EAD">EAD</option>
                    </Select>
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Tipo de Curso *</Text>
                    <Select
                      value={formData.tipoCurso}
                      onChange={(e) => setFormData({...formData, tipoCurso: e.target.value})}
                      placeholder="Selecione o tipo"
                      required
                    >
                      <option value="GRADUACAO">Graduação</option>
                      <option value="POSGRADUACAO">Pós-Graduação</option>
                    </Select>
                  </Box>
                </HStack>

                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">ID de Integração</Text>
                    <Input
                      value={formData.integracaoId}
                      onChange={(e) => setFormData({...formData, integracaoId: e.target.value})}
                      placeholder="ID de integração"
                    />
                  </Box>

                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Código da Filial</Text>
                    <Input
                      value={formData.codigoFilial}
                      onChange={(e) => setFormData({...formData, codigoFilial: e.target.value})}
                      placeholder="Código da filial"
                    />
                  </Box>
                </HStack>

                <HStack spacing={4} w="full">
                  <Box flex={1}>
                    <Text mb={2} fontWeight="medium">Instituição</Text>
                    <Select
                      value={formData.instituicaoId}
                      onChange={(e) => setFormData({...formData, instituicaoId: e.target.value})}
                      placeholder="Selecione a instituição"
                    >
                      <option value="">Sem instituição</option>
                      {instituicoes.map((instituicao) => (
                        <option key={instituicao.id} value={instituicao.id}>
                          {instituicao.nome}
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <Box flex={1}>
                    <HStack spacing={2} w="full">
                      <input
                        type="checkbox"
                        id="ativo"
                        checked={formData.ativo}
                        onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                      />
                      <Text>Curso ativo</Text>
                    </HStack>
                  </Box>
                </HStack>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button type="submit" colorScheme="blue">
                  {editingCurso ? 'Atualizar' : 'Criar'} Curso
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
            Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.
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

export default CursosPage;
