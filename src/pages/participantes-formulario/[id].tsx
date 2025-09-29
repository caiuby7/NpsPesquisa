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
import Cookies from 'js-cookie';

interface Participante {
  id: number;
  nome: string;
  email: string;
  respondeu?: boolean;
}

interface Aluno {
  id: number;
  nome: string;
  emailInstitucional?: string;
  emailPessoal?: string;
  ativo: boolean;
  cursoId: number;
  matricula: string;
}

const ParticipantesFormularioPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<Aluno[]>([]);
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
    const fetchAlunos = async () => {
      try {
        console.log("🔄 Buscando alunos disponíveis...");
        const response = await api.get("/Aluno");
        console.log("✅ Alunos carregados:", response.data);
        setAlunosDisponiveis(response.data);
      } catch (error: any) {
        console.error("❌ Erro ao carregar alunos:", error);
        
        let errorMessage = "Erro ao carregar lista de alunos";
        if (error.response?.status === 401) {
          errorMessage = "Não autorizado. Faça login novamente.";
        } else if (error.response?.status === 500) {
          errorMessage = "Erro interno do servidor.";
        }
        
        toast({
          title: "Erro ao carregar alunos",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true
        });
      }
    };

    fetchAlunos();
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
      const token = Cookies.get("token") || '';
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
      });
    }
  };

  const handleAdd = async () => {
    if (selecionados.length === 0) {
      toast({ 
        title: "Selecione pelo menos um aluno", 
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }

    console.log("🔄 Adicionando participantes:", selecionados);
    console.log("📝 ID do questionário:", id);
    console.log("📊 Tipo de dados selecionados:", typeof selecionados, Array.isArray(selecionados));

    // Validar se todos os IDs são números válidos
    const idsInvalidos = selecionados.filter(id => !Number.isInteger(id) || id <= 0);
    if (idsInvalidos.length > 0) {
      console.error("❌ IDs inválidos encontrados:", idsInvalidos);
      toast({
        title: "IDs inválidos",
        description: "Alguns IDs selecionados são inválidos",
        status: "error",
        duration: 5000,
        isClosable: true
      });
      return;
    }

    try {
      // Verificar se o token está presente
      const token = Cookies.get("token");
      if (!token) {
        console.error("❌ Token não encontrado");
        toast({ 
          title: "Erro de autenticação", 
          description: "Token não encontrado. Faça login novamente.",
          status: "error",
          duration: 5000,
          isClosable: true
        });
        return;
      }

      // Preparar dados para envio - enviar objetos completos dos alunos
      const dadosParaEnvio = selecionados.map(id => {
        const aluno = alunosDisponiveis.find(a => a.id === id);
        if (!aluno) {
          throw new Error(`Aluno com ID ${id} não encontrado`);
        }
        return {
          id: aluno!.id,
          nome: aluno!.nome,
          email: aluno!.emailInstitucional || aluno!.emailPessoal,
          tipo: 'Aluno',
          ativo: aluno!.ativo,
          cursoId: aluno!.cursoId,
          matricula: aluno!.matricula
        };
      });
      console.log("📤 Dados preparados para envio:", dadosParaEnvio);

      // Fazer a requisição com headers explícitos
      const response = await api.post(`/Questionario/${id}/participantes-teste`, dadosParaEnvio, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      console.log("✅ Resposta da API:", response);
      
      toast({ 
        title: "Participantes adicionados com sucesso!", 
        description: `${selecionados.length} participante(s) adicionado(s)`,
        status: "success",
        duration: 4000,
        isClosable: true
      });
      
      setSelecionados([]);
      queryClient.invalidateQueries({ queryKey: ['participantes', id] });
      
    } catch (error: any) {
      console.error("❌ Erro ao adicionar participantes:", error);
      
      let errorMessage = "Erro desconhecido ao adicionar participantes";
      
      if (error.response) {
        // Erro da API
        console.error("📡 Status da resposta:", error.response.status);
        console.error("📡 Dados da resposta:", error.response.data);
        
        if (error.response.status === 401) {
          errorMessage = "Não autorizado. Verifique suas permissões.";
        } else if (error.response.status === 404) {
          errorMessage = "Questionário não encontrado.";
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || "Dados inválidos enviados.";
        } else if (error.response.status === 500) {
          errorMessage = "Erro interno do servidor.";
        }
      } else if (error.request) {
        // Erro de rede
        console.error("🌐 Erro de rede:", error.request);
        errorMessage = "Erro de conexão. Verifique sua internet.";
      } else {
        // Erro geral
        console.error("⚠️ Erro geral:", error.message);
        errorMessage = error.message || "Erro inesperado ocorreu.";
      }
      
      toast({ 
        title: "Erro ao adicionar participantes", 
        description: errorMessage,
        status: "error",
        duration: 6000,
        isClosable: true
      });
    }
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Stack spacing={4}>
          <Heading size="lg">Participantes do Formulário</Heading>
          <HStack spacing={4} mb={2} align="flex-end" flexWrap="wrap">
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
            <Button colorScheme="green" onClick={async () => {
              try {
                const response = await api.get(`/Questionario/${id}/exportar-respondentes`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `respondentes_questionario_${id}.xlsx`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
              } catch (e) {
                alert('Erro ao exportar respondentes.');
              }
            }} minW="200px">
              Exportar Respondentes (XLS)
            </Button>
            <Button 
              colorScheme="gray" 
              onClick={() => {
                const token = Cookies.get("token");
                const user = Cookies.get("user");
                console.log("🔍 DEBUG INFO:", {
                  token: token ? "Presente" : "Ausente",
                  user: user ? "Presente" : "Ausente",
                  questionarioId: id,
                  alunosDisponiveis: alunosDisponiveis.length,
                  selecionados: selecionados,
                  apiBaseUrl: process.env.REACT_APP_API_URL || 'https://apiavaliacao.catolicasc.org.br/api'
                });
                
                toast({
                  title: "Informações de Debug",
                  description: `Token: ${token ? "OK" : "NÃO"}, Alunos: ${alunosDisponiveis.length}, Selecionados: ${selecionados.length}`,
                  status: "info",
                  duration: 5000,
                  isClosable: true
                });
              }}
              minW="120px"
            >
              Debug
            </Button>
            <Button 
              colorScheme="orange" 
              onClick={async () => {
                try {
                  console.log("🧪 Testando conexão com a API...");
                  const response = await api.get(`/Questionario/${id}`);
                  console.log("✅ Teste de conexão bem-sucedido:", response.data);
                  
                  toast({
                    title: "Teste de Conexão",
                    description: "API está funcionando! Questionário encontrado.",
                    status: "success",
                    duration: 3000,
                    isClosable: true
                  });
                } catch (error: any) {
                  console.error("❌ Teste de conexão falhou:", error);
                  
                  let errorMessage = "Erro desconhecido";
                  if (error.response?.status === 401) {
                    errorMessage = "Não autorizado (401)";
                  } else if (error.response?.status === 404) {
                    errorMessage = "Questionário não encontrado (404)";
                  } else if (error.response?.status === 500) {
                    errorMessage = "Erro interno do servidor (500)";
                  }
                  
                  toast({
                    title: "Teste de Conexão Falhou",
                    description: errorMessage,
                    status: "error",
                    duration: 5000,
                    isClosable: true
                  });
                }
              }}
              minW="140px"
            >
              Testar API
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