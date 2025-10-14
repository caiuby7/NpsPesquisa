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
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
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
  BarChart3,
  Copy,
  User
} from 'lucide-react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import MainLayout from '../../../components/layout/main-layout.component';
import { useGetAvaliacoes, Avaliacao } from '../../services/avaliacao/avaliacao.service.hooks';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Registrar componentes do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const AvaliacoesPage: React.FC = () => {
  const { data: avaliacoes, isLoading, refetch } = useGetAvaliacoes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [avaliacaoParaCopiar, setAvaliacaoParaCopiar] = useState<Avaliacao | null>(null);
  const [copyForm, setCopyForm] = useState({
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    instituicaoId: ''
  });
  const [instituicoes, setInstituicoes] = useState([]);
  const [isCopyLoading, setIsCopyLoading] = useState(false);
  
  // Estado para modal de acompanhamento
  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<string>('');
  const [loadingParcial, setLoadingParcial] = useState(false);
  const [parcial, setParcial] = useState<any>(null);

  const { isOpen: isCopyModalOpen, onOpen: onCopyModalOpen, onClose: onCopyModalClose } = useDisclosure();
  const { isOpen: isAcompanhamentoOpen, onOpen: onAcompanhamentoOpen, onClose: onAcompanhamentoClose } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();

  React.useEffect(() => {
    carregarInstituicoes();
  }, []);

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

  const handleMonitor = async (avaliacaoId: number) => {
    setSelectedAvaliacaoId(avaliacaoId.toString());
    setLoadingParcial(true);
    onAcompanhamentoOpen();
    
    try {
      const { data } = await api.get(`/Questionario/${avaliacaoId}/parcial-convites`);
      setParcial(data);
    } catch (e) {
      setParcial(null);
    }
    setLoadingParcial(false);
  };

  const handleCopy = (avaliacao: Avaliacao) => {
    setAvaliacaoParaCopiar(avaliacao);
    setCopyForm({
      titulo: `${avaliacao.titulo} (Cópia)`,
      descricao: avaliacao.descricao || '',
      dataInicio: '',
      dataFim: '',
      instituicaoId: ''
    });
    onCopyModalOpen();
  };

  const carregarInstituicoes = async () => {
    try {
      const response = await api.get('/Instituicao');
      setInstituicoes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar instituições:', error);
    }
  };

  const handleCopySubmit = async () => {
    if (!avaliacaoParaCopiar) return;

    if (!copyForm.titulo || !copyForm.dataInicio || !copyForm.dataFim || !copyForm.instituicaoId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha todos os campos obrigatórios.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsCopyLoading(true);
      const response = await api.post(`/Questionario/${avaliacaoParaCopiar.id}/copiar`, {
        titulo: copyForm.titulo,
        descricao: copyForm.descricao,
        dataInicio: copyForm.dataInicio,
        dataFim: copyForm.dataFim,
        instituicaoId: parseInt(copyForm.instituicaoId)
      });

      toast({
        title: 'Sucesso',
        description: 'Avaliação copiada com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onCopyModalClose();
      refetch();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao copiar avaliação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setIsCopyLoading(false);
    }
  };


  const getIconeTipoItem = (tipo: string) => {
    switch (tipo) {
      case 'Professor': return <Users size={16} color="gray.400" />;
      case 'Disciplina': return <BookOpen size={16} color="gray.400" />;
      case 'TurmaDisciplina': return <Target size={16} color="gray.400" />;
      case 'Curso': return <GraduationCap size={16} color="gray.400" />;
      case 'Turma': return <Users size={16} color="gray.400" />;
      case 'Estrutura': return <Building size={16} color="gray.400" />;
      case 'ProjetoExtensionista': return <Target size={16} color="gray.400" />;
      case 'PACExtensionista': return <Target size={16} color="gray.400" />;
      case 'Estagio': return <Target size={16} color="gray.400" />;
      case 'TCC': return <Target size={16} color="gray.400" />;
      case 'Coordenador': return <Users size={16} color="gray.400" />;
      case 'Alunos': return <Users size={16} color="gray.400" />;
      case 'Infraestrutura': return <Building size={16} color="gray.400" />;
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
                <option value="Estagio">Estágio</option>
                <option value="TCC">TCC</option>
                <option value="ProjetoExtensionista">Projeto Extensionista</option>
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
                  <HStack spacing={6} align="start" h="full">
                    {/* Coluna Esquerda - Informações */}
                    <VStack spacing={4} align="start" flex="1">
                      {/* Cabeçalho */}
                      <VStack align="start" spacing={2}>
                        <HStack>
                          <Heading size="md">{avaliacao.titulo}</Heading>
                          {avaliacao.ativo && <Badge colorScheme="green">Ativa</Badge>}
                        </HStack>
                        <Text fontSize="sm" color="gray.600">{avaliacao.descricao || 'Sem descrição'}</Text>
                      </VStack>

                      {/* Metadados */}
                      <Box 
                        p={4} 
                        w="full"
                      >
                        <VStack spacing={3} align="start">
                          {/* Tipo de Item Avaliado */}
                          <HStack spacing={3} align="center">
                            {getIconeTipoItem(avaliacao.tipoItemAvaliado || '')}
                            <Text fontSize="sm" color="gray.700">
                              <Text as="span" fontSize="xs" color="gray.500" fontWeight="medium">
                                Tipo:
                              </Text>{' '}
                              {avaliacao.tipoItemAvaliado || 'N/A'}
                            </Text>
                          </HStack>
                          
                          {/* Instituição */}
                          <HStack spacing={3} align="center">
                            <Building size={16} color="gray.500" />
                            <Text fontSize="sm" color="gray.700">
                              <Text as="span" fontSize="xs" color="gray.500" fontWeight="medium">
                                Instituição:
                              </Text>{' '}
                              {avaliacao.nomeInstituicao || 'Instituição não definida'}
                            </Text>
                          </HStack>
                          
                          {/* Nível de Ensino */}
                          <HStack spacing={3} align="center">
                            <GraduationCap size={16} color="gray.500" />
                            <Text fontSize="sm" color="gray.700">
                              <Text as="span" fontSize="xs" color="gray.500" fontWeight="medium">
                                Nível de Ensino:
                              </Text>{' '}
                              {avaliacao.nivelEnsino?.nome || avaliacao.nomeNivelEnsino || 'Não informado'}
                            </Text>
                          </HStack>
                          
                          {/* Data de Criação */}
                          <HStack spacing={3} align="center">
                            <Calendar size={16} color="gray.500" />
                            <Text fontSize="sm" color="gray.700">
                              <Text as="span" fontSize="xs" color="gray.500" fontWeight="medium">
                                Data de Criação:
                              </Text>{' '}
                              {new Date(avaliacao.dataCriacao).toLocaleDateString('pt-BR')}
                            </Text>
                          </HStack>
                          
                          {/* Participantes */}
                          <HStack spacing={3} align="center">
                            <User size={16} color="gray.500" />
                            <Text fontSize="sm" color="gray.700">
                              <Text as="span" fontSize="xs" color="gray.500" fontWeight="medium">
                                Participantes:
                              </Text>{' '}
                              {avaliacao.totalRespostas}/{avaliacao.totalParticipantes} participantes
                            </Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </VStack>

                    {/* Coluna Direita - Ações */}
                    <VStack spacing={4} align="center" minW="280px">
                      {/* Ícones de Ação */}
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
                          aria-label="Copiar" 
                          colorScheme="purple" 
                          onClick={() => handleCopy(avaliacao)}
                          icon={<Copy />}
                        />
                        <IconButton 
                          aria-label="Excluir" 
                          colorScheme="red" 
                          onClick={() => handleDelete(avaliacao.id)}
                          icon={<Trash2 />}
                        />
                      </ButtonGroup>

                      {/* Botões de Ação - Centralizados */}
                      <VStack spacing={3} align="stretch" w="full">
                        <Button 
                          colorScheme="teal" 
                          variant="solid" 
                          size="sm"
                          leftIcon={<UserPlus size={16} />}
                          onClick={() => handleAddParticipants(avaliacao.id)}
                          w="full"
                        >
                          Adicionar Participantes
                        </Button>
                        <Button 
                          colorScheme="orange" 
                          variant="outline" 
                          size="sm"
                          leftIcon={<Mail size={16} />}
                          onClick={() => handleSendInvites(avaliacao.id.toString())}
                          w="full"
                        >
                          Enviar Convites
                        </Button>
                        <Button 
                          colorScheme="green" 
                          variant="solid" 
                          size="sm"
                          leftIcon={<Bell size={16} />}
                          onClick={() => handleSendReminder(avaliacao.id.toString())}
                          w="full"
                        >
                          Enviar Lembrete
                        </Button>
                        <Button 
                          colorScheme="blue" 
                          variant="outline" 
                          size="sm"
                          leftIcon={<BarChart3 size={16} />}
                          onClick={() => handleMonitor(avaliacao.id)}
                          w="full"
                        >
                          📊 Acompanhar
                        </Button>
                      </VStack>
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </Stack>
          )}
        </Box>

        {/* Modal de Cópia de Avaliação */}
        <Modal isOpen={isCopyModalOpen} onClose={onCopyModalClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Copiar Avaliação</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Título da Nova Avaliação</FormLabel>
                  <Input
                    value={copyForm.titulo}
                    onChange={(e) => setCopyForm({...copyForm, titulo: e.target.value})}
                    placeholder="Digite o título da nova avaliação"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Descrição</FormLabel>
                  <Input
                    value={copyForm.descricao}
                    onChange={(e) => setCopyForm({...copyForm, descricao: e.target.value})}
                    placeholder="Digite a descrição"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Instituição</FormLabel>
                  <Select
                    value={copyForm.instituicaoId}
                    onChange={(e) => setCopyForm({...copyForm, instituicaoId: e.target.value})}
                    placeholder="Selecione a instituição"
                  >
                    {instituicoes.map((instituicao: any) => (
                      <option key={instituicao.id} value={instituicao.id}>
                        {instituicao.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl isRequired>
                    <FormLabel>Data de Início</FormLabel>
                    <Input
                      type="datetime-local"
                      value={copyForm.dataInicio}
                      onChange={(e) => setCopyForm({...copyForm, dataInicio: e.target.value})}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Data de Fim</FormLabel>
                    <Input
                      type="datetime-local"
                      value={copyForm.dataFim}
                      onChange={(e) => setCopyForm({...copyForm, dataFim: e.target.value})}
                    />
                  </FormControl>
                </SimpleGrid>

                <Box p={4} bg="blue.50" borderRadius="md" w="full">
                  <Text fontSize="sm" color="blue.700">
                    <strong>Atenção:</strong> A nova avaliação será criada com todas as questões e configurações da avaliação original, 
                    mas sem os participantes. Você poderá adicionar os participantes posteriormente.
                  </Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onCopyModalClose}>
                Cancelar
              </Button>
              <Button 
                colorScheme="purple" 
                onClick={handleCopySubmit}
                isLoading={isCopyLoading}
                loadingText="Copiando..."
              >
                Copiar Avaliação
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Acompanhamento de Respostas */}
        <Modal isOpen={isAcompanhamentoOpen} onClose={onAcompanhamentoClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Acompanhamento de Respostas</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {loadingParcial && <Text>Carregando...</Text>}
              {!loadingParcial && parcial && (
                <>
                  <Pie
                    data={{
                      labels: ['Respondidos', 'Pendentes'],
                      datasets: [
                        {
                          data: [parcial.convitesRespondidos, parcial.convitesPendentes],
                          backgroundColor: ['#38A169', '#ECC94B'],
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                  <Text mt={4}><b>Total Convites:</b> {parcial.totalConvites}</Text>
                  <Text><b>Respondidos:</b> {parcial.convitesRespondidos}</Text>
                  <Text><b>Pendentes:</b> {parcial.convitesPendentes}</Text>
                  <Text><b>Percentual de Resposta:</b> {parcial.percentualResposta}%</Text>
                </>
              )}
              {!loadingParcial && !parcial && <Text>Não foi possível carregar os dados.</Text>}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onAcompanhamentoClose}>Fechar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Box>
    </MainLayout>
  );
};

export default AvaliacoesPage;
