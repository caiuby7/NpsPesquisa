import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Badge, Spinner, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import { useGetForms, Form } from "../../services/form/form.service.hooks";
import { useState } from "react";
import { MdEdit, MdDelete, MdGroupAdd, MdListAlt, MdAssignment } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend);

export default function FormulariosPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetForms();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [parcial, setParcial] = useState<any>(null);
  const [loadingParcial, setLoadingParcial] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

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

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleSendInvites = async (formId: string) => {
    try {
      await axios.post(`/api/Questionario/${formId}/gerar-convites`);
      alert("Convites enviados com sucesso!");
    } catch (e) {
      alert("Erro ao enviar convites");
    }
  };

  const handleSendReminder = async (formId: string) => {
    try {
      await axios.post(`/api/ConviteQuestionario/lembrete/questionario/${formId}`);
      alert("Lembrete enviado com sucesso!");
    } catch (e) {
      alert("Erro ao enviar lembrete");
    }
  };

  const handleAcompanhar = async (formId: string) => {
    setSelectedFormId(formId);
    setLoadingParcial(true);
    onOpen();
    try {
      const { data } = await axios.get(`/api/Questionario/${formId}/parcial-convites`);
      setParcial(data);
    } catch (e) {
      setParcial(null);
    }
    setLoadingParcial(false);
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={8}>Formulários</Heading>
        <Stack gap={4}>
          {currentForms.length === 0 && <Text>Nenhum formulário cadastrado.</Text>}
          {currentForms.map((form: Form) => {
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
                    <IconButton 
                      aria-label="Editar" 
                      colorScheme="blue" 
                      variant="ghost" 
                      onClick={() => handleNavigate(`/editar-formulario/${form.id}`)}
                    >
                      <MdEdit />
                    </IconButton>
                    <IconButton 
                      aria-label="Excluir" 
                      colorScheme="red" 
                      variant="ghost" 
                      onClick={() => handleNavigate(`/excluir-formulario/${form.id}`)}
                    >
                      <MdDelete />
                    </IconButton>
                    <IconButton 
                      aria-label="Respostas" 
                      colorScheme="purple" 
                      variant="ghost" 
                      onClick={() => handleNavigate(`/respostas-formulario/${form.id}`)}
                    >
                      <MdListAlt />
                    </IconButton>
                    <Button 
                      colorScheme="teal" 
                      variant="solid" 
                      size="sm" 
                      onClick={() => handleNavigate(`/participantes-formulario/${form.id}`)}
                    >
                      <MdGroupAdd /> Adicionar Participantes
                    </Button>
                    <Button 
                      colorScheme="orange" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSendInvites(form.id.toString())}
                    >
                      Enviar Convites
                    </Button>
                    <Button 
                      colorScheme="green" 
                      variant="solid" 
                      size="sm" 
                      onClick={() => handleSendReminder(form.id.toString())}
                    >
                      <MdAssignment /> Enviar Lembrete
                    </Button>
                    <Button 
                      colorScheme="blue" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAcompanhar(form.id.toString())}
                    >
                      📊 Acompanhar Respostas
                    </Button>
                  </ButtonGroup>
                </Stack>
              </Box>
            );
          })}
        </Stack>
        {totalPages > 1 && (
          <Box mt={6} display="flex" justifyContent="center">
            <ButtonGroup variant="ghost" size="sm">
              <IconButton 
                aria-label="Página anterior"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                {"<"}
              </IconButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page: number) => (
                <IconButton
                  key={page}
                  aria-label={`Ir para página ${page}`}
                  variant={page === currentPage ? "outline" : "ghost"}
                  onClick={() => setCurrentPage(page)}
                >
                  {String(page)}
                </IconButton>
              ))}
              <IconButton 
                aria-label="Próxima página"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                {">"}
              </IconButton>
            </ButtonGroup>
          </Box>
        )}
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Acompanhamento de Respostas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loadingParcial && <Text>Carregando...</Text>}
            {!loadingParcial && parcial && (
              <>
                <Pie
                  data={{
                    labels: ['Respondidos', 'Pendentes'],
                    datasets: [
                      {
                        data: [parcial.convitesRespondidos, parcial.convitesPendentes],
                        backgroundColor: ['#38A169', '#ECC94B'],
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { position: 'bottom' },
                    },
                  }}
                />
                <Text mt={4}><b>Total Convites:</b> {parcial.totalConvites}</Text>
                <Text><b>Respondidos:</b> {parcial.convitesRespondidos}</Text>
                <Text><b>Pendentes:</b> {parcial.convitesPendentes}</Text>
                <Text><b>Percentual de Resposta:</b> {parcial.percentualResposta}%</Text>
              </>
            )}
            {!loadingParcial && !parcial && <Text>Não foi possível carregar os dados.</Text>}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
} 