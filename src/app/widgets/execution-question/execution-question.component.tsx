import { Box, Button, Stack, Text, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { QuestionTypeExecution } from "./question-type-execution.component";
import { QuestionResponse } from "../../services/form";
import { OptionItem } from "../../services/form/form.services.types";

interface ExecutionFormProps {
  questionarioId: number;
  alunoId: number;
  chave: string;
}

export default function ExecutionForm({ questionarioId, alunoId, chave }: ExecutionFormProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [started, setStarted] = useState(false);

  useEffect(() => {
    async function loadQuestionario() {
      try {
        const response = await api.get(`/Questionario/por-chave/${chave}`);
        console.log('Dados do questionário:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Erro ao carregar questionário:', error);
        alert("Erro ao carregar questionário. O link pode ter expirado ou o questionário não existe mais.");
      } finally {
        setLoading(false);
      }
    }

    if (chave) {
      loadQuestionario();
    }
  }, [chave]);

  const handleResponseChange = (questionId: number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const respostas = questoes.flatMap((questao: QuestionResponse) => {
        const resposta = responses[questao.id];
        if (questao.tipo === "MultiplaEscolha" || questao.tipo === "MenuSuspenso") {
          return resposta ? [{ questaoId: questao.id, opcaoId: resposta }] : [];
        }
        if (questao.tipo === "EscalaLinear") {
          // Procurar a opção correspondente ao valor selecionado
          const opcao = questao.opcoes?.find((o: OptionItem) => o.valor == String(resposta));
          return opcao ? [{ questaoId: questao.id, opcaoId: opcao.id }] : [];
        }
        if (questao.tipo === "Matriz") {
          // resposta é um array: cada índice é uma linha, valor é colunaId
          if (Array.isArray(resposta)) {
            return resposta.map((colunaId, idx) => {
              const opcao = questao.opcoes?.[idx];
              return colunaId && opcao ? { questaoId: questao.id, opcaoId: opcao.id, colunaId } : null;
            }).filter(Boolean);
          }
          return [];
        }
        // CaixaTexto ou default
        return resposta ? [{ questaoId: questao.id, valor: resposta }] : [];
      });

      await api.post(`/Questionario/responder/${chave}`, {
        questionarioId,
        alunoId,
        respostas
      });

      alert("Respostas enviadas com sucesso!");
    } catch (error) {
      console.error('Erro ao enviar respostas:', error);
      alert("Erro ao enviar respostas. Por favor, tente novamente.");
    }
  };

  if (loading) {
    return (
      <Box p={4}>
        <Text>Carregando questionário...</Text>
      </Box>
    );
  }

  if (!data || !data.questionario) {
    return (
      <Box p={4}>
        <Text>Questionário não encontrado</Text>
      </Box>
    );
  }

  const questoes = data.questionario.questoes || [];

  if (!started) {
    return (
      <Box p={8} bg="white" borderRadius="lg" boxShadow="md">
        <Stack spacing={6} align="center">
          <Text fontSize="lg" textAlign="center">
            {data.questionario.textoBoasVindas || "Suas respostas são muito importantes para nós."}
          </Text>
          <Button
            colorScheme="red"
            size="lg"
            onClick={() => setStarted(true)}
            px={8}
          >
            Começar Questionário
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack gap={8}>
        {questoes.map((questao: QuestionResponse) => (
          <Box key={questao.id} p={4} borderWidth="1px" borderRadius="lg">
            <QuestionTypeExecution
              type={questao.tipo}
              question={questao}
              value={responses[questao.id]}
              onChange={(value) => handleResponseChange(questao.id, value)}
            />
          </Box>
        ))}
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          disabled={Object.keys(responses).length === 0}
        >
          Enviar Respostas
        </Button>
      </Stack>
    </Box>
  );
}
