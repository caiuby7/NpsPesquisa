import { Box, Button, FormControl, FormLabel, Heading, Input, VStack } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';
import { useForm } from 'react-hook-form';

interface Participante {
  id: string;
  nome: string;
  email: string;
}

interface FormData {
  nome: string;
  email: string;
}

export default function ParticipanteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const { data: participante, isLoading } = useQuery<Participante>({
    queryKey: ['participante', id],
    queryFn: () => api.get(`/participantes/${id}`).then(res => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.put(`/participantes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participante', id] });
      queryClient.invalidateQueries({ queryKey: ['participantes'] });
      navigate('/participantes');
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <Box p={8}>Carregando...</Box>;
  }

  return (
    <Box p={8}>
      <VStack spacing={4} align="stretch">
        <Heading>Editar Participante</Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.nome}>
              <FormLabel>Nome</FormLabel>
              <Input
                defaultValue={participante?.nome}
                {...register('nome', { required: 'Nome é obrigatório' })}
              />
            </FormControl>
            <FormControl isInvalid={!!errors.email}>
              <FormLabel>Email</FormLabel>
              <Input
                defaultValue={participante?.email}
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido',
                  },
                })}
              />
            </FormControl>
            <Button type="submit" colorScheme="blue" isLoading={updateMutation.isPending}>
              Salvar
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
} 