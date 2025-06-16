import { useRouter } from "next/router";
import {
  Box,
  Button,
  Heading,
  Tag,
  IconButton,
  Input,
  Stack,
  HStack,
  Flex,
  Text,
} from "@chakra-ui/react";
import { AppHeader } from "../../src/app/features/header/header.component";
import { useEffect, useState } from "react";
import { MdDelete, MdPersonAdd } from "react-icons/md";
import { api } from "../../src/app/services/api";

// Mock de participante
interface Participante {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  status: "Ativo" | "Inativo";
}

export default function ParticipantesFormularioPage() {
  const router = useRouter();
  const { id } = router.query;
  const formId = Array.isArray(id) ? id[0] : id || "";
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [novo, setNovo] = useState({ email: "", matricula: "" });
  const [loading, setLoading] = useState(false);
  const [alunosDisponiveis, setAlunosDisponiveis] = useState<any[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);

  // Mock: buscar participantes
  useEffect(() => {
    async function fetchParticipantes() {
      if (!formId) return;
      try {
        const res = await api.get(`/Questionario/${formId}/participantes`);
        setParticipantes(
          res.data.map((item: any) => ({
            id: item.aluno.id,
            nome: item.aluno.nome,
            email: item.aluno.emailInstitucional || item.aluno.emailPessoal,
            matricula: item.aluno.matricula,
            status: item.aluno.statusNoPeriodoLetivo === "Ativo" ? "Ativo" : "Inativo"
          }))
        );
      } catch (e) {
        alert("Erro ao buscar participantes");
      }
    }
    fetchParticipantes();
  }, [formId]);

  useEffect(() => {
    // Buscar todos os alunos disponíveis
    api.get("/Aluno").then(res => setAlunosDisponiveis(res.data));
  }, []);

  const handleAdd = async () => {
    if (selecionados.length === 0) {
      alert("Selecione pelo menos um aluno");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/Questionario/${formId}/participantes`, selecionados);
      alert("Participantes adicionados!");
      setSelecionados([]);
      // Atualiza lista
      const res = await api.get(`/Questionario/${formId}/participantes`);
      setParticipantes(
        res.data.map((item: any) => ({
          id: item.aluno.id,
          nome: item.aluno.nome,
          email: item.aluno.emailInstitucional || item.aluno.emailPessoal,
          matricula: item.aluno.matricula,
          status: item.aluno.statusNoPeriodoLetivo === "Ativo" ? "Ativo" : "Inativo"
        }))
      );
    } catch (e) {
      alert("Erro ao adicionar participantes");
    }
    setLoading(false);
  };

  const handleRemove = async (alunoId: number) => {
    try {
      await api.delete(`/Questionario/${formId}/participantes/${alunoId}`);
      alert("Participante removido!");
      // Atualiza lista
      const res = await api.get(`/Questionario/${formId}/participantes`);
      setParticipantes(
        res.data.map((item: any) => ({
          id: item.aluno.id,
          nome: item.aluno.nome,
          email: item.aluno.emailInstitucional || item.aluno.emailPessoal,
          matricula: item.aluno.matricula,
          status: item.aluno.statusNoPeriodoLetivo === "Ativo" ? "Ativo" : "Inativo"
        }))
      );
    } catch (e) {
      alert("Erro ao remover participante");
    }
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Heading mb={8}>Participantes do Formulário #{formId}</Heading>
        <Box mb={6} p={4} borderWidth="1px" borderRadius="md">
          <Stack direction={{ base: "column", md: "row" }} gap={4} align="center">
            <select
              multiple
              value={selecionados.map(String)}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                setSelecionados(options);
              }}
              style={{ minWidth: 220, minHeight: 80 }}
            >
              {alunosDisponiveis.map(aluno => (
                <option key={aluno.id} value={aluno.id}>
                  {aluno.nome} ({aluno.matricula})
                </option>
              ))}
            </select>
            <Button
              colorScheme="teal"
              onClick={handleAdd}
              loading={loading}
            >
              <MdPersonAdd style={{ marginRight: 8 }} /> Adicionar Participante(s)
            </Button>
          </Stack>
        </Box>
        <Box>
          <Heading mb={4}>Participantes do Formulário</Heading>
          <Stack gap={4}>
            {participantes.length === 0 && (
              <Text color="gray.500">Nenhum participante encontrado.</Text>
            )}
            {participantes.map((p) => (
              <Flex
                key={p.id}
                p={4}
                borderWidth={1}
                borderRadius="md"
                align="center"
                justify="space-between"
                bg="white"
                boxShadow="sm"
              >
                <Box>
                  <Text fontWeight="bold">{p.nome}</Text>
                  <Text fontSize="sm" color="gray.600">{p.email}</Text>
                  <Text fontSize="sm" color="gray.600">Matrícula: {p.matricula}</Text>
                  <Text fontSize="sm" color={p.status === 'Ativo' ? "green.600" : "gray.500"}>{p.status}</Text>
                </Box>
                <HStack>
                  <Button size="sm" colorScheme="blue" variant="outline">Ver Respostas</Button>
                </HStack>
              </Flex>
            ))}
          </Stack>
        </Box>
        <Button mt={8} colorScheme="gray" onClick={() => router.push(`/editar-formulario/${formId}`)}>
          Voltar para o formulário
        </Button>
      </Box>
    </Box>
  );
} 