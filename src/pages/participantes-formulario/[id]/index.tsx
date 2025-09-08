import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Spinner, Badge, Table, Thead, Tbody, Tr, Th, Td, useToast, Alert, AlertIcon } from "@chakra-ui/react";
import { AppHeader } from "../../../app/features/header/header.component";
import { useGetForms } from "../../../app/services/form/form.service.hooks";
import { useState } from "react";
import { MdEdit, MdDelete, MdGroupAdd, MdListAlt, MdAssignment } from "react-icons/md";

import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { api } from "../../../services/api";

interface Participante {
  id: number;
  nome: string;
  email: string;
  tipo: number;
  ativo: boolean;
}

export default function ParticipantesFormularioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Buscar participantes do questionário usando o endpoint correto
  const { data: participantes, isLoading, error } = useQuery({
    queryKey: ['participantes-questionario', id],
    queryFn: async () => {
      try {
        // Endpoint correto para buscar participantes de um questionário
        const response = await api.get(`/ParticipanteQuestionario/questionario/${id}`);
        const participantesData = response.data || [];
        setTotalPages(Math.ceil(participantesData.length / 10));
        return participantesData;
      } catch (error: any) {
        console.error('Erro ao buscar participantes:', error);
        throw new Error(error.response?.data?.message || 'Erro ao buscar participantes');
      }
    },
    enabled: !!id,
  });

  // Buscar todos os participantes disponíveis para adicionar
  const { data: participantesDisponiveis } = useQuery({
    queryKey: ['participantes-disponiveis'],
    queryFn: async () => {
      try {
        const response = await api.get('/Participante');
        return response.data || [];
      } catch (error: any) {
        console.error('Erro ao buscar participantes disponíveis:', error);
        return [];
      }
    },
  });

  // Mutation para adicionar participante
  const addParticipantMutation = useMutation({
    mutationFn: async (participanteId: number) => {
      return api.post(`/ParticipanteQuestionario`, {
        questionarioId: parseInt(id!),
        participanteId: participanteId,
        ativo: true
      });
    },
    onSuccess: () => {
      toast({
        title: "Participante adicionado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['participantes-questionario', id] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Erro ao adicionar participante";
      toast({
        title: "Erro ao adicionar participante",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Mutation para remover participante
  const removeParticipantMutation = useMutation({
    mutationFn: async (participanteQuestionarioId: number) => {
      return api.delete(`/ParticipanteQuestionario/${participanteQuestionarioId}`);
    },
    onSuccess: () => {
      toast({
        title: "Participante removido com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ['participantes-questionario', id] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Erro ao remover participante";
      toast({
        title: "Erro ao remover participante",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleAddParticipant = async (participanteId: number) => {
    addParticipantMutation.mutate(participanteId);
  };

  const handleRemoveParticipant = async (participanteQuestionarioId: number) => {
    if (window.confirm('Tem certeza que deseja remover este participante?')) {
      removeParticipantMutation.mutate(participanteQuestionarioId);
    }
  };

  if (isLoading) {
    return (
      <Box>
        <AppHeader />
        <Box p={8} maxW="900px" m="auto" textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Carregando participantes...</Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <AppHeader />
        <Box p={8} maxW="900px" m="auto">
          <Alert status="error">
            <AlertIcon />
            Erro ao carregar participantes: {error.message}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Stack spacing={4}>
          <Heading size="lg">Participantes do Formulário</Heading>
          
          {participantes && participantes.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {participantes.map((participante: any) => (
                  <Tr key={participante.id}>
                    <Td>{participante.participante?.nome || 'N/A'}</Td>
                    <Td>{participante.participante?.email || 'N/A'}</Td>
                    <Td>
                      <Badge colorScheme={participante.ativo ? "green" : "red"}>
                        {participante.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </Td>
                    <Td>
                      <ButtonGroup>
                        <IconButton
                          aria-label="Remover participante"
                          icon={<MdDelete />}
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveParticipant(participante.id)}
                          isLoading={removeParticipantMutation.isPending}
                        />
                      </ButtonGroup>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Alert status="info">
              <AlertIcon />
              Nenhum participante encontrado para este questionário.
            </Alert>
          )}

          <HStack spacing={2} justify="center" mt={4}>
            <IconButton
              aria-label="Página anterior"
              icon={<LuChevronLeft />}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
            />
            <Text>Página {currentPage} de {totalPages}</Text>
            <IconButton
              aria-label="Próxima página"
              icon={<LuChevronRight />}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              isDisabled={currentPage === totalPages}
            />
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
} 