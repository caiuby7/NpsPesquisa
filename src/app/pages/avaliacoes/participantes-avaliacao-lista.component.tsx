import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  VStack,
  HStack,
  Flex,
  Heading,
  Spinner,
  Center,
  Card,
  CardBody,
  CardHeader,
  IconButton
} from '@chakra-ui/react';
import { 
  UserPlus,
  Users,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MainLayout from '../../../components/layout/main-layout.component';
import { useGetAvaliacaoById } from '../../services/avaliacao/avaliacao.service.hooks';
import { api } from '../../services/api';

interface ParticipanteAvaliacao {
  id: number;
  participanteId: number;
  nome: string;
  email?: string;
  tipo: string;
  curso?: string;
  turma?: string;
  disciplina?: string;
  instituicao?: string;
  dataAdicao: string;
  status: 'Pendente' | 'Respondido' | 'Finalizado';
}

const ParticipantesAvaliacaoListaPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: avaliacao, isLoading: loadingAvaliacao } = useGetAvaliacaoById(Number(id));
  const [participantes, setParticipantes] = useState<ParticipanteAvaliacao[]>([]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const navigate = useNavigate();

  const carregarParticipantes = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar participantes já adicionados à avaliação
      const response = await api.get(`/Questionario/${id}/participantes`);
      const dados = response.data || [];
      
      // Transformar dados em formato de participantes
      const participantesFormatados: ParticipanteAvaliacao[] = dados.map((item: any) => ({
        id: item.id,
        participanteId: item.participanteId || item.id,
        nome: item.participante?.nome || item.nome || 'Sem nome',
        email: item.participante?.email || item.email || '',
        tipo: item.participante?.tipo || item.tipo || 'Participante',
        curso: item.participante?.curso?.nome || item.curso || '',
        turma: item.participante?.turma?.nome || item.turma || '',
        disciplina: item.participante?.disciplina?.nome || item.disciplina || '',
        instituicao: item.participante?.instituicao?.nome || item.instituicao || '',
        dataAdicao: item.dataAdicao || new Date().toISOString(),
        status: item.status || 'Pendente'
      }));
      
      setParticipantes(participantesFormatados);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar participantes da avaliação',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    if (avaliacao) {
      carregarParticipantes();
    }
  }, [avaliacao, carregarParticipantes]);


  const handleRemoverParticipante = async (participanteId: number) => {
    try {
      await api.delete(`/Questionario/${id}/participantes/${participanteId}`);
      
      toast({
        title: 'Sucesso',
        description: 'Participante removido da avaliação',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Recarregar lista
      carregarParticipantes();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao remover participante',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      console.error('Erro:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Respondido':
        return 'green';
      case 'Finalizado':
        return 'blue';
      case 'Pendente':
      default:
        return 'orange';
    }
  };

  if (loadingAvaliacao || loading) {
    return (
      <MainLayout>
        <Center minH="100vh">
          <Spinner size="xl" />
        </Center>
      </MainLayout>
    );
  }

  if (!avaliacao) {
    return (
      <MainLayout>
        <Center minH="100vh">
          <Text>Avaliação não encontrada</Text>
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
            <Button
              variant="ghost"
              leftIcon={<ArrowLeft />}
              onClick={() => navigate('/avaliacoes')}
            >
              Voltar
            </Button>
            <Box>
              <Heading size="lg" color="gray.900">Participantes da Avaliação</Heading>
              <Text color="gray.600">{avaliacao.titulo}</Text>
            </Box>
          </HStack>
          <Button
            leftIcon={<UserPlus size={20} />}
            colorScheme="blue"
            onClick={() => navigate(`/avaliacoes/${id}/participantes/adicionar`)}
          >
            Adicionar Participantes
          </Button>
        </Flex>

        {/* Estatísticas */}
        <Card mb={6}>
          <CardBody>
            <HStack spacing={8}>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">Total de Participantes</Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {participantes.length}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">Responderam</Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {participantes.filter(p => p.status === 'Respondido').length}
                </Text>
              </VStack>
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" color="gray.500">Pendentes</Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {participantes.filter(p => p.status === 'Pendente').length}
                </Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Lista de Participantes */}
        {participantes.length > 0 ? (
          <Card>
            <CardHeader>
              <HStack spacing={2}>
                <Users size={20} />
                <Heading size="md">Participantes Adicionados</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nome</Th>
                      <Th>Email</Th>
                      <Th>Tipo</Th>
                      <Th>Curso</Th>
                      <Th>Turma</Th>
                      <Th>Status</Th>
                      <Th>Data Adição</Th>
                      <Th width="100px">Ações</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {participantes.map((participante) => (
                      <Tr key={participante.id}>
                        <Td>
                          <Text fontWeight="medium">{participante.nome}</Text>
                        </Td>
                        <Td>{participante.email || '-'}</Td>
                        <Td>
                          <Badge colorScheme="blue">{participante.tipo}</Badge>
                        </Td>
                        <Td>{participante.curso || '-'}</Td>
                        <Td>{participante.turma || '-'}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(participante.status)}>
                            {participante.status}
                          </Badge>
                        </Td>
                        <Td>
                          {new Date(participante.dataAdicao).toLocaleDateString('pt-BR')}
                        </Td>
                        <Td>
                          <HStack spacing={1}>
                            <IconButton
                              aria-label="Remover participante"
                              icon={<Trash2 size={16} />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleRemoverParticipante(participante.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardBody>
              <Center py={12}>
                <VStack spacing={4}>
                  <Users size={48} color="gray" />
                  <Text color="gray.500" fontSize="lg">
                    Nenhum participante adicionado ainda
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Clique em "Adicionar Participantes" para começar
                  </Text>
                  <Button
                    leftIcon={<UserPlus size={20} />}
                    colorScheme="blue"
                    onClick={() => navigate(`/avaliacoes/${id}/participantes/adicionar`)}
                  >
                    Adicionar Primeiro Participante
                  </Button>
                </VStack>
              </Center>
            </CardBody>
          </Card>
        )}
      </Box>
    </MainLayout>
  );
};

export default ParticipantesAvaliacaoListaPage;
