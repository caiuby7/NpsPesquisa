import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Spinner, Badge, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { AppHeader } from "../../../app/features/header/header.component";
import { useGetForms } from "../../../app/services/form/form.service.hooks";
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

export default function ParticipantesFormularioPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { data: participantes, isLoading } = useQuery({
    queryKey: ['participantes', id],
    queryFn: async () => {
      const response = await axios.get(`/api/formularios/${id}/participantes`);
      setTotalPages(Math.ceil(response.data.length / 10));
      return response.data;
    }
  });

  const handleAddParticipant = async (alunoId: string) => {
    try {
      await axios.post(`/api/formularios/${id}/participantes`, { alunoId });
      // Recarregar a lista de participantes
      window.location.reload();
    } catch (error) {
      console.error('Erro ao adicionar participante:', error);
    }
  };

  if (isLoading) {
    return (
      <Box>
        <AppHeader />
        <Box p={8} maxW="900px" m="auto" textAlign="center">
          <Spinner size="xl" />
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
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja remover este participante?')) {
                            axios.delete(`/api/formularios/${id}/participantes/${participante.id}`);
                            window.location.reload();
                          }
                        }}
                      />
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <HStack spacing={2} justify="center" mt={4}>
            <IconButton
              aria-label="Página anterior"
              icon={<LuChevronLeft />}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              isDisabled={currentPage === 1}
            />
            <Text>Página {currentPage}</Text>
            <IconButton
              aria-label="Próxima página"
              icon={<LuChevronRight />}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              isDisabled={currentPage >= totalPages}
            />
          </HStack>
        </Stack>
      </Box>
    </Box>
  );
} 