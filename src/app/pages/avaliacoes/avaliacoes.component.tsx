import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  Text,
  Badge,
  useToast,
  VStack,
  HStack,
  Flex,
  Heading,
  Spinner,
  Center,
  IconButton,
  FormControl,
  FormLabel,
  Select,
  SimpleGrid,
  Stack,
  ButtonGroup
} from '@chakra-ui/react';
import { 
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Users,
  Target,
  BookOpen,
  GraduationCap,
  Building,
  UserPlus,
  Mail,
  Bell,
  BarChart3
} from 'lucide-react';
import MainLayout from '../../../components/layout/main-layout.component';
import { useGetAvaliacoes, Avaliacao } from '../../services/avaliacao/avaliacao.service.hooks';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';


const AvaliacoesPage: React.FC = () => {
  const { data: avaliacoes, isLoading, refetch } = useGetAvaliacoes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const toast = useToast();
  const navigate = useNavigate();

  const handleEdit = (avaliacao: Avaliacao) => {
    // Navegar para página de edição da avaliação
    navigate(`/avaliacoes/editar/${avaliacao.id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/Questionario/${id}`);

      toast({
        title: 'Sucesso',
        description: 'Avaliação excluída com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao excluir avaliação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };


  const handleSendInvites = async (avaliacaoId: string) => {
    try {
      await api.post(`/Questionario/${avaliacaoId}/gerar-convites`);
      toast({
        title: 'Sucesso',
        description: 'Convites enviados com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar convites',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleSendReminder = async (avaliacaoId: string) => {
    try {
      await api.post(`/ConviteQuestionario/lembrete/questionario/${avaliacaoId}`);
      toast({
        title: 'Sucesso',
        description: 'Lembrete enviado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao enviar lembrete',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const handleView = (avaliacao: Avaliacao) => {
    // Navegar para página de visualização da avaliação
    navigate(`/avaliacoes/${avaliacao.id}`);
  };

  const handleAddParticipants = (avaliacaoId: number) => {
    // Navegar para página de participantes da avaliação
    navigate(`/avaliacoes/${avaliacaoId}/participantes`);
  };

  const handleCreateNew = () => {
    // Navegar para página de criação de avaliação
    navigate('/avaliacoes/criar');
  };

  const handleMonitor = (avaliacaoId: number) => {
    // Implementar acompanhamento da avaliação
    toast({
      title: 'Acompanhar',
      description: `Abrindo acompanhamento da avaliação ${avaliacaoId}`,
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };


  const getIconeTipoItem = (tipo: string) => {
    switch (tipo) {
      case 'Professor': return <Users size={16} color="gray.400" />;
      case 'Disciplina': return <BookOpen size={16} color="gray.400" />;
      case 'TurmaDisciplina': return <Target size={16} color="gray.400" />;
      case 'Curso': return <GraduationCap size={16} color="gray.400" />;
      case 'Turma': return <Users size={16} color="gray.400" />;
      case 'Estrutura': return <Building size={16} color="gray.400" />;
      default: return <Target size={16} color="gray.400" />;
    }
  };


  const filteredAvaliacoes = (avaliacoes || []).filter((avaliacao: Avaliacao) => {
    const matchesSearch = avaliacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (avaliacao.descricao && avaliacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !filterStatus || (filterStatus === 'Ativa' ? avaliacao.ativo : !avaliacao.ativo);
    const matchesTipo = !filterTipo || avaliacao.tipoItemAvaliado === filterTipo;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  if (isLoading) {
    return (
      <MainLayout>
        <Center minH="100vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box p={6} maxW="1200px" mx="auto">
        {/* Header */}
        <Flex align="center" justify="space-between" mb={6}>
          <HStack spacing={3}>
            <Box>
              <Heading size="lg" color="gray.900">Avaliações Institucionais</Heading>
              <Text color="gray.600">Gerencie as avaliações do sistema</Text>
            </Box>
          </HStack>
          
          <Button 
            leftIcon={<Plus size={20} />} 
            colorScheme="blue" 
            onClick={handleCreateNew}
          >
            Nova Avaliação
          </Button>
        </Flex>

        {/* Filtros e Busca */}
        <Box bg="white" rounded="lg" shadow="sm" p={6} mb={6}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl>
              <FormLabel>Buscar</FormLabel>
              <Input
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                placeholder="Todos os status"
              >
                <option value="Ativa">Ativa</option>
                <option value="Inativa">Inativa</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Tipo de Item</FormLabel>
              <Select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                placeholder="Todos os tipos"
              >
                <option value="Professor">Professor</option>
                <option value="Disciplina">Disciplina</option>
                <option value="TurmaDisciplina">Turma/Disciplina</option>
                <option value="Curso">Curso</option>
                <option value="Turma">Turma</option>
                <option value="Estrutura">Estrutura</option>
              </Select>
            </FormControl>
          </SimpleGrid>
        </Box>

        {/* Lista de Avaliações */}
        <Box>
          {filteredAvaliacoes.length === 0 ? (
            <Center py={12} color="gray.500">
              <VStack spacing={4}>
                <Text>Nenhuma avaliação encontrada</Text>
                <Text fontSize="sm">Tente ajustar os filtros ou criar uma nova avaliação</Text>
              </VStack>
            </Center>
          ) : (
            <Stack gap={4}>
              {filteredAvaliacoes.map((avaliacao: Avaliacao) => (
                <Box
                  key={avaliacao.id}
                  borderWidth="1px"
                  borderRadius="md"
                  p={4}
                  bg={avaliacao.ativo ? "green.50" : "white"}
                  borderColor={avaliacao.ativo ? "green.400" : "gray.200"}
                  position="relative"
                >
                  <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
                    <Box flex="1">
                      <HStack mb={1}>
                        <Heading size="md">{avaliacao.titulo}</Heading>
                        {avaliacao.ativo && <Badge colorScheme="green">Ativa</Badge>}
                      </HStack>
                      <Text fontSize="sm" color="gray.600">{avaliacao.descricao || 'Sem descrição'}</Text>
                      <HStack spacing={4} mt={2}>
                        <HStack spacing={2}>
                          {getIconeTipoItem(avaliacao.tipoItemAvaliado || '')}
                          <Text fontSize="xs" color="gray.500">{avaliacao.tipoItemAvaliado || 'N/A'}</Text>
                        </HStack>
                        <HStack spacing={2}>
                          <Calendar size={14} color="gray.400" />
                          <Text fontSize="xs" color="gray.500">
                            {new Date(avaliacao.dataCriacao).toLocaleDateString('pt-BR')}
                          </Text>
                        </HStack>
                        <Text fontSize="xs" color="gray.500">
                          {avaliacao.participantesResponderam || 0}/{avaliacao.totalParticipantes || 0} participantes
                        </Text>
                      </HStack>
                    </Box>
                    
                    <Stack direction={{ base: "column", md: "row" }} spacing={2} align="center">
                      <ButtonGroup size="sm" isAttached variant="ghost">
                        <IconButton 
                          aria-label="Visualizar" 
                          colorScheme="blue" 
                          onClick={() => handleView(avaliacao)}
                          icon={<Eye />}
                        />
                        <IconButton 
                          aria-label="Editar" 
                          colorScheme="blue" 
                          onClick={() => handleEdit(avaliacao)}
                          icon={<Edit />}
                        />
                        <IconButton 
                          aria-label="Excluir" 
                          colorScheme="red" 
                          onClick={() => handleDelete(avaliacao.id)}
                          icon={<Trash2 />}
                        />
                      </ButtonGroup>
                      
                      <ButtonGroup size="sm" spacing={2}>
                        <Button 
                          colorScheme="teal" 
                          variant="solid" 
                          leftIcon={<UserPlus size={16} />}
                          onClick={() => handleAddParticipants(avaliacao.id)}
                        >
                          Adicionar Participantes
                        </Button>
                        <Button 
                          colorScheme="orange" 
                          variant="outline" 
                          leftIcon={<Mail size={16} />}
                          onClick={() => handleSendInvites(avaliacao.id.toString())}
                        >
                          Enviar Convites
                        </Button>
                        <Button 
                          colorScheme="green" 
                          variant="solid" 
                          leftIcon={<Bell size={16} />}
                          onClick={() => handleSendReminder(avaliacao.id.toString())}
                        >
                          Enviar Lembrete
                        </Button>
                        <Button 
                          colorScheme="blue" 
                          variant="outline" 
                          leftIcon={<BarChart3 size={16} />}
                          onClick={() => handleMonitor(avaliacao.id)}
                        >
                          📊 Acompanhar
                        </Button>
                      </ButtonGroup>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

      </Box>
    </MainLayout>
  );
};

export default AvaliacoesPage;
