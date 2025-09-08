import { Box, Button, Stack, Text, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { QuestionTypeExecution } from "./question-type-execution.component";
import { QuestionResponse } from "../../services/form";
import { OptionItem } from "../../services/form/form.services.types";
import { useConditionalQuestions } from "../../../hooks/useConditionalQuestions";

interface ExecutionFormProps {
  questionarioId: number;
  participanteId: number;
  chave: string;
}

export default function ExecutionForm({ questionarioId, participanteId, chave }: ExecutionFormProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [started, setStarted] = useState(false);
  const [invalidRequired, setInvalidRequired] = useState<number[]>([]);
  
  const questoes = data?.questionario?.questoes || [];
  const { shouldShowQuestion, handleAnswer, getVisibleQuestions } = useConditionalQuestions(questoes);
  
  // Debug: Log das questões carregadas
  console.log('🔍 Debug - Questões carregadas:', {
    dataExists: !!data,
    questionarioExists: !!data?.questionario,
    questoesCount: questoes.length,
    questoes: questoes.map((q: QuestionResponse) => ({ id: q.id, texto: q.texto, tipo: q.tipo, isCondicional: q.isCondicional }))
  });

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
    
    // Notificar o hook de questões condicionais sobre a mudança
    handleAnswer(questionId, value);
  };

  const handleSubmit = async () => {
    // Coletar todas as questões (principais + condicionais VISÍVEIS) para validação
    const todasQuestoes: QuestionResponse[] = [];
    
    // Adicionar questões principais
    questoes.forEach((q: QuestionResponse) => {
      todasQuestoes.push(q);
      
      // Adicionar questões condicionais das opções APENAS se a opção estiver selecionada
      q.opcoes?.forEach((opcao: any) => {
        if (opcao.questaoCondicional && opcao.ativaCondicao) {
          // Verificar se a opção que ativa a condição está selecionada
          const respostaQuestao = responses[q.id];
          const isOptionSelected = Array.isArray(respostaQuestao) 
            ? respostaQuestao.includes(String(opcao.id)) 
            : String(respostaQuestao) === String(opcao.id);
            
          if (isOptionSelected) {
            todasQuestoes.push(opcao.questaoCondicional);
          }
        }
      });
      
      // Adicionar questões condicionais das colunas APENAS se a coluna estiver selecionada
      q.colunas?.forEach((coluna: any) => {
        if (coluna.questaoCondicional && coluna.ativaCondicao) {
          // Verificar se a coluna que ativa a condição está selecionada
          const respostaQuestao = responses[q.id];
          const isColumnSelected = Array.isArray(respostaQuestao) 
            ? respostaQuestao.includes(String(coluna.id)) 
            : String(respostaQuestao) === String(coluna.id);
            
          if (isColumnSelected) {
            todasQuestoes.push(coluna.questaoCondicional);
          }
        }
      });
    });

    // Validação manual de obrigatórios (principais + condicionais VISÍVEIS)
    const obrigatoriasNaoRespondidas = todasQuestoes.filter((q: QuestionResponse) =>
      q.obrigatorio &&
      (responses[q.id] === undefined || responses[q.id] === "" || responses[q.id] === null ||
        (Array.isArray(responses[q.id]) && responses[q.id].length === 0))
    );
    
    if (obrigatoriasNaoRespondidas.length > 0) {
      setInvalidRequired(obrigatoriasNaoRespondidas.map((q: QuestionResponse) => q.id));
      alert("Por favor, responda todas as questões obrigatórias.");
      return;
    }
    setInvalidRequired([]);
    try {
      const respostas = todasQuestoes.flatMap((questao: QuestionResponse): any[] => {
        const resposta = responses[questao.id];
        if (questao.tipo === "MultiplaEscolha" || questao.tipo === "MenuSuspenso") {
          return resposta ? [{ questaoId: questao.id, opcaoId: resposta }] : [];
        }
        if (
          typeof questao.tipo === 'string' && (
            questao.tipo.toLowerCase() === "escalalinear" ||
            questao.tipo.toLowerCase() === "linear_scale"
          )
        ) {
          const opcao = questao.opcoes?.find((o: OptionItem) => String(o.valor) === String(resposta));
          if (resposta !== undefined && resposta !== null && resposta !== "") {
            return [{
              questaoId: questao.id,
              opcaoId: opcao?.id,
              valor: String(resposta)
            }];
          }
          return [];
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

      console.log("Respostas montadas:", respostas);

      await api.post(`/Questionario/responder/${chave}`, {
        questionarioId,
        participanteId,
        respostas
      });

      alert("Respostas enviadas com sucesso!");
      // Tentar fechar a janela. Se não for possível, redirecionar para a home
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          window.location.href = "/responder";
        }
      }, 100);
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

  // Debug: Log das questões e visibilidade
  console.log('🔍 Debug ExecutionForm:', {
    questoes: questoes.length,
    questoesData: questoes.map((q: QuestionResponse) => ({ id: q.id, texto: q.texto, isCondicional: q.isCondicional })),
    responses: Object.keys(responses).length
  });

  // Obter questões visíveis ordenadas
  const visibleQuestions = getVisibleQuestions();
  
  console.log('🔍 Debug - Questões visíveis para renderização:', {
    total: visibleQuestions.length,
    questoes: visibleQuestions.map(q => ({ id: q.id, texto: q.texto, isCondicional: q.isCondicional }))
  });

  return (
    <Box>
      <Stack gap={8}>
        {visibleQuestions.map((questao: QuestionResponse) => {
          console.log(`🔍 Renderizando questão ${questao.id} (${questao.texto})`);
          
          return (
            <Box
              key={questao.id}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={invalidRequired.includes(questao.id) ? "red.500" : undefined}
            >
              <QuestionTypeExecution
                type={questao.tipo}
                question={{ ...questao, obrigatorio: questao.obrigatorio }}
                value={responses[questao.id]}
                onChange={(value) => handleResponseChange(questao.id, value)}
                requiredAsterisk={!!questao.obrigatorio}
              />
            </Box>
          );
        })}
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
