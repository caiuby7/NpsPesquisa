import React from "react";
import { Box, Heading, Text, Stack, Button, ButtonGroup, IconButton, HStack, Spinner, Badge, Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useToast, Input } from "@chakra-ui/react";
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [file, setFile] = useState<File | null>(null);
  const toast = useToast();

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

  const handleImport = async () => {
    if (!file || !id) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token") || '';
      await axios.post(`/api/Questionario/${id}/importar-participantes-xls`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({ title: "Participantes importados com sucesso!", status: "success", duration: 4000, isClosable: true });
      onClose();
      setFile(null);
    } catch (e) {
      toast({ title: "Erro ao importar participantes.", status: "error", duration: 4000, isClosable: true });
    }
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Stack spacing={4}>
          <Heading size="lg">Participantes do Formulário</Heading>
          <Button colorScheme="teal" onClick={onOpen} mb={4}>Importar XLS</Button>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Importar Participantes via XLS</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Input type="file" accept=".xls,.xlsx" onChange={e => setFile(e.target.files?.[0] || null)} />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" mr={3} onClick={handleImport} isDisabled={!file}>Importar</Button>
                <Button onClick={onClose}>Cancelar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
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