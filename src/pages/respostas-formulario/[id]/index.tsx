import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';

interface Resposta {
  id: string;
  pergunta: string;
  resposta: string;
}

export default function RespostasFormularioPage() {
  const { id } = useParams();

  const { data: respostas, isLoading } = useQuery<Resposta[]>({
    queryKey: ['respostas-formulario', id],
    queryFn: () => api.get(`/Questionario/${id}/respostas`).then(res => res.data),
  });

  if (isLoading) {
    return <Box p={8}>Carregando...</Box>;
  }

  return (
    <Box p={8}>
      <VStack spacing={4} align="stretch">
        <Heading>Respostas do Formulário</Heading>
        {respostas?.map(resposta => (
          <Box key={resposta.id} p={4} borderWidth={1} borderRadius="md">
            <Text fontWeight="bold">{resposta.pergunta}</Text>
            <Text>{resposta.resposta}</Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
} 