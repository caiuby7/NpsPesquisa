import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../app/services/api";
import ExecutionForm from "../../app/widgets/execution-question/execution-question.component";
import { QuestionResponse } from "../../app/services/form";

interface QuestionarioResponse {
  questionario: {
    id: number;
    titulo: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    questoes: QuestionResponse[];
  };
  aluno: {
    id: number;
    nome: string;
    email: string;
  };
}

export default function QuestionarioPorChavePage() {
  const { chave } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<QuestionarioResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestionario() {
      if (!chave) return;
      try {
        const response = await api.get(`/Questionario/por-chave/${chave}`);
        setData(response.data);
      } catch (error) {
        alert("Erro ao carregar questionário. O link pode ter expirado ou o questionário não existe mais.");
      } finally {
        setLoading(false);
      }
    }
    loadQuestionario();
  }, [chave]);

  if (loading) {
    return (
      <Box minH="100vh" bgImage="url('/login-bg.jpg')" backgroundSize="cover" backgroundPosition="center">
        <Box p={8} maxW="900px" m="auto">
          <Text>Carregando questionário...</Text>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box minH="100vh" bgImage="url('/login-bg.jpg')" backgroundSize="cover" backgroundPosition="center">
        <Box p={8} maxW="900px" m="auto" bg="rgba(255,255,255,0.85)" borderRadius="2xl" border="2px solid rgba(255,255,255,0.5)">
          <Stack gap={8}>
            <Heading>Questionário não encontrado</Heading>
            <Text>O link pode ter expirado ou o questionário não existe mais.</Text>
            <Button colorScheme="blue" onClick={() => navigate("/")}>Voltar para o início</Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bgImage="url('/login-bg.jpg')" backgroundSize="cover" backgroundPosition="center">
      <Box p={8} maxW="900px" m="auto" bg="rgba(255,255,255,0.85)" borderRadius="2xl" border="2px solid rgba(255,255,255,0.5)">
        <Stack gap={8}>
          <Box display="flex" alignItems="center" mb={4}>
            <img src="/logo.png" alt="Logo" style={{ height: 48, marginRight: 16 }} />
            <Heading as="h1" size="lg">{data.questionario.titulo}</Heading>
          </Box>
          
          <ExecutionForm 
            questionarioId={data.questionario.id}
            alunoId={data.aluno.id}
            chave={chave as string}
          />
        </Stack>
      </Box>
    </Box>
  );
} 