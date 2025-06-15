import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Pagination, Spinner, Badge } from "@chakra-ui/react";
import { AppHeader } from "@/app/features/header/header.component";
import { useGetForms } from "@/app/services/form/form.service.hooks";
import { useState } from "react";
import { MdEdit, MdDelete, MdGroupAdd, MdListAlt, MdAssignment } from "react-icons/md";
import axios from "axios";

export default function FormulariosPage() {
  const { data, isLoading } = useGetForms();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
          {currentForms.map((form) => {
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
                    <IconButton aria-label="Editar" colorScheme="blue" variant="ghost" onClick={() => window.location.href = `/editar-formulario/${form.id}`}><MdEdit /></IconButton>
                    <IconButton aria-label="Excluir" colorScheme="red" variant="ghost" onClick={() => window.location.href = `/excluir-formulario/${form.id}`}><MdDelete /></IconButton>
                    <IconButton aria-label="Respostas" colorScheme="purple" variant="ghost" onClick={() => window.location.href = `/respostas-formulario/${form.id}`}><MdListAlt /></IconButton>
                    <Button colorScheme="teal" variant="solid" size="sm" onClick={() => window.location.href = `/participantes-formulario/${form.id}`}><MdGroupAdd /> Adicionar Participantes</Button>
                    <Button colorScheme="green" variant="solid" size="sm" onClick={() => window.location.href = `/responder-formulario/${form.id}`}><MdAssignment /> Responder</Button>
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
        {totalPages > 1 && (
          <Pagination.Root
            count={totalPages}
            pageSize={1}
            defaultPage={currentPage}
            w="100%"
            m="auto"
            onChange={page => {
              const pageValue = typeof page === 'number' ? page : (page as any)?.value ?? 1;
              setCurrentPage(pageValue);
            }}
          >
            <ButtonGroup variant="ghost" size="sm" mt={6}>
              <Pagination.PrevTrigger asChild>
                <IconButton disabled={currentPage === 1}>{"<"}</IconButton>
              </Pagination.PrevTrigger>
              <Pagination.Items
                render={(page) => (
                  <IconButton
                    variant={page.value === currentPage ? "outline" : "ghost"}
                    onClick={() => setCurrentPage(page.value)}
                  >
                    {String(page.value)}
                  </IconButton>
                )}
              />
              <Pagination.NextTrigger asChild>
                <IconButton disabled={currentPage === totalPages}>{">"}</IconButton>
              </Pagination.NextTrigger>
            </ButtonGroup>
          </Pagination.Root>
        )}
      </Box>
    </Box>
  );
} 