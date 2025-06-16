import React from "react";
import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Spinner, Badge, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import { useGetForms } from "../../app/services/form/form.service.hooks";
import { useState } from "react";
import { MdEdit, MdDelete, MdGroupAdd, MdListAlt, MdAssignment } from "react-icons/md";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface Participante {
  id: number;
  nome: string;
  email: string;
}

const ParticipantesFormularioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: participantes, isLoading } = useQuery<Participante[]>({
    queryKey: ['participantes', id],
    queryFn: async () => {
      const response = await axios.get(`/api/formularios/${id}/participantes`);
      setTotalPages(Math.ceil(response.data.length / 10));
      return response.data;
    }
  });

  const handleRemoveParticipant = async (participanteId: number) => {
    if (window.confirm('Tem certeza que deseja remover este participante?')) {
      await axios.delete(`/api/formularios/${id}/participantes/${participanteId}`);
      window.location.reload();
    }
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Stack spacing={4}>
          <Heading size="lg">Participantes do Formulário</Heading>
          
          <Table>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {participantes?.map((participante: Participante) => (
                <Tr key={participante.id}>
                  <Td>{participante.nome}</Td>
                  <Td>{participante.email}</Td>
                  <Td>
                    <ButtonGroup>
                      <IconButton
                        aria-label="Remover participante"
                        icon={<MdDelete />}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleRemoveParticipant(participante.id)}
                      />
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Stack>
      </Box>
    </Box>
  );
};

export default ParticipantesFormularioPage; 