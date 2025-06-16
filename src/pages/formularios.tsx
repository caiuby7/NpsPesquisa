import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Spinner, Badge } from "@chakra-ui/react";
import { AppHeader } from "../components/header/header.component";
import { useGetForms } from "../app/services/form/form.service.hooks";
import { useState } from "react";
import { MdEdit, MdDelete, MdGroupAdd, MdAssignment, MdListAlt } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FormResponse } from "../app/services/form/form.services.types";

export default function FormulariosPage() {
  const { data, isLoading } = useGetForms();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

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

  const forms = Array.isArray(data) ? data : [];
  const totalPages = Math.ceil(forms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = forms.slice(startIndex, endIndex);
  const now = new Date();

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={8}>Formulários</Heading>
        <Stack gap={4}>
          {currentForms.length === 0 && <Text>Nenhum formulário cadastrado.</Text>}
          {currentForms.map((form: FormResponse) => {
            const inicio = form.dataInicio ? new Date(form.dataInicio) : null;
            const fim = form.dataFim ? new Date(form.dataFim) : null;
            const isActive = inicio && fim && now >= inicio && now <= fim;
            return (
              <Box
                key={form.id}
                borderWidth="1px"
                borderRadius="md"
                p={4}
                bg={isActive ? "green.50" : "white"}
                borderColor={isActive ? "green.400" : "gray.200"}
                position="relative"
              >
                <Stack direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={4}>
                  <Box>
                    <HStack mb={1}>
                      <Heading size="md">{form.titulo}</Heading>
                      {isActive && <Badge colorScheme="green">Ativo</Badge>}
                    </HStack>
                    <Text fontSize="sm" color="gray.600">{form.descricao}</Text>
                    <Text fontSize="xs" color="gray.400">Início: {form.dataInicio ? new Date(form.dataInicio).toLocaleDateString() : "-"} | Fim: {form.dataFim ? new Date(form.dataFim).toLocaleDateString() : "-"}</Text>
                  </Box>
                  <ButtonGroup>
                    <IconButton aria-label="Editar" colorScheme="blue" variant="ghost" onClick={() => navigate(`/editar-formulario/${form.id}`)}><MdEdit /></IconButton>
                    <IconButton aria-label="Excluir" colorScheme="red" variant="ghost" onClick={() => navigate(`/excluir-formulario/${form.id}`)}><MdDelete /></IconButton>
                    <IconButton aria-label="Respostas" colorScheme="purple" variant="ghost" onClick={() => navigate(`/respostas-formulario/${form.id}`)}><MdListAlt /></IconButton>
                    <Button colorScheme="teal" variant="solid" size="sm" onClick={() => navigate(`/participantes-formulario/${form.id}`)}><MdGroupAdd /> Adicionar Participantes</Button>
                    <Button colorScheme="green" variant="solid" size="sm" onClick={() => navigate(`/responder-formulario/${form.id}`)}><MdAssignment /> Responder</Button>
                    <Button colorScheme="orange" variant="outline" size="sm" onClick={async () => {
                      try {
                        await axios.post(`/api/Questionario/${form.id}/gerar-convites`);
                        alert("Convites enviados com sucesso!");
                      } catch (e) {
                        alert("Erro ao enviar convites");
                      }
                    }}>Enviar Convites</Button>
                  </ButtonGroup>
                </Stack>
              </Box>
            );
          })}
        </Stack>
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
      </Box>
    </Box>
  );
} 