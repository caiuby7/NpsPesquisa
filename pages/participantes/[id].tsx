import { useRouter } from "next/router";
import { Box, Button, Heading, Text, Stack, Flex, Input, HStack } from "@chakra-ui/react";
import { AppHeader } from "@/app/features/header/header.component";
import { useEffect, useState } from "react";
import { api } from "@/app/services/api";

interface Participante {
  id: number;
  nome: string;
  email: string;
  matricula: string;
  status: "Ativo" | "Inativo";
}

export default function EditarParticipantePage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(false);
  const [participante, setParticipante] = useState<Participante>({
    id: 0,
    nome: "",
    email: "",
    matricula: "",
    status: "Ativo"
  });

  useEffect(() => {
    if (id) {
      fetchParticipante();
    }
  }, [id]);

  async function fetchParticipante() {
    try {
      const res = await api.get(`/Aluno/${id}`);
      const data = res.data;
      setParticipante({
        id: data.id,
        nome: data.nome,
        email: data.emailInstitucional || data.emailPessoal,
        matricula: data.matricula,
        status: data.statusNoPeriodoLetivo === "Ativo" ? "Ativo" : "Inativo"
      });
    } catch (e) {
      router.push("/participantes");
    }
  }

  const handleSave = async () => {
    if (!participante.nome || !participante.email || !participante.matricula) {
      return;
    }

    setLoading(true);
    try {
      await api.put(`/Aluno/${id}`, {
        nome: participante.nome,
        emailInstitucional: participante.email,
        matricula: participante.matricula,
      });
      router.push("/participantes");
    } catch (e) {
      // Handle error
    }
    setLoading(false);
  };

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="600px" m="auto">
        <Heading mb={8}>Editar Participante</Heading>
        <Stack gap={4}>
          <Box>
            <Text fontWeight="bold">Nome</Text>
            <Input
              value={participante.nome}
              onChange={(e) => setParticipante({ ...participante, nome: e.target.value })}
              placeholder="Nome do participante"
            />
          </Box>
          <Box>
            <Text fontWeight="bold">E-mail</Text>
            <Input
              value={participante.email}
              onChange={(e) => setParticipante({ ...participante, email: e.target.value })}
              placeholder="E-mail do participante"
              type="email"
            />
          </Box>
          <Box>
            <Text fontWeight="bold">Matrícula</Text>
            <Input
              value={participante.matricula}
              onChange={(e) => setParticipante({ ...participante, matricula: e.target.value })}
              placeholder="Matrícula do participante"
            />
          </Box>
          <Button
            colorScheme="teal"
            onClick={handleSave}
            loading={loading}
            width="100%"
          >
            Salvar Alterações
          </Button>
          <Button
            colorScheme="gray"
            onClick={() => router.push("/participantes")}
            width="100%"
          >
            Cancelar
          </Button>
        </Stack>
      </Box>
    </Box>
  );
} 