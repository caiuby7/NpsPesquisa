import React from "react";
import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Spinner, Badge, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast, Input } from "@chakra-ui/react";
import { AppHeader } from "../../components/header/header.component";
import { useGetForms } from "../../app/services/form/form.service.hooks";
import { useState } from "react";
import { MdEdit, MdDelete, MdGroupAdd, MdListAlt, MdAssignment, MdVisibility, MdNotifications } from "react-icons/md";
import { api } from "../../services/api";
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface Participante {
  id: number;
  nome: string;
  email: string;
  respondeu?: boolean;
}

const ParticipantesFormularioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [alunosDisponiveis, setAlunosDisponiveis] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();
  const [selecionados, setSelecionados] = useState<number[]>([]);

  const { data: participantesRaw, isLoading } = useQuery<any[]>({
    queryKey: ['participantes', id],
    queryFn: async () => {
      const response = await api.get(`/Questionario/${id}/participantes`);
      setTotalPages(Math.ceil(response.data.length / 10));
      return response.data;
    }
  });

  const participantes = participantesRaw?.map((item) => ({
    id: item.aluno?.id ?? item.id,
    nome: item.aluno?.nome ?? '',
    email: item.aluno?.emailInstitucional || item.aluno?.emailPessoal || '',
    respondeu: item.respondeu
  })) ?? [];

  // Buscar alunos disponíveis ao montar o componente
  React.useEffect(() => {
    api.get("/Aluno").then(res => setAlunosDisponiveis(res.data));
  }, []);

  const handleRemoveParticipant = async (participanteId: number) => {
    if (window.confirm('Tem certeza que deseja remover este participante?')) {
      await api.delete(`/Questionario/${id}/participantes/${participanteId}`);
      queryClient.invalidateQueries({ queryKey: ['participantes', id] });
    }
  };

  const handleViewResponses = (participanteId: number) => {
    navigate(`/Questionario/${id}/respostas/${participanteId}`);
  };

  const handleSendReminder = async (participanteId: number) => {
    try {
      await api.post(`/Questionario/${id}/participantes/${participanteId}/lembrete`);
      toast({
        title: "Lembrete enviado com sucesso!",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    } catch (e) {
      toast({
        title: "Erro ao enviar lembrete.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    }
  };

  const handleImport = async () => {
    if (!file || !id) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token") || '';
      await api.post(`/Questionario/${id}/importar-participantes-xls`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });
      toast({
        title: "Participantes importados com sucesso!",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
      setFile(null);
      onClose();
      queryClient.invalidateQueries({ queryKey: ['participantes', id] });
    } catch (e) {
      toast({
        title: "Erro ao importar participantes.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top"
      });
    }
  };

  const handleAdd = async () => {
    if (selecionados.length === 0) {
      toast({ title: "Selecione pelo menos um aluno", status: "warning" });
      return;
    }
    try {
      await api.post(`/Questionario/${id}/participantes`, selecionados);
      toast({ title: "Participantes adicionados!", status: "success" });
      setSelecionados([]);
      queryClient.invalidateQueries({ queryKey: ['participantes', id] });
    } catch (e) {
      toast({ title: "Erro ao adicionar participantes", status: "error" });
    }
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Stack spacing={4}>
          <Heading size="lg">Participantes do Formulário</Heading>
          <HStack spacing={4} mb={2} align="flex-end">
            <Box minW="350px" flex={1}>
              <select
                multiple
                value={selecionados.map(String)}
                onChange={e => {
                  const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                  setSelecionados(options);
                }}
                style={{ width: "100%", minHeight: 100 }}
              >
                {alunosDisponiveis.map((aluno: any) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome} ({aluno.matricula})
                  </option>
                ))}
              </select>
            </Box>
            <Button colorScheme="teal" onClick={handleAdd} minW="180px">
              <MdGroupAdd style={{ marginRight: 8 }} /> Adicionar Participante(s)
            </Button>
            <Button colorScheme="teal" onClick={onOpen} minW="140px">
              Importar XLS
            </Button>
            <Button colorScheme="blue" onClick={async () => {
              try {
                const response = await api.get(`/Questionario/${id}/exportar-pendentes`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `pendentes_questionario_${id}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
              } catch (e) {
                alert('Erro ao exportar pendentes.');
              }
            }} minW="200px">
              Exportar Pendentes (Excel)
            </Button>
          </HStack>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Importar Participantes via XLS</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose} mr={3} variant="ghost">Cancelar</Button>
                <Button colorScheme="teal" onClick={handleImport} isDisabled={!file}>Importar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Box overflowX="auto">
            <Table>
              <Thead>
                <Tr>
                  <Th>Nome</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {(Array.isArray(participantes) ? participantes : []).map((participante: Participante) => (
                  <Tr key={participante.id}>
                    <Td>{participante.nome}</Td>
                    <Td>{participante.email}</Td>
                    <Td>
                      <Badge colorScheme={participante.respondeu ? "green" : "yellow"}>
                        {participante.respondeu ? "RESPONDIDO" : "PENDENTE"}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton aria-label="Visualizar" icon={<MdVisibility />} size="sm" onClick={() => handleViewResponses(participante.id)} title="Visualizar respostas" />
                        <IconButton aria-label="Enviar lembrete" icon={<MdNotifications />} size="sm" onClick={() => handleSendReminder(participante.id)} title="Enviar lembrete" />
                        <IconButton aria-label="Remover" icon={<MdDelete />} size="sm" onClick={() => handleRemoveParticipant(participante.id)} title="Remover participante" />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default ParticipantesFormularioPage; 