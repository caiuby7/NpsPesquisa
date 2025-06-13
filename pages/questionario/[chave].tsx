import { useRouter } from "next/router";
import { Box, Button, Heading, Stack, Text } from "@chakra-ui/react";
import { AppHeader } from "@/app/features/header/header.component";
import { useEffect, useState } from "react";
import { api } from "@/app/services/api";
import ExecutionForm from "@/app/widgets/execution-question/execution-question.component";

interface QuestionarioResponse {
  questionario: {
    id: number;
    titulo: string;
    descricao: string;
    dataInicio: string;
    dataFim: string;
    questoes: any[];
  };
  aluno: {
    id: number;
    nome: string;
    email: string;
  };
}

export default function QuestionarioPorChavePage() {
  const router = useRouter();
  const { chave } = router.query;
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
      <Box>
        <AppHeader />
        <Box p={8} maxW="900px" m="auto">
          <Text>Carregando questionário...</Text>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box>
        <AppHeader />
        <Box p={8} maxW="900px" m="auto">
          <Stack gap={8}>
            <Heading>Questionário não encontrado</Heading>
            <Text>O link pode ter expirado ou o questionário não existe mais.</Text>
            <Button colorScheme="blue" onClick={() => router.push("/")}>
              Voltar para o início
            </Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <AppHeader />
      <Box p={8} maxW="900px" m="auto">
        <Stack gap={8}>
          <Heading>{data.questionario.titulo}</Heading>
          <Text>{data.questionario.descricao}</Text>
          <Text fontSize="sm" color="gray.600">
            Olá, {data.aluno.nome}! Por favor, responda o questionário abaixo.
          </Text>
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