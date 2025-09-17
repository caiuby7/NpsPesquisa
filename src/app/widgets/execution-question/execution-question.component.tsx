import { Box, Button, Stack, Text, Heading, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { QuestionTypeExecution } from "./question-type-execution.component";
import { QuestionResponse } from "../../services/form";
import { OptionItem } from "../../services/form/form.services.types";
import { useConditionalQuestions } from "../../../hooks/useConditionalQuestions";

interface ItemAvaliado {
  id: number;
  tipoItemAvaliado: string;
  nomeItemEspecifico: string;
  descricaoItem?: string;
  itemAvaliadoId?: number;
  professorId?: number;
  disciplinaId?: number;
  turmaDisciplinaId?: number;
  cursoId?: number;
  turmaId?: number;
  coordenadorId?: number;
}

interface ExecutionFormProps {
  questionarioId: number;
  participanteId: number;
  chave: string;
  tipoItemAvaliado?: string;
  itensAvaliados?: ItemAvaliado[];
}

export default function ExecutionForm({ questionarioId, participanteId, chave, tipoItemAvaliado, itensAvaliados }: ExecutionFormProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<Record<string | number, any>>({});
  const [invalidRequired, setInvalidRequired] = useState<number[]>([]);
  
  const questoes = data?.questionario?.questoes || [];
  const { shouldShowQuestion, handleAnswer, getVisibleQuestions } = useConditionalQuestions(questoes);
  
  // Determinar se deve usar estrutura agrupada por itens
  // Usar estrutura agrupada quando há itens avaliados (independente do tipo)
  const shouldUseGroupedStructure = itensAvaliados && itensAvaliados.length > 0;
  
  // Debug: Log das questões carregadas
  console.log('🔍 Debug - Questões carregadas:', {
    dataExists: !!data,
    questionarioExists: !!data?.questionario,
    questoesCount: questoes.length,
    questoes: questoes.map((q: QuestionResponse) => ({ id: q.id, texto: q.texto, tipo: q.tipo, isCondicional: q.isCondicional }))
  });

  // Debug: Log da estrutura agrupada
  console.log('🔍 Debug - Estrutura agrupada:', {
    tipoItemAvaliado,
    itensAvaliados,
    itensAvaliadosLength: itensAvaliados?.length,
    shouldUseGroupedStructure
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

  const handleResponseChange = (questionId: string | number, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Notificar o hook de questões condicionais sobre a mudança
    // Para questões agrupadas, extrair o ID da questão da chave
    if (typeof questionId === 'number') {
      handleAnswer(questionId, value);
    } else if (typeof questionId === 'string' && questionId.includes('_')) {
      // Para questões agrupadas (formato: "questaoId_itemId"), processar a questão principal
      const questaoId = parseInt(questionId.split('_')[0]);
      handleAnswer(questaoId, value);
    }
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
    const obrigatoriasNaoRespondidas = todasQuestoes.filter((q: QuestionResponse) => {
      if (!q.obrigatorio) return false;
      
      if (shouldUseGroupedStructure && itensAvaliados) {
        // Para estrutura agrupada, verificar se todas as respostas para cada item foram respondidas
        const naoRespondida = itensAvaliados.some((item) => {
          const respostaKey = `${q.id}_${item.id}`;
          const resposta = responses[respostaKey];
          const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
            (Array.isArray(resposta) && resposta.length === 0);
          
          console.log(`🔍 Validação agrupada - Questão ${q.id}, Item ${item.id}:`, {
            respostaKey,
            resposta,
            isEmpty,
            obrigatorio: q.obrigatorio
          });
          
          return isEmpty;
        });
        
        return naoRespondida;
      } else {
        // Para estrutura normal, verificar a resposta direta
        const resposta = responses[q.id];
        const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
          (Array.isArray(resposta) && resposta.length === 0);
          
        console.log(`🔍 Validação normal - Questão ${q.id}:`, {
          resposta,
          isEmpty,
          obrigatorio: q.obrigatorio
        });
        
        return isEmpty;
      }
    });
    
    console.log('🔍 Debug - Validação completa:', {
      todasQuestoes: todasQuestoes.map(q => ({ id: q.id, texto: q.texto, obrigatorio: q.obrigatorio })),
      responses: responses,
      shouldUseGroupedStructure,
      itensAvaliados: itensAvaliados?.map(i => ({ id: i.id, nome: i.nomeItemEspecifico })),
      obrigatoriasNaoRespondidas: obrigatoriasNaoRespondidas.map(q => ({ id: q.id, texto: q.texto }))
    });
    
    if (obrigatoriasNaoRespondidas.length > 0) {
      setInvalidRequired(obrigatoriasNaoRespondidas.map((q: QuestionResponse) => q.id));
      alert("Por favor, responda todas as questões obrigatórias.");
      return;
    }
    setInvalidRequired([]);
    try {
      let respostas: any[] = [];

      if (shouldUseGroupedStructure && itensAvaliados) {
        // Processar respostas agrupadas por itens
        todasQuestoes.forEach((questao: QuestionResponse) => {
          itensAvaliados.forEach((item) => {
            const respostaKey = `${questao.id}_${item.id}`;
            const resposta = responses[respostaKey];
            
            if (resposta !== undefined && resposta !== null && resposta !== "") {
              if (questao.tipo === "MultiplaEscolha" || questao.tipo === "MenuSuspenso") {
                respostas.push({ 
                  questaoId: questao.id, 
                  opcaoId: resposta,
                  itemAvaliadoId: item.id
                });
              } else if (questao.tipo === "EscalaLinear") {
                const opcao = questao.opcoes?.find((o: OptionItem) => String(o.valor) === String(resposta));
                respostas.push({
                  questaoId: questao.id,
                  opcaoId: opcao?.id,
                  valor: String(resposta),
                  itemAvaliadoId: item.id
                });
              } else if (questao.tipo === "Matriz") {
                if (Array.isArray(resposta)) {
                  resposta.forEach((colunaId, idx) => {
                    const opcao = questao.opcoes?.[idx];
                    if (colunaId && opcao) {
                      respostas.push({ 
                        questaoId: questao.id, 
                        opcaoId: opcao.id, 
                        colunaId,
                        itemAvaliadoId: item.id
                      });
                    }
                  });
                }
              } else {
                // CaixaTexto ou default
                respostas.push({ 
                  questaoId: questao.id, 
                  valor: resposta,
                  itemAvaliadoId: item.id
                });
              }
            }
          });
        });
      } else {
        // Processar respostas normais
        respostas = todasQuestoes.flatMap((questao: QuestionResponse): any[] => {
          const resposta = responses[questao.id];
          if (questao.tipo === "MultiplaEscolha" || questao.tipo === "MenuSuspenso") {
            return resposta ? [{ questaoId: questao.id, opcaoId: resposta }] : [];
          }
          if (questao.tipo === "EscalaLinear") {
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
      }

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

  // Removido o botão "Começar Questionário" - agora controlado pela página principal

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

  // Função para renderizar questão agrupada por itens
  const renderGroupedQuestion = (questao: QuestionResponse) => {
    if (!itensAvaliados || itensAvaliados.length === 0) {
      // Se não há itens avaliados, usar renderização normal
      return renderNormalQuestion(questao);
    }

    // Questões condicionais também devem ser renderizadas agrupadas quando há itens avaliados
    // para que funcionem independentemente do item avaliado

    // Se for CaixaTexto, renderizar como campo de texto simples
    if (questao.tipo === "CaixaTexto") {
      return (
        <VStack spacing={4} align="stretch">
          {itensAvaliados.map((item) => (
            <Box key={item.id} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden">
              {/* Cabeçalho da Disciplina */}
              <Box bg="blue.600" p={4}>
                <HStack spacing={3}>
                  <Box w={6} h={6} bg="white" borderRadius="sm" display="flex" alignItems="center" justifyContent="center">
                    <Text color="blue.600" fontSize="sm" fontWeight="bold">📚</Text>
                  </Box>
                  <VStack spacing={1} align="start">
                    <Text fontWeight="bold" fontSize="lg" color="white">
                      {item.nomeItemEspecifico}
                    </Text>
                    {item.descricaoItem && (
                      <Text fontSize="sm" color="blue.100" fontWeight="normal">
                        {item.descricaoItem}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>

              {/* Campo de Texto */}
              <Box p={4}>
                <Text mb={4} fontWeight="medium" color="gray.700">
                  {questao.texto}
                  {questao.obrigatorio && <Text as="span" color="red.500" ml={1}>*</Text>}
                </Text>
                <textarea
                  value={responses[`${questao.id}_${item.id}`] || ""}
                  onChange={(e) => handleResponseChange(`${questao.id}_${item.id}`, e.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  required={!!questao.obrigatorio}
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
              </Box>
            </Box>
          ))}
        </VStack>
      );
    }

    // Renderizar questão para cada item avaliado
    return (
      <VStack spacing={4} align="stretch">
        {itensAvaliados.map((item) => (
          <Box key={item.id} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" overflow="hidden">
            {/* Cabeçalho do Item */}
            <Box bg="blue.600" p={4}>
              <HStack spacing={3}>
                <Box w={6} h={6} bg="white" borderRadius="sm" display="flex" alignItems="center" justifyContent="center">
                  <Text color="blue.600" fontSize="sm" fontWeight="bold">📚</Text>
                </Box>
                <VStack spacing={1} align="start">
                  <Text fontWeight="bold" fontSize="lg" color="white">
                    {item.nomeItemEspecifico}
                  </Text>
                  {item.descricaoItem && (
                    <Text fontSize="sm" color="blue.100" fontWeight="normal">
                      {item.descricaoItem}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>

            {/* Questão Principal */}
            <Box p={4}>
              <QuestionTypeExecution
                type={questao.tipo}
                question={{ ...questao, obrigatorio: questao.obrigatorio }}
                value={responses[`${questao.id}_${item.id}`]}
                onChange={(value) => handleResponseChange(`${questao.id}_${item.id}`, value)}
                requiredAsterisk={!!questao.obrigatorio}
              />
            </Box>

            {/* Questões Condicionais - renderizar para cada item se estiverem visíveis */}
            {questao.opcoes?.map((opcao) => {
              if (opcao.ativaCondicao && opcao.questaoCondicionalId) {
                // Verificar se a opção está selecionada para este item
                const respostaQuestao = responses[`${questao.id}_${item.id}`];
                const isOptionSelected = Array.isArray(respostaQuestao) 
                  ? respostaQuestao.includes(String(opcao.id)) 
                  : String(respostaQuestao) === String(opcao.id);

                if (isOptionSelected && (opcao as any).questaoCondicional) {
                  const questaoCondicional = (opcao as any).questaoCondicional;
                  return (
                    <Box key={`${questaoCondicional.id}_${item.id}`} p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
                      <QuestionTypeExecution
                        type={questaoCondicional.tipo}
                        question={{ ...questaoCondicional, obrigatorio: questaoCondicional.obrigatorio }}
                        value={responses[`${questaoCondicional.id}_${item.id}`]}
                        onChange={(value) => handleResponseChange(`${questaoCondicional.id}_${item.id}`, value)}
                        requiredAsterisk={!!questaoCondicional.obrigatorio}
                      />
                    </Box>
                  );
                }
              }
              return null;
            })}
          </Box>
        ))}
      </VStack>
    );
  };

  // Função para renderizar questão normal
  const renderNormalQuestion = (questao: QuestionResponse) => {
    return (
      <Box
        key={questao.id}
        mb={6}
        p={6}
        bg="white"
        borderRadius="lg"
        border="1px solid"
        borderColor={invalidRequired.includes(questao.id) ? "red.300" : "gray.200"}
        boxShadow="sm"
        _hover={{ 
          borderColor: "blue.300",
          boxShadow: "md"
        }}
        transition="all 0.2s"
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
  };

  return (
    <Box>
      <Stack gap={8}>
        {visibleQuestions.map((questao: QuestionResponse) => {
          console.log(`🔍 Renderizando questão ${questao.id} (${questao.texto})`);
          
          // Para Curso, Estrutura e Infraestrutura, sempre usar renderização normal
          if (tipoItemAvaliado === "Curso" || tipoItemAvaliado === "Estrutura" || tipoItemAvaliado === "Infraestrutura") {
            return renderNormalQuestion(questao);
          }
          
          // Para todos os outros tipos (Professor, Disciplina, TurmaDisciplina, Estagio, 
          // ProjetoExtensionista, Coordenador, Alunos, Turma, TCC), usar estrutura agrupada quando há itens avaliados
          if (shouldUseGroupedStructure) {
            return renderGroupedQuestion(questao);
          } else {
            return renderNormalQuestion(questao);
          }
        })}
        
        {/* Botão de Envio */}
        <Box textAlign="center" mt={6}>
          <Button
            bg="blue.500"
            color="white"
            size="lg"
            onClick={handleSubmit}
            disabled={Object.keys(responses).length === 0}
            px={12}
            py={3}
            fontSize="md"
            fontWeight="semibold"
            borderRadius="lg"
            boxShadow="md"
            _hover={{
              bg: "blue.600",
              transform: "translateY(-1px)",
              boxShadow: "lg"
            }}
            _disabled={{
              bg: "gray.300",
              color: "gray.500",
              cursor: "not-allowed"
            }}
            transition="all 0.2s"
          >
            Enviar Respostas
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
