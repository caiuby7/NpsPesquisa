import { Box, Heading, Text, VStack, HStack, Badge, Spinner, Alert, AlertIcon, Table, Thead, Tbody, Tr, Th, Td, useToast } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { AppHeader } from '../../../components/header/header.component';

interface Resposta {
  id: number;
  participanteId: number;
  participante: {
    nome: string;
    email: string;
  };
  dataResposta: string;
  respostas: Array<{
    questaoId: number;
    questao: {
      texto: string;
      tipo: number;
    };
    resposta: string;
    comentario?: string;
  }>;
}

export default function RespostasFormularioPage() {
  const { id } = useParams();
  const toast = useToast();

  const { data: respostas, isLoading, error } = useQuery<Resposta[]>({
    queryKey: ['respostas-formulario', id],
    queryFn: async () => {
      try {
        // Endpoint correto para buscar respostas de um questionário
        const response = await api.get(`/Resposta/questionario/${id}`);
        return response.data || [];
      } catch (error: any) {
        console.error('Erro ao buscar respostas:', error);
        throw new Error(error.response?.data?.message || 'Erro ao buscar respostas do questionário');
      }
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <Box>
        <AppHeader />
        <Box p={8} maxW="1200px" m="auto" textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Carregando respostas...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <AppHeader />
        <Box p={8} maxW="1200px" m="auto">
          <Alert status="error">
            <AlertIcon />
            Erro ao carregar respostas: {error.message}
          </Alert>
        </Box>
      </Box>
    );
  }

  if (!respostas || respostas.length === 0) {
    return (
      <Box>
        <AppHeader />
        <Box p={8} maxW="1200px" m="auto">
          <Alert status="info">
            <AlertIcon />
            Nenhuma resposta encontrada para este questionário.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="1200px" m="auto">
        <VStack spacing={6} align="stretch">
          <Heading>Respostas do Formulário</Heading>
          <Text fontSize="lg" color="gray.600">
            Total de respostas: {respostas.length}
          </Text>

          {respostas.map((resposta, index) => (
            <Box 
              key={resposta.id} 
              p={6} 
              borderWidth={1} 
              borderRadius="lg"
              borderColor="gray.200"
              bg="white"
              shadow="sm"
            >
              <HStack justify="space-between" mb={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Resposta #{index + 1}
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    Participante: {resposta.participante.nome} ({resposta.participante.email})
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Data: {new Date(resposta.dataResposta).toLocaleDateString('pt-BR')}
                  </Text>
                </Box>
                <Badge colorScheme="green" size="lg">
                  {resposta.respostas.length} questões respondidas
                </Badge>
              </HStack>

              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Questão</Th>
                    <Th>Resposta</Th>
                    <Th>Comentário</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {resposta.respostas.map((item, qIndex) => (
                    <Tr key={qIndex}>
                      <Td>
                        <Text fontWeight="medium">{item.questao.texto}</Text>
                        <Badge colorScheme="blue" size="sm" mt={1}>
                          {getTipoQuestaoDescricao(item.questao.tipo)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text>{item.resposta || 'N/A'}</Text>
                      </Td>
                      <Td>
                        {item.comentario ? (
                          <Text fontSize="sm" color="gray.600" fontStyle="italic">
                            "{item.comentario}"
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.400">Sem comentário</Text>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}

// Função auxiliar para obter descrição do tipo de questão
function getTipoQuestaoDescricao(tipo: number): string {
  switch (tipo) {
    case 0: return 'Múltipla Escolha';
    case 1: return 'Texto';
    case 2: return 'Escala Linear';
    case 3: return 'Matriz';
    case 4: return 'Data';
    case 5: return 'Hora';
    case 6: return 'Email';
    case 7: return 'Telefone';
    case 8: return 'CPF';
    case 9: return 'CEP';
    default: return 'Desconhecido';
  }
} 