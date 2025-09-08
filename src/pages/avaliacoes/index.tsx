import React, { useState, useEffect } from 'react';
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
  Center
} from '@chakra-ui/react';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiMoreVertical, 
  FiEye,
  FiUsers,
  FiCalendar,
  FiTarget
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/main-layout.component';

interface Avaliacao {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  tipoItemAvaliado: string;
  nomeItemEspecifico: string;
  totalParticipantes: number;
  totalRespostas: number;
  ativo: boolean;
  dataCriacao: string;
}

const AvaliacoesPage: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avaliacaoParaExcluir, setAvaliacaoParaExcluir] = useState<Avaliacao | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  const carregarAvaliacoes = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementar chamada para API de avaliações
      // const response = await fetch('/api/avaliacoes');
      // const data = await response.json();
      
      // Dados mockados para demonstração
      const mockData: Avaliacao[] = [
        {
          id: 1,
          titulo: 'Avaliação de Professores 2025/1',
          descricao: 'Avaliação dos professores do primeiro semestre de 2025',
          dataInicio: '2025-02-01',
          dataFim: '2025-02-28',
          tipoItemAvaliado: 'Professor',
          nomeItemEspecifico: 'Todos os professores',
          totalParticipantes: 150,
          totalRespostas: 89,
          ativo: true,
          dataCriacao: '2025-01-15'
        },
        {
          id: 2,
          titulo: 'Avaliação de Disciplinas - Engenharia',
          descricao: 'Avaliação das disciplinas do curso de Engenharia',
          dataInicio: '2025-02-15',
          dataFim: '2025-03-15',
          tipoItemAvaliado: 'Disciplina',
          nomeItemEspecifico: 'Disciplinas de Engenharia',
          totalParticipantes: 80,
          totalRespostas: 45,
          ativo: true,
          dataCriacao: '2025-01-20'
        }
      ];
      
      setAvaliacoes(mockData);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as avaliações',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcluir = async () => {
    if (!avaliacaoParaExcluir) return;

    try {
      // TODO: Implementar chamada para API de exclusão
      // await fetch(`/api/avaliacoes/${avaliacaoParaExcluir.id}`, {
      //   method: 'DELETE'
      // });

      setAvaliacoes(prev => prev.filter(a => a.id !== avaliacaoParaExcluir.id));
      toast({
        title: 'Sucesso',
        description: 'Avaliação excluída com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a avaliação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setAvaliacaoParaExcluir(null);
      onClose();
    }
  };

  const getStatusBadge = (avaliacao: Avaliacao) => {
    const hoje = new Date();
    const dataInicio = new Date(avaliacao.dataInicio);
    const dataFim = new Date(avaliacao.dataFim);

    if (!avaliacao.ativo) {
      return <Badge colorScheme="red">Inativa</Badge>;
    }

    if (hoje < dataInicio) {
      return <Badge colorScheme="blue">Pendente</Badge>;
    }

    if (hoje >= dataInicio && hoje <= dataFim) {
      return <Badge colorScheme="green">Ativa</Badge>;
    }

    return <Badge colorScheme="gray">Encerrada</Badge>;
  };

  const getTipoItemBadge = (tipo: string) => {
    const colorMap: { [key: string]: string } = {
      'Professor': 'blue',
      'Disciplina': 'green',
      'TurmaDisciplina': 'purple',
      'Curso': 'orange',
      'Turma': 'teal',
      'Coordenador': 'pink',
      'Estrutura': 'gray'
    };

    return (
      <Badge colorScheme={colorMap[tipo] || 'gray'} variant="subtle">
        {tipo}
      </Badge>
    );
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const calcularTaxaResposta = (participantes: number, respostas: number) => {
    if (participantes === 0) return '0%';
    return `${Math.round((respostas / participantes) * 100)}%`;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <Center h="200px">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        {/* Header */}
        <Box mb={6}>
          <HStack justify="space-between" align="center" mb={4}>
            <Box>
              <Heading size="lg" mb={2}>Avaliações Institucionais</Heading>
              <Text color="gray.600">
                Gerencie todas as avaliações acadêmicas do sistema
              </Text>
            </Box>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={() => navigate('/avaliacoes/criar')}
            >
              Nova Avaliação
            </Button>
          </HStack>
        </Box>

        {/* Tabela de Avaliações */}
        <Box bg={bg} borderRadius="lg" border="1px" borderColor={borderColor} overflow="hidden">
          <Table variant="simple">
            <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
              <Tr>
                <Th>Título</Th>
                <Th>Tipo</Th>
                <Th>Período</Th>
                <Th>Participantes</Th>
                <Th>Taxa Resposta</Th>
                <Th>Status</Th>
                <Th width="100px">Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {avaliacoes.map((avaliacao) => (
                <Tr key={avaliacao.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                  <Td>
                    <Box>
                      <Text fontWeight="semibold" mb={1}>
                        {avaliacao.titulo}
                      </Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {avaliacao.descricao}
                      </Text>
                    </Box>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      {getTipoItemBadge(avaliacao.tipoItemAvaliado)}
                      <Text fontSize="sm" color="gray.600">
                        {avaliacao.nomeItemEspecifico}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <FiCalendar size={14} />
                        <Text fontSize="sm">
                          {formatarData(avaliacao.dataInicio)} - {formatarData(avaliacao.dataFim)}
                        </Text>
                      </HStack>
                    </VStack>
                  </Td>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <FiUsers size={14} />
                        <Text fontSize="sm">
                          {avaliacao.totalParticipantes}
                        </Text>
                      </HStack>
                    </VStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm" fontWeight="medium">
                      {calcularTaxaResposta(avaliacao.totalParticipantes, avaliacao.totalRespostas)}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {avaliacao.totalRespostas} respostas
                    </Text>
                  </Td>
                  <Td>
                    {getStatusBadge(avaliacao)}
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Ações"
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem icon={<FiEye />} onClick={() => navigate(`/avaliacoes/${avaliacao.id}`)}>
                          Visualizar
                        </MenuItem>
                        <MenuItem icon={<FiEdit2 />} onClick={() => navigate(`/avaliacoes/${avaliacao.id}/editar`)}>
                          Editar
                        </MenuItem>
                        <MenuItem 
                          icon={<FiTrash2 />} 
                          color="red.500"
                          onClick={() => {
                            setAvaliacaoParaExcluir(avaliacao);
                            onOpen();
                          }}
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

          {avaliacoes.length === 0 && (
            <Box p={8} textAlign="center">
              <FiTarget size={48} color="gray.400" style={{ margin: '0 auto 16px' }} />
              <Text fontSize="lg" color="gray.500" mb={2}>
                Nenhuma avaliação encontrada
              </Text>
              <Text color="gray.400" mb={4}>
                Comece criando sua primeira avaliação institucional
              </Text>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="blue"
                onClick={() => navigate('/avaliacoes/criar')}
              >
                Criar Primeira Avaliação
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Avaliação
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir a avaliação "{avaliacaoParaExcluir?.titulo}"?
              Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleExcluir} ml={3}>
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </MainLayout>
  );
};

export default AvaliacoesPage;
