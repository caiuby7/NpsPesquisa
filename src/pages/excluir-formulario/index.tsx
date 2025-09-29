import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';

export default function DeleteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/Questionario/${id}`),
    onSuccess: () => {
      navigate('/formularios');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja excluir este formulário?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <Box p={8}>
      <VStack spacing={4} align="stretch">
        <Heading>Excluir Formulário</Heading>
        <Text>Tem certeza que deseja excluir este formulário?</Text>
        <Button colorScheme="red" onClick={handleDelete} isLoading={deleteMutation.isPending}>
          Excluir
        </Button>
      </VStack>
    </Box>
  );
} 
