import { Box, Button, Stack, Text, Heading, VStack, HStack, Table, Thead, Tbody, Tr, Th, Td, useToast, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { api } from "../../services/api";
import { QuestionTypeExecution } from "./question-type-execution.component";
import { QuestionResponse } from "../../services/form";
import { OptionItem } from "../../services/form/form.services.types";
import { useConditionalQuestions } from "../../../hooks/useConditionalQuestions";
import { useQuestionarioAutoSave } from "../../../hooks/useQuestionarioAutoSave";

// Interface estendida para lidar com questões condicionais completas no payload
interface OptionItemWithConditional extends OptionItem {
  questaoCondicional?: QuestionResponse;
}

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
  const [submitting, setSubmitting] = useState(false);
  const [invalidRequired, setInvalidRequired] = useState<number[]>([]);
  const [showRecoveryAlert, setShowRecoveryAlert] = useState(false);
  
  // TEMPORÁRIO: Desabilitar auto-save completamente para resolver bloqueio
  // const {
  //   responses,
  //   updateResponse,
  //   clearResponses,
  //   saveManually,
  //   isLoading: autoSaveLoading,
  //   hasUnsavedChanges,
  //   lastSaved,
  //   hasSavedResponses,
  //   showRecoveryNotification
  // } = useQuestionarioAutoSave({
  //   questionarioId,
  //   participanteId,
  //   chave,
  //   tipoItemAvaliado,
  //   itensAvaliados
  // });

  // Estado local temporário
  const [responses, setResponses] = useState<Record<string | number, any>>({});
  const autoSaveLoading = false;
  const hasUnsavedChanges = false;
  const lastSaved = null;
  const hasSavedResponses = false;
  const showRecoveryNotification = false;

  const updateResponse = (questionId: string | number, value: any) => {
    console.log('🔄 updateResponse local:', { questionId, value });
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const clearResponses = () => {
    console.log('🗑️ clearResponses local');
    setResponses({});
  };

  const saveManually = () => {
    console.log('💾 saveManually local - não implementado');
  };
  
  const questoes = data?.questionario?.questoes || [];
  const { shouldShowQuestion, handleAnswer, getVisibleQuestions } = useConditionalQuestions(questoes);
  
  // Debug do estado das respostas
  console.log('🔍 Estado das respostas:', {
    responses,
    responsesCount: Object.keys(responses).length,
    responsesKeys: Object.keys(responses),
    questoesCount: questoes.length,
    questoesIds: questoes.map((q: QuestionResponse) => q.id)
  });

  // Debug: Verificar se há questões duplicadas
  const questoesIds = questoes.map((q: QuestionResponse) => q.id);
  const questoesDuplicadas = questoesIds.filter((id: number, index: number) => questoesIds.indexOf(id) !== index);
  if (questoesDuplicadas.length > 0) {
    console.warn('⚠️ QUESTÕES DUPLICADAS ENCONTRADAS:', {
      duplicadas: questoesDuplicadas,
      totalQuestoes: questoes.length,
      questoesIds: questoesIds
    });
  }
  
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
  
  // Debug específico para Curso
  if (tipoItemAvaliado === "Curso") {
    console.log('🎓 Debug - Item Avaliado: CURSO:', {
      tipoItemAvaliado,
      itensAvaliados,
      itensAvaliadosLength: itensAvaliados?.length,
      shouldUseGroupedStructure,
      itensAvaliadosData: itensAvaliados?.map(i => ({ 
        id: i.id, 
        nome: i.nomeItemEspecifico,
        cursoId: i.cursoId,
        itemAvaliadoId: i.itemAvaliadoId
      }))
    });
  }
  
  // Debug específico para questão 44
  const questao44 = questoes.find((q: QuestionResponse) => q.id === 44);
  if (questao44) {
    console.log('🔍 Debug - Questão 44 encontrada:', {
      id: questao44.id,
      texto: questao44.texto?.substring(0, 100) + "...",
      tipo: questao44.tipo,
      obrigatorio: questao44.obrigatorio,
      shouldUseGroupedStructure,
      itensAvaliados: itensAvaliados?.map(i => ({ id: i.id, nome: i.nomeItemEspecifico }))
    });
  }

  // Debug: Log da estrutura agrupada
  console.log('🔍 Debug - Estrutura agrupada:', {
    tipoItemAvaliado,
    itensAvaliados,
    itensAvaliadosLength: itensAvaliados?.length,
    shouldUseGroupedStructure
  });

  // Notificação de recuperação de respostas
  useEffect(() => {
    if (showRecoveryNotification && !showRecoveryAlert) {
      setShowRecoveryAlert(true);
    }
  }, [showRecoveryNotification, showRecoveryAlert]);

  useEffect(() => {
    async function loadQuestionario() {
      try {
        // Verificar se o token está disponível
        const token = localStorage.getItem('token');
        console.log('🔍 Token disponível ao carregar questionário:', !!token);
        
        const response = await api.get(`/Questionario/por-chave/${chave}`);
        console.log('Dados do questionário:', response.data);
        setData(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar questionário:', error);
        console.error('Detalhes do erro:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.response?.data?.message
        });
        
        // Verificar se é a mensagem específica do backend
        if (error.response?.data?.message) {
          alert(error.response.data.message);
        } else if (error.response?.status === 400) {
          // Para status 400, tentar extrair a mensagem de diferentes formas
          const message = error.response?.data?.message || error.response?.data || "Erro ao carregar questionário.";
          alert(message);
        } else {
          alert("Erro ao carregar questionário. O link pode ter expirado ou o questionário não existe mais.");
        }
      } finally {
        setLoading(false);
      }
    }

    if (chave) {
      loadQuestionario();
    }
  }, [chave]);

  const handleResponseChange = (questionId: string | number, value: any) => {
    console.log('🔄 handleResponseChange chamado:', { questionId, value, type: typeof questionId });
    
    // Usar o hook de auto-save
    updateResponse(questionId, value);
    
    // Notificar o hook de questões condicionais sobre a mudança
    // Para questões agrupadas, extrair o ID da questão da chave
    if (typeof questionId === 'number') {
      console.log('🔢 Processando questão normal:', questionId);
      handleAnswer(questionId, value);
    } else if (typeof questionId === 'string' && questionId.includes('_')) {
      // Para questões agrupadas (formato: "questaoId_itemId"), processar a questão principal
      const questaoId = parseInt(questionId.split('_')[0]);
      console.log('🔗 Processando questão agrupada:', { questionId, questaoId });
      handleAnswer(questaoId, value);
    }
  };

  // Função para verificar se todas as questões obrigatórias foram respondidas
  const areAllRequiredQuestionsAnswered = () => {
    console.log('🔍 Debug - areAllRequiredQuestionsAnswered chamada');
    console.log('📊 Estado atual:', {
      questoes: questoes.length,
      responses: Object.keys(responses).length,
      tipoItemAvaliado,
      shouldUseGroupedStructure,
      itensAvaliados: itensAvaliados?.length
    });
    
    // Debug das questões originais
    console.log('📋 Questões originais:', questoes.map((q: QuestionResponse) => ({
      id: q.id,
      texto: q.texto?.substring(0, 30) + "...",
      obrigatorio: q.obrigatorio,
      tipo: q.tipo
    })));
    
    // Coletar todas as questões (principais + condicionais VISÍVEIS) para validação
    const todasQuestoes: QuestionResponse[] = [];
    
    // Adicionar questões principais
    questoes.forEach((q: QuestionResponse) => {
      todasQuestoes.push(q);
      
      // Adicionar questões condicionais das opções APENAS se a opção estiver selecionada
      q.opcoes?.forEach((opcao: any) => {
        if (opcao.questaoCondicional && opcao.ativaCondicao) {
          // Para estrutura agrupada, verificar cada item separadamente
          if (shouldUseGroupedStructure && itensAvaliados) {
            itensAvaliados.forEach((item) => {
              const respostaKey = `${q.id}_${item.id}`;
              const respostaQuestao = responses[respostaKey];
              const isOptionSelected = Array.isArray(respostaQuestao) 
                ? respostaQuestao.includes(String(opcao.id)) 
                : String(respostaQuestao) === String(opcao.id);
              
              console.log(`🔍 Verificando questão condicional agrupada - Questão ${q.id}, Item ${item.id}, Opção ${opcao.id}:`, {
                respostaKey,
                respostaQuestao,
                isOptionSelected,
                questaoCondicional: opcao.questaoCondicional.id
              });
              
              if (isOptionSelected && !todasQuestoes.some(tq => tq.id === opcao.questaoCondicional.id)) {
                console.log(`✅ Adicionando questão condicional ${opcao.questaoCondicional.id} à validação (estrutura agrupada)`);
                todasQuestoes.push(opcao.questaoCondicional);
              }
            });
          } else {
            // Para estrutura normal
            const respostaQuestao = responses[q.id];
            const isOptionSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(opcao.id)) 
              : String(respostaQuestao) === String(opcao.id);
              
            console.log(`🔍 Verificando questão condicional normal - Questão ${q.id}, Opção ${opcao.id}:`, {
              respostaQuestao,
              isOptionSelected,
              questaoCondicional: opcao.questaoCondicional.id
            });
              
            if (isOptionSelected) {
              console.log(`✅ Adicionando questão condicional ${opcao.questaoCondicional.id} à validação`);
              todasQuestoes.push(opcao.questaoCondicional);
            } else {
              console.log(`❌ Questão condicional ${opcao.questaoCondicional.id} NÃO adicionada (opção não selecionada)`);
            }
          }
        }
      });
      
      // Adicionar questões condicionais das colunas APENAS se a coluna estiver selecionada
      q.colunas?.forEach((coluna: any) => {
        if (coluna.questaoCondicional && coluna.ativaCondicao) {
          // Para estrutura agrupada, verificar cada item separadamente
          if (shouldUseGroupedStructure && itensAvaliados) {
            itensAvaliados.forEach((item) => {
              const respostaKey = `${q.id}_${item.id}`;
              const respostaQuestao = responses[respostaKey];
              const isColumnSelected = Array.isArray(respostaQuestao) 
                ? respostaQuestao.includes(String(coluna.id)) 
                : String(respostaQuestao) === String(coluna.id);
              
              console.log(`🔍 Verificando questão condicional coluna agrupada - Questão ${q.id}, Item ${item.id}, Coluna ${coluna.id}:`, {
                respostaKey,
                respostaQuestao,
                isColumnSelected,
                questaoCondicional: coluna.questaoCondicional.id
              });
              
              if (isColumnSelected && !todasQuestoes.some(tq => tq.id === coluna.questaoCondicional.id)) {
                console.log(`✅ Adicionando questão condicional coluna ${coluna.questaoCondicional.id} à validação (estrutura agrupada)`);
                todasQuestoes.push(coluna.questaoCondicional);
              }
            });
          } else {
            // Para estrutura normal
            const respostaQuestao = responses[q.id];
            const isColumnSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(coluna.id)) 
              : String(respostaQuestao) === String(coluna.id);
              
            console.log(`🔍 Verificando questão condicional coluna normal - Questão ${q.id}, Coluna ${coluna.id}:`, {
              respostaQuestao,
              isColumnSelected,
              questaoCondicional: coluna.questaoCondicional.id
            });
              
            if (isColumnSelected) {
              console.log(`✅ Adicionando questão condicional coluna ${coluna.questaoCondicional.id} à validação`);
              todasQuestoes.push(coluna.questaoCondicional);
            } else {
              console.log(`❌ Questão condicional coluna ${coluna.questaoCondicional.id} NÃO adicionada (coluna não selecionada)`);
            }
          }
        }
      });
    });

    // Verificar se todas as questões obrigatórias foram respondidas
    const isQuestaoAgrupada = tipoItemAvaliado !== "Estrutura" && tipoItemAvaliado !== "Pesquisa" && tipoItemAvaliado !== "Infraestrutura" && shouldUseGroupedStructure && itensAvaliados;
    
    return todasQuestoes.every((q: QuestionResponse) => {
      if (!q.obrigatorio) return true;
      
      // Verificar se é uma questão condicional que não deveria estar sendo validada
      const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
        questaoPrincipal.opcoes?.some((opcao: any) => 
          opcao.questaoCondicional?.id === q.id
        ) || questaoPrincipal.colunas?.some((coluna: any) => 
          coluna.questaoCondicional?.id === q.id
        )
      );
      
      if (isQuestaoCondicional) {
        // Para questões condicionais, verificar se a opção que as ativa está selecionada
        const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
          questaoPrincipal.opcoes?.some((opcao: any) => 
            opcao.questaoCondicional?.id === q.id
          ) || questaoPrincipal.colunas?.some((coluna: any) => 
            coluna.questaoCondicional?.id === q.id
          )
        );
        
        if (questaoPrincipal) {
          const respostaQuestao = responses[questaoPrincipal.id];
          const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
            opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
          ) || questaoPrincipal.colunas?.find((coluna: any) => 
            coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
          );
          
          if (opcaoAtiva) {
            const isOptionSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(opcaoAtiva.id)) 
              : String(respostaQuestao) === String(opcaoAtiva.id);
            
            // Só validar se a opção que ativa a condição estiver selecionada
            if (!isOptionSelected) {
              return true; // Não validar esta questão condicional
            }
          }
        }
      }
      
      if (isQuestaoAgrupada) {
        // Para estrutura agrupada, verificar se todas as respostas para cada item foram respondidas
        return !itensAvaliados.some((item) => {
          const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
            questaoPrincipal.opcoes?.some((opcao: any) => 
              opcao.questaoCondicional?.id === q.id
            ) || questaoPrincipal.colunas?.some((coluna: any) => 
              coluna.questaoCondicional?.id === q.id
            )
          );
          
          let respostaKey: string | number = `${q.id}_${item.id}`;
          let resposta = responses[respostaKey];
          
          if (isQuestaoCondicional) {
            const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
              questaoPrincipal.opcoes?.some((opcao: any) => 
                opcao.questaoCondicional?.id === q.id
              ) || questaoPrincipal.colunas?.some((coluna: any) => 
                coluna.questaoCondicional?.id === q.id
              )
            );
            
            if (questaoPrincipal) {
              const respostaQuestaoPrincipal = responses[`${questaoPrincipal.id}_${item.id}`];
              const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
                opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
              ) || questaoPrincipal.colunas?.find((coluna: any) => 
                coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
              );
              
              if (opcaoAtiva) {
                const isOptionSelected = Array.isArray(respostaQuestaoPrincipal) 
                  ? respostaQuestaoPrincipal.includes(String(opcaoAtiva.id)) 
                  : String(respostaQuestaoPrincipal) === String(opcaoAtiva.id);
                
                if (!isOptionSelected) {
                  return false; // Não validar esta questão condicional para este item
                }
                
                respostaKey = `${q.id}_${questaoPrincipal.id}_${item.id}`;
                resposta = responses[respostaKey];
              }
            }
          }
          
          const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
            (Array.isArray(resposta) && resposta.length === 0);
          
          return isEmpty;
        });
      } else {
        // Para estrutura normal, verificar se a questão foi respondida
        const resposta = responses[q.id];
        const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
          (Array.isArray(resposta) && resposta.length === 0);
        
        return !isEmpty;
      }
    });
    
    const result = todasQuestoes.every((q: QuestionResponse) => {
      if (!q.obrigatorio) return true;
      
      console.log(`🔍 Validando questão ${q.id} - ${q.texto?.substring(0, 30)}... - Obrigatória: ${q.obrigatorio}`);
      
      // Verificar se é uma questão condicional que não deveria estar sendo validada
      const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
        questaoPrincipal.opcoes?.some((opcao: any) => 
          opcao.questaoCondicional?.id === q.id
        ) || questaoPrincipal.colunas?.some((coluna: any) => 
          coluna.questaoCondicional?.id === q.id
        )
      );
      
      if (isQuestaoCondicional) {
        // Para questões condicionais, verificar se a opção que as ativa está selecionada
        const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
          questaoPrincipal.opcoes?.some((opcao: any) => 
            opcao.questaoCondicional?.id === q.id
          ) || questaoPrincipal.colunas?.some((coluna: any) => 
            coluna.questaoCondicional?.id === q.id
          )
        );
        
        if (questaoPrincipal) {
          const respostaQuestao = responses[questaoPrincipal.id];
          const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
            opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
          ) || questaoPrincipal.colunas?.find((coluna: any) => 
            coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
          );
          
          if (opcaoAtiva) {
            const isOptionSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(opcaoAtiva.id)) 
              : String(respostaQuestao) === String(opcaoAtiva.id);
            
            // Só validar se a opção que ativa a condição estiver selecionada
            if (!isOptionSelected) {
              return true; // Não validar esta questão condicional
            }
          }
        }
      }
      
      if (isQuestaoAgrupada) {
        // Para estrutura agrupada, verificar se todas as respostas para cada item foram respondidas
        return !itensAvaliados.some((item) => {
          const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
            questaoPrincipal.opcoes?.some((opcao: any) => 
              opcao.questaoCondicional?.id === q.id
            ) || questaoPrincipal.colunas?.some((coluna: any) => 
              coluna.questaoCondicional?.id === q.id
            )
          );
          
          let respostaKey: string | number = `${q.id}_${item.id}`;
          let resposta = responses[respostaKey];
          
          if (isQuestaoCondicional) {
            const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
              questaoPrincipal.opcoes?.some((opcao: any) => 
                opcao.questaoCondicional?.id === q.id
              ) || questaoPrincipal.colunas?.some((coluna: any) => 
                coluna.questaoCondicional?.id === q.id
              )
            );
            
            if (questaoPrincipal) {
              const respostaQuestaoPrincipal = responses[`${questaoPrincipal.id}_${item.id}`];
              const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
                opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
              ) || questaoPrincipal.colunas?.find((coluna: any) => 
                coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
              );
              
              if (opcaoAtiva) {
                const isOptionSelected = Array.isArray(respostaQuestaoPrincipal) 
                  ? respostaQuestaoPrincipal.includes(String(opcaoAtiva.id)) 
                  : String(respostaQuestaoPrincipal) === String(opcaoAtiva.id);
                
                if (!isOptionSelected) {
                  return false; // Não validar esta questão condicional para este item
                }
                
                respostaKey = `${q.id}_${questaoPrincipal.id}_${item.id}`;
                resposta = responses[respostaKey];
              }
            }
          }
          
          const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
            (Array.isArray(resposta) && resposta.length === 0);
          
          return isEmpty;
        });
      } else {
        // Para estrutura normal, verificar se a questão foi respondida
        const resposta = responses[q.id];
        const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
          (Array.isArray(resposta) && resposta.length === 0);
        
        return !isEmpty;
      }
    });
    
    console.log('✅ Resultado da validação:', {
      todasQuestoes: todasQuestoes.length,
      questoesObrigatorias: todasQuestoes.filter(q => q.obrigatorio).length,
      result,
      questoesObrigatoriasDetalhes: todasQuestoes.filter(q => q.obrigatorio).map(q => ({
        id: q.id,
        texto: q.texto?.substring(0, 50) + "...",
        obrigatorio: q.obrigatorio
      })),
      // Debug adicional
      todasQuestoesIds: todasQuestoes.map(q => q.id),
      questoesOriginais: questoes.map((q: QuestionResponse) => ({ id: q.id, texto: q.texto?.substring(0, 30), obrigatorio: q.obrigatorio })),
      responsesKeys: Object.keys(responses)
    });
    
    // Debug específico para questões obrigatórias não respondidas
    const questoesObrigatoriasNaoRespondidas = todasQuestoes.filter(q => {
      if (!q.obrigatorio) return false;
      
      // Verificar se é uma questão condicional que não deveria estar sendo validada
      const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
        questaoPrincipal.opcoes?.some((opcao: any) => 
          opcao.questaoCondicional?.id === q.id
        ) || questaoPrincipal.colunas?.some((coluna: any) => 
          coluna.questaoCondicional?.id === q.id
        )
      );
      
      if (isQuestaoCondicional) {
        // Para questões condicionais, verificar se a questão está visível primeiro
        if (!shouldShowQuestion(q.id)) {
          return false; // Não incluir questões condicionais não visíveis nas não respondidas
        }
        
        // Para questões condicionais, verificar se a opção que as ativa está selecionada
        const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
          questaoPrincipal.opcoes?.some((opcao: any) => 
            opcao.questaoCondicional?.id === q.id
          ) || questaoPrincipal.colunas?.some((coluna: any) => 
            coluna.questaoCondicional?.id === q.id
          )
        );
        
        if (questaoPrincipal) {
          const respostaQuestao = responses[questaoPrincipal.id];
          const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
            opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
          ) || questaoPrincipal.colunas?.find((coluna: any) => 
            coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
          );
          
          if (opcaoAtiva) {
            const isOptionSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(opcaoAtiva.id)) 
              : String(respostaQuestao) === String(opcaoAtiva.id);
            
            // Só validar se a opção que ativa a condição estiver selecionada
            if (!isOptionSelected) {
              return false; // Não incluir esta questão condicional nas não respondidas
            }
          }
        }
      }
      
      // Verificar se é questão agrupada
      if (isQuestaoAgrupada) {
        // Para estrutura agrupada, verificar se todas as respostas para cada item foram respondidas
        const algumItemNaoRespondido = itensAvaliados.some((item) => {
          let respostaKey: string | number = `${q.id}_${item.id}`;
          let resposta = responses[respostaKey];
          
          if (isQuestaoCondicional) {
            const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
              questaoPrincipal.opcoes?.some((opcao: any) => 
                opcao.questaoCondicional?.id === q.id
              ) || questaoPrincipal.colunas?.some((coluna: any) => 
                coluna.questaoCondicional?.id === q.id
              )
            );
            
            if (questaoPrincipal) {
              const respostaQuestaoPrincipal = responses[`${questaoPrincipal.id}_${item.id}`];
              const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
                opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
              ) || questaoPrincipal.colunas?.find((coluna: any) => 
                coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
              );
              
              if (opcaoAtiva) {
                const isOptionSelected = Array.isArray(respostaQuestaoPrincipal) 
                  ? respostaQuestaoPrincipal.includes(String(opcaoAtiva.id)) 
                  : String(respostaQuestaoPrincipal) === String(opcaoAtiva.id);
                
                if (!isOptionSelected) {
                  return false; // Não validar esta questão condicional para este item
                }
                
                respostaKey = `${q.id}_${questaoPrincipal.id}_${item.id}`;
                resposta = responses[respostaKey];
              }
            }
          }
          
          const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
            (Array.isArray(resposta) && resposta.length === 0);
          
          return isEmpty;
        });
        
        return algumItemNaoRespondido;
      } else {
        // Para estrutura normal, verificar se a questão foi respondida
        const resposta = responses[q.id];
        const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
          (Array.isArray(resposta) && resposta.length === 0);
        
        return isEmpty;
      }
    });
    
    console.log('❌ QUESTÕES OBRIGATÓRIAS NÃO RESPONDIDAS:', questoesObrigatoriasNaoRespondidas.map(q => {
      const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
        questaoPrincipal.opcoes?.some((opcao: any) => 
          opcao.questaoCondicional?.id === q.id
        ) || questaoPrincipal.colunas?.some((coluna: any) => 
          coluna.questaoCondicional?.id === q.id
        )
      );
      
      return {
        id: q.id,
        texto: q.texto?.substring(0, 50) + "...",
        tipo: q.tipo,
        obrigatorio: q.obrigatorio,
        resposta: responses[q.id],
        isCondicional: isQuestaoCondicional,
        respostaTipo: typeof responses[q.id],
        isArray: Array.isArray(responses[q.id]),
        arrayLength: Array.isArray(responses[q.id]) ? responses[q.id].length : null
      };
    }));
    
    console.log('🎯 RESULTADO FINAL DA VALIDAÇÃO:', {
      result,
      todasQuestoes: todasQuestoes.length,
      questoesObrigatorias: todasQuestoes.filter(q => q.obrigatorio).length,
      questoesNaoRespondidas: questoesObrigatoriasNaoRespondidas.length,
      botaoDeveEstarDesabilitado: !result,
      tipoItemAvaliado,
      shouldUseGroupedStructure,
      itensAvaliados: itensAvaliados?.length,
      responsesKeys: Object.keys(responses),
      responsesValues: Object.entries(responses).map(([key, value]) => ({
        key,
        value,
        tipo: typeof value,
        isArray: Array.isArray(value),
        arrayLength: Array.isArray(value) ? value.length : null
      }))
    });
    
    return result;
  };

  const handleSubmit = async () => {
    if (submitting) return; // Evitar múltiplos envios
    
    console.log('🚀 INICIANDO ENVIO DO QUESTIONÁRIO');
    console.log('📊 Estado antes do envio:', {
      questoes: questoes.length,
      responses: Object.keys(responses).length,
      tipoItemAvaliado,
      shouldUseGroupedStructure,
      itensAvaliados: itensAvaliados?.length,
      participanteId,
      questionarioId,
      chave
    });
    
    // Verificar validação antes de enviar
    const todasObrigatoriasRespondidas = areAllRequiredQuestionsAnswered();
    console.log('✅ Validação pré-envio:', {
      todasObrigatoriasRespondidas,
      podeEnviar: todasObrigatoriasRespondidas && !submitting
    });
    
    if (!todasObrigatoriasRespondidas) {
      console.error('❌ BLOQUEADO: Nem todas as questões obrigatórias foram respondidas');
      alert('Por favor, responda todas as questões obrigatórias antes de enviar.');
      return;
    }
    
    setSubmitting(true);
    
    // Coletar todas as questões (principais + condicionais VISÍVEIS) para validação
    const todasQuestoes: QuestionResponse[] = [];
    
    // Adicionar questões principais
    questoes.forEach((q: QuestionResponse) => {
      todasQuestoes.push(q);
      
      // Adicionar questões condicionais das opções APENAS se a opção estiver selecionada
      q.opcoes?.forEach((opcao: any) => {
        if (opcao.questaoCondicional && opcao.ativaCondicao) {
          // Para estrutura agrupada, verificar cada item separadamente
          if (shouldUseGroupedStructure && itensAvaliados) {
            itensAvaliados.forEach((item) => {
              const respostaKey = `${q.id}_${item.id}`;
              const respostaQuestao = responses[respostaKey];
              const isOptionSelected = Array.isArray(respostaQuestao) 
                ? respostaQuestao.includes(String(opcao.id)) 
                : String(respostaQuestao) === String(opcao.id);
              
              console.log(`🔍 Submit - Verificando questão condicional agrupada - Questão ${q.id}, Item ${item.id}, Opção ${opcao.id}:`, {
                respostaKey,
                respostaQuestao,
                isOptionSelected,
                questaoCondicional: opcao.questaoCondicional.id
              });
              
              if (isOptionSelected && !todasQuestoes.some(tq => tq.id === opcao.questaoCondicional.id)) {
                console.log(`✅ Submit - Adicionando questão condicional ${opcao.questaoCondicional.id} à validação (estrutura agrupada)`);
                todasQuestoes.push(opcao.questaoCondicional);
              }
            });
          } else {
            // Para estrutura normal
            const respostaQuestao = responses[q.id];
            const isOptionSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(opcao.id)) 
              : String(respostaQuestao) === String(opcao.id);
              
            console.log(`🔍 Submit - Verificação condicional normal - Questão ${q.id}, Opção ${opcao.id}:`, {
              respostaQuestao,
              isOptionSelected,
              questaoCondicional: opcao.questaoCondicional?.id
            });
              
            if (isOptionSelected) {
              todasQuestoes.push(opcao.questaoCondicional);
              console.log(`✅ Submit - Questão condicional ${opcao.questaoCondicional.id} adicionada à validação`);
            } else {
              console.log(`❌ Submit - Questão condicional ${opcao.questaoCondicional.id} NÃO adicionada (opção não selecionada)`);
            }
          }
        }
      });
      
      // Adicionar questões condicionais das colunas APENAS se a coluna estiver selecionada
      q.colunas?.forEach((coluna: any) => {
        if (coluna.questaoCondicional && coluna.ativaCondicao) {
          // Para estrutura agrupada, verificar cada item separadamente
          if (shouldUseGroupedStructure && itensAvaliados) {
            itensAvaliados.forEach((item) => {
              const respostaKey = `${q.id}_${item.id}`;
              const respostaQuestao = responses[respostaKey];
              const isColumnSelected = Array.isArray(respostaQuestao) 
                ? respostaQuestao.includes(String(coluna.id)) 
                : String(respostaQuestao) === String(coluna.id);
              
              console.log(`🔍 Submit - Verificando questão condicional coluna agrupada - Questão ${q.id}, Item ${item.id}, Coluna ${coluna.id}:`, {
                respostaKey,
                respostaQuestao,
                isColumnSelected,
                questaoCondicional: coluna.questaoCondicional.id
              });
              
              if (isColumnSelected && !todasQuestoes.some(tq => tq.id === coluna.questaoCondicional.id)) {
                console.log(`✅ Submit - Adicionando questão condicional coluna ${coluna.questaoCondicional.id} à validação (estrutura agrupada)`);
                todasQuestoes.push(coluna.questaoCondicional);
              }
            });
          } else {
            // Para estrutura normal
            const respostaQuestao = responses[q.id];
            const isColumnSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(coluna.id)) 
              : String(respostaQuestao) === String(coluna.id);
              
            console.log(`🔍 Submit - Verificação condicional coluna normal - Questão ${q.id}, Coluna ${coluna.id}:`, {
              respostaQuestao,
              isColumnSelected,
              questaoCondicional: coluna.questaoCondicional?.id
            });
              
            if (isColumnSelected) {
              todasQuestoes.push(coluna.questaoCondicional);
              console.log(`✅ Submit - Questão condicional coluna ${coluna.questaoCondicional.id} adicionada à validação`);
            } else {
              console.log(`❌ Submit - Questão condicional coluna ${coluna.questaoCondicional.id} NÃO adicionada (coluna não selecionada)`);
            }
          }
        }
      });
    });

    // Validação manual de obrigatórios (principais + condicionais VISÍVEIS)
    const obrigatoriasNaoRespondidas = todasQuestoes.filter((q: QuestionResponse) => {
      if (!q.obrigatorio) return false;
      
      // Verificar se é uma questão condicional que não deveria estar sendo validada
      const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
        questaoPrincipal.opcoes?.some((opcao: any) => 
          opcao.questaoCondicional?.id === q.id
        ) || questaoPrincipal.colunas?.some((coluna: any) => 
          coluna.questaoCondicional?.id === q.id
        )
      );
      
      if (isQuestaoCondicional) {
        // Para questões condicionais, verificar se a questão está visível primeiro
        if (!shouldShowQuestion(q.id)) {
          console.log(`❌ Questão condicional ${q.id} NÃO está visível - não deve ser validada`);
          return false; // Não validar questões condicionais não visíveis
        }
        
        // Para questões condicionais, verificar se a opção que as ativa está selecionada
        const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
          questaoPrincipal.opcoes?.some((opcao: any) => 
            opcao.questaoCondicional?.id === q.id
          ) || questaoPrincipal.colunas?.some((coluna: any) => 
            coluna.questaoCondicional?.id === q.id
          )
        );
        
        if (questaoPrincipal) {
          const respostaQuestao = responses[questaoPrincipal.id];
          
          // Verificar se alguma opção que ativa esta questão condicional está selecionada
          const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
            opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
          ) || questaoPrincipal.colunas?.find((coluna: any) => 
            coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
          );
          
          if (opcaoAtiva) {
            const isOptionSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(opcaoAtiva.id)) 
              : String(respostaQuestao) === String(opcaoAtiva.id);
            
            console.log(`🔍 Validação condicional - Questão ${q.id}:`, {
              questaoPrincipal: questaoPrincipal.id,
              questaoPrincipalTexto: questaoPrincipal.texto?.substring(0, 50) + "...",
              opcaoAtiva: opcaoAtiva.id,
              opcaoAtivaTexto: opcaoAtiva.texto,
              respostaQuestao,
              isOptionSelected,
              deveValidar: isOptionSelected,
              questaoCondicionalTexto: q.texto?.substring(0, 50) + "...",
              questaoCondicionalTipo: q.tipo,
              isVisible: shouldShowQuestion(q.id)
            });
            
            // Só validar se a opção que ativa a condição estiver selecionada
            if (!isOptionSelected) {
              console.log(`❌ Questão condicional ${q.id} NÃO deve ser validada (opção não selecionada)`);
              return false; // Não validar esta questão condicional
            }
          }
        }
      }
      
      // Verificar se esta questão específica está na estrutura agrupada
      const isQuestaoAgrupada = tipoItemAvaliado !== "Estrutura" && tipoItemAvaliado !== "Pesquisa" && tipoItemAvaliado !== "Infraestrutura" && shouldUseGroupedStructure && itensAvaliados;
      
      if (isQuestaoAgrupada) {
        // Para estrutura agrupada, verificar se todas as respostas para cada item foram respondidas
        const naoRespondida = itensAvaliados.some((item) => {
          // Verificar se é questão condicional e buscar a chave correta
          const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
            questaoPrincipal.opcoes?.some((opcao: any) => 
              opcao.questaoCondicional?.id === q.id
            ) || questaoPrincipal.colunas?.some((coluna: any) => 
              coluna.questaoCondicional?.id === q.id
            )
          );
          
          let respostaKey: string | number = `${q.id}_${item.id}`;
          let resposta = responses[respostaKey];
          
          if (isQuestaoCondicional) {
            // Buscar a questão principal que ativa esta condição
            const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
              questaoPrincipal.opcoes?.some((opcao: any) => 
                opcao.questaoCondicional?.id === q.id
              ) || questaoPrincipal.colunas?.some((coluna: any) => 
                coluna.questaoCondicional?.id === q.id
              )
            );
            
            if (questaoPrincipal) {
              // Verificar se a opção que ativa esta condição está selecionada para este item
              const respostaQuestaoPrincipal = responses[`${questaoPrincipal.id}_${item.id}`];
              const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
                opcao.questaoCondicional?.id === q.id && opcao.ativaCondicao
              ) || questaoPrincipal.colunas?.find((coluna: any) => 
                coluna.questaoCondicional?.id === q.id && coluna.ativaCondicao
              );
              
              if (opcaoAtiva) {
                const isOptionSelected = Array.isArray(respostaQuestaoPrincipal) 
                  ? respostaQuestaoPrincipal.includes(String(opcaoAtiva.id)) 
                  : String(respostaQuestaoPrincipal) === String(opcaoAtiva.id);
                
                // Se a opção não está selecionada, não validar esta questão condicional
                if (!isOptionSelected) {
                  console.log(`🔍 Questão condicional ${q.id} NÃO deve ser validada para item ${item.id} (opção não selecionada)`);
                  return false; // Não validar esta questão condicional para este item
                }
                
                // Usar chave única para questão condicional (mesma ordem da renderização)
                respostaKey = `${q.id}_${questaoPrincipal.id}_${item.id}`;
                resposta = responses[respostaKey];
              }
            }
          }
          
          const isEmpty = resposta === undefined || resposta === "" || resposta === null ||
            (Array.isArray(resposta) && resposta.length === 0);
          
          console.log(`🔍 Validação agrupada - Questão ${q.id}, Item ${item.id}:`, {
            respostaKey,
            resposta,
            isEmpty,
            obrigatorio: q.obrigatorio,
            itemNome: item.nomeItemEspecifico,
            isQuestaoCondicional
          });
          
          return isEmpty;
        });
        
        return naoRespondida;
      } else {
        // Para estrutura normal, verificar a resposta direta
        // Se for questão condicional, usar chave única com questão principal
        let respostaKey: string | number = q.id;
        let resposta = responses[q.id];
        
        // Verificar se é questão condicional e buscar a chave correta
        const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
          questaoPrincipal.opcoes?.some((opcao: any) => 
            opcao.questaoCondicional?.id === q.id
          ) || questaoPrincipal.colunas?.some((coluna: any) => 
            coluna.questaoCondicional?.id === q.id
          )
        );
        
        if (isQuestaoCondicional) {
          // Buscar a questão principal que ativa esta condição
          const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
            questaoPrincipal.opcoes?.some((opcao: any) => 
              opcao.questaoCondicional?.id === q.id
            ) || questaoPrincipal.colunas?.some((coluna: any) => 
              coluna.questaoCondicional?.id === q.id
            )
          );
          
          if (questaoPrincipal) {
            respostaKey = `${q.id}_${questaoPrincipal.id}`;
            resposta = responses[respostaKey];
          }
        }
        
        const isEmpty = resposta === undefined || 
          resposta === "" || 
          resposta === null || 
          (Array.isArray(resposta) && resposta.length === 0) ||
          (typeof resposta === 'string' && resposta.trim() === ""); // Adicionar verificação para string vazia
          
        console.log(`🔍 Validação normal - Questão ${q.id}:`, {
          respostaKey,
          resposta,
          tipoResposta: typeof resposta,
          isArray: Array.isArray(resposta),
          arrayLength: Array.isArray(resposta) ? resposta.length : 'N/A',
          isEmpty,
          obrigatorio: q.obrigatorio,
          questaoTipo: q.tipo,
          questaoTexto: q.texto?.substring(0, 50) + "...",
          isQuestaoCondicional,
          // Debug específico para questão 44
          ...(q.id === 44 && {
            debugQuestao44: {
              respostaExata: resposta,
              isUndefined: resposta === undefined,
              isEmptyString: resposta === "",
              isNull: resposta === null,
              isArrayEmpty: Array.isArray(resposta) && resposta.length === 0,
              isStringEmpty: typeof resposta === 'string' && resposta.trim() === "",
              calculoFinal: `${resposta === undefined} || ${resposta === ""} || ${resposta === null} || ${Array.isArray(resposta) && resposta.length === 0} || ${typeof resposta === 'string' && resposta.trim() === ""} = ${isEmpty}`
            }
          })
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
      console.log('❌ QUESTÕES OBRIGATÓRIAS NÃO RESPONDIDAS:', obrigatoriasNaoRespondidas.map((q: QuestionResponse) => ({
        id: q.id,
        texto: q.texto?.substring(0, 100) + "...",
        tipo: q.tipo,
        obrigatorio: q.obrigatorio,
        resposta: responses[q.id],
        isCondicional: questoes.some((questaoPrincipal: QuestionResponse) => 
          questaoPrincipal.opcoes?.some((opcao: any) => 
            opcao.questaoCondicional?.id === q.id
          ) || questaoPrincipal.colunas?.some((coluna: any) => 
            coluna.questaoCondicional?.id === q.id
          )
        )
      })));
      
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
            // Verificar se é questão condicional e buscar a chave correta
            const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
              questaoPrincipal.opcoes?.some((opcao: any) => 
                opcao.questaoCondicional?.id === questao.id
              ) || questaoPrincipal.colunas?.some((coluna: any) => 
                coluna.questaoCondicional?.id === questao.id
              )
            );
            
            let respostaKey = `${questao.id}_${item.id}`;
            let resposta = responses[respostaKey];
            
            if (isQuestaoCondicional) {
              // Buscar a questão principal que ativa esta condição
              const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
                questaoPrincipal.opcoes?.some((opcao: any) => 
                  opcao.questaoCondicional?.id === questao.id
                ) || questaoPrincipal.colunas?.some((coluna: any) => 
                  coluna.questaoCondicional?.id === questao.id
                )
              );
              
              if (questaoPrincipal) {
                // Verificar se a opção que ativa esta condição está selecionada para este item
                const respostaQuestaoPrincipal = responses[`${questaoPrincipal.id}_${item.id}`];
                const opcaoAtiva = questaoPrincipal.opcoes?.find((opcao: any) => 
                  opcao.questaoCondicional?.id === questao.id && opcao.ativaCondicao
                ) || questaoPrincipal.colunas?.find((coluna: any) => 
                  coluna.questaoCondicional?.id === questao.id && coluna.ativaCondicao
                );
                
                if (opcaoAtiva) {
                  const isOptionSelected = Array.isArray(respostaQuestaoPrincipal) 
                    ? respostaQuestaoPrincipal.includes(String(opcaoAtiva.id)) 
                    : String(respostaQuestaoPrincipal) === String(opcaoAtiva.id);
                  
                  // Se a opção não está selecionada, pular esta questão condicional
                  if (!isOptionSelected) {
                    console.log(`⏭️ Pulando questão condicional ${questao.id} para item ${item.id} (opção não selecionada)`);
                    return; // Pular para o próximo item
                  }
                  
                  // Usar chave única para questão condicional (mesma ordem da renderização)
                  respostaKey = `${questao.id}_${questaoPrincipal.id}_${item.id}`;
                  resposta = responses[respostaKey];
                  
                  console.log(`✅ Processando questão condicional ${questao.id} para item ${item.id}:`, {
                    respostaKey,
                    resposta,
                    questaoPrincipal: questaoPrincipal.id,
                    opcaoAtiva: opcaoAtiva.id
                  });
                }
              }
            }
            
            if (resposta !== undefined && resposta !== null && resposta !== "") {
              if (questao.tipo === "MultiplaEscolha" || questao.tipo === "MenuSuspenso") {
                respostas.push({ 
                  questaoId: questao.id, 
                  opcaoId: Number(resposta), // Garantir que seja number
                  itemAvaliadoId: item.id
                });
              } else if (questao.tipo === "CaixaSelecao") {
                // Para checkbox, resposta é um array de IDs das opções selecionadas
                if (Array.isArray(resposta) && resposta.length > 0) {
                  resposta.forEach(opcaoId => {
                    respostas.push({ 
                      questaoId: questao.id, 
                      opcaoId: Number(opcaoId), // Garantir que seja number
                      itemAvaliadoId: item.id
                    });
                  });
                }
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
          // Verificar se é questão condicional e buscar a chave correta
          const isQuestaoCondicional = questoes.some((questaoPrincipal: QuestionResponse) => 
            questaoPrincipal.opcoes?.some((opcao: any) => 
              opcao.questaoCondicional?.id === questao.id
            ) || questaoPrincipal.colunas?.some((coluna: any) => 
              coluna.questaoCondicional?.id === questao.id
            )
          );
          
          let resposta = responses[questao.id];
          
          if (isQuestaoCondicional) {
            // Buscar a questão principal que ativa esta condição
            const questaoPrincipal = questoes.find((questaoPrincipal: QuestionResponse) => 
              questaoPrincipal.opcoes?.some((opcao: any) => 
                opcao.questaoCondicional?.id === questao.id
              ) || questaoPrincipal.colunas?.some((coluna: any) => 
                coluna.questaoCondicional?.id === questao.id
              )
            );
            
            if (questaoPrincipal) {
              const respostaKey = `${questao.id}_${questaoPrincipal.id}`;
              resposta = responses[respostaKey];
            }
          }
          
          if (questao.tipo === "MultiplaEscolha" || questao.tipo === "MenuSuspenso") {
            return resposta ? [{ questaoId: questao.id, opcaoId: Number(resposta), itemAvaliadoId: 0 }] : [];
          }
          if (questao.tipo === "CaixaSelecao") {
            // Para checkbox, resposta é um array de IDs das opções selecionadas
            if (Array.isArray(resposta) && resposta.length > 0) {
              return resposta.map(opcaoId => ({ questaoId: questao.id, opcaoId: Number(opcaoId), itemAvaliadoId: 0 }));
            }
            return [];
          }
          if (questao.tipo === "EscalaLinear") {
            const opcao = questao.opcoes?.find((o: OptionItem) => String(o.valor) === String(resposta));
            if (resposta !== undefined && resposta !== null && resposta !== "") {
              return [{
                questaoId: questao.id,
                opcaoId: opcao?.id,
                valor: String(resposta),
                itemAvaliadoId: 0
              }];
            }
            return [];
          }
          if (questao.tipo === "Matriz") {
            if (Array.isArray(resposta)) {
              return resposta.map((colunaId, idx) => {
                const opcao = questao.opcoes?.[idx];
                return colunaId && opcao ? { questaoId: questao.id, opcaoId: opcao.id, colunaId, itemAvaliadoId: 0 } : null;
              }).filter(Boolean);
            }
            return [];
          }
          // CaixaTexto ou default
          return resposta ? [{ questaoId: questao.id, valor: resposta, itemAvaliadoId: 0 }] : [];
        });
      }

      console.log("Respostas montadas:", respostas);

      await api.post(`/Questionario/responder/${chave}`, {
        questionarioId,
        participanteId,
        respostas
      });

      alert("Respostas enviadas com sucesso!");
      
      // Limpar respostas salvas após envio bem-sucedido
      clearResponses();
      
      // Redirecionar para o dashboard correto baseado no perfil do usuário
      setTimeout(() => {
        if (window.opener) {
          window.close();
        } else {
          // Verificar se o usuário está logado e tem perfil
          const token = Cookies.get('token') || localStorage.getItem('token');
          console.log('🔍 Token encontrado:', !!token);
          
          if (token) {
            try {
              // Decodificar o token para obter o perfil (JWT simples)
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.log('🔍 Payload do token:', payload);
              
              // O perfil está no claim "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
              const perfil = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.toLowerCase();
              console.log('🔍 Perfil extraído:', perfil);
              
              // Redirecionar baseado no perfil
              if (perfil === 'aluno' || perfil === 'participante') {
                console.log('🎯 Redirecionando para /participante/dashboard');
                console.log('🔍 URL atual antes do redirect:', window.location.href);
                window.location.href = "/participante/dashboard";
                console.log('🔍 URL após definir redirect:', window.location.href);
              } else if (perfil === 'professor' || perfil === 'coordenacao') {
                console.log('🎯 Redirecionando para /professor/dashboard');
                console.log('🔍 URL atual antes do redirect:', window.location.href);
                window.location.href = "/professor/dashboard";
                console.log('🔍 URL após definir redirect:', window.location.href);
              } else {
                console.log('🎯 Perfil não reconhecido, redirecionando para /home');
                console.log('🔍 URL atual antes do redirect:', window.location.href);
                window.location.href = "/home";
                console.log('🔍 URL após definir redirect:', window.location.href);
              }
            } catch (error) {
              console.error('❌ Erro ao decodificar token:', error);
              console.log('🎯 Erro na decodificação, redirecionando para /home');
              window.location.href = "/home";
            }
          } else {
            // Se não tem token, vai para a página inicial
            console.log('❌ Token não encontrado, redirecionando para /home');
            window.location.href = "/home";
          }
        }
      }, 100);
    } catch (error: any) {
      console.error('Erro ao enviar respostas:', error);
      
      // Verificar se é uma mensagem específica do backend
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.response?.status === 200) {
        // Se o status é 200, mas houve erro no parsing, pode ser sucesso
        alert("Respostas enviadas com sucesso!");
        clearResponses();
        window.location.href = "/home";
      } else {
        alert("Erro ao enviar respostas. Por favor, tente novamente.");
      }
    } finally {
      setSubmitting(false);
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

  // Usar apenas as questões principais (não condicionais) para renderização
  const visibleQuestions = questoes;
  
  console.log('🔍 Debug - Questões principais para renderização:', {
    total: visibleQuestions.length,
    questoes: visibleQuestions.map((q: QuestionResponse) => ({ id: q.id, texto: q.texto, isCondicional: q.isCondicional }))
  });

  // Função para renderizar questão agrupada por itens
  const renderGroupedQuestion = (questao: QuestionResponse) => {
    if (!itensAvaliados || itensAvaliados.length === 0) {
      // Se não há itens avaliados, usar renderização normal
      return renderNormalQuestion(questao);
    }

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
                onChange={(value) => {
                  handleResponseChange(`${questao.id}_${item.id}`, value);
                }}
                requiredAsterisk={!!questao.obrigatorio}
                itemAvaliadoId={item.id}
              />
            </Box>

            {/* Questões Condicionais - lógica simples */}
            {questao.opcoes?.map((opcao: OptionItemWithConditional) => {
              if (opcao.ativaCondicao && opcao.questaoCondicional) {
                // Verificar se a opção está selecionada para este item
                const respostaQuestao = responses[`${questao.id}_${item.id}`];
                const isOptionSelected = Array.isArray(respostaQuestao) 
                  ? respostaQuestao.includes(String(opcao.id)) 
                  : String(respostaQuestao) === String(opcao.id);

                console.log(`🔍 Questão Condicional Agrupada - Questão ${questao.id}, Item ${item.id}:`, {
                  opcaoId: opcao.id,
                  opcaoTexto: opcao.texto,
                  respostaQuestao,
                  isOptionSelected,
                  questaoCondicionalId: opcao.questaoCondicional.id,
                  questaoCondicionalTexto: opcao.questaoCondicional.texto?.substring(0, 50) + "..."
                });

                if (isOptionSelected) {
                  // Usar a questão condicional diretamente do objeto opcao
                  const questaoCondicional = opcao.questaoCondicional;
                  
                  return (
                    <Box key={`${questaoCondicional.id}_${questao.id}_${item.id}`} p={4} bg="purple.50" borderTop="1px solid" borderColor="gray.200">
                      <QuestionTypeExecution
                        type={questaoCondicional.tipo}
                        question={{ ...questaoCondicional, obrigatorio: questaoCondicional.obrigatorio }}
                        value={responses[`${questaoCondicional.id}_${questao.id}_${item.id}`]}
                        onChange={(value) => handleResponseChange(`${questaoCondicional.id}_${questao.id}_${item.id}`, value)}
                        requiredAsterisk={!!questaoCondicional.obrigatorio}
                        isVisible={true}
                        itemAvaliadoId={item.id}
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
          onChange={(value) => {
            console.log('🎯 QuestionTypeExecution onChange:', { 
              questionId: questao.id, 
              value, 
              currentValue: responses[questao.id],
              allResponses: responses 
            });
            handleResponseChange(questao.id, value);
            // Trigger conditional logic for this specific question
            handleAnswer(questao.id, value);
          }}
          requiredAsterisk={!!questao.obrigatorio}
          itemAvaliadoId={0}
        />
        
        {/* Questões Condicionais - lógica para renderização normal */}
        {questao.opcoes?.map((opcao: OptionItemWithConditional) => {
          if (opcao.ativaCondicao && opcao.questaoCondicional) {
            // Verificar se a opção está selecionada
            const respostaQuestao = responses[questao.id];
            const isOptionSelected = Array.isArray(respostaQuestao) 
              ? respostaQuestao.includes(String(opcao.id)) 
              : String(respostaQuestao) === String(opcao.id);

            if (isOptionSelected) {
              // Usar a questão condicional diretamente do objeto opcao
              const questaoCondicional = opcao.questaoCondicional;
              
              return (
                <Box key={`${questaoCondicional.id}`} mt={4} p={4} bg="purple.50" borderRadius="md" border="1px solid" borderColor="purple.200">
                  <QuestionTypeExecution
                    type={questaoCondicional.tipo}
                    question={{ ...questaoCondicional, obrigatorio: questaoCondicional.obrigatorio }}
                    value={responses[`${questaoCondicional.id}_${questao.id}`]}
                    onChange={(value) => handleResponseChange(`${questaoCondicional.id}_${questao.id}`, value)}
                    requiredAsterisk={!!questaoCondicional.obrigatorio}
                    isVisible={true}
                    itemAvaliadoId={0}
                  />
                </Box>
              );
            }
          }
          return null;
        })}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box p={4}>
        <Text>Carregando questionário...</Text>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={4}>
        <Text>Erro ao carregar questionário.</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* TEMPORÁRIO: Desabilitar notificações de auto-save */}

      <Stack gap={8}>
        {visibleQuestions.map((questao: QuestionResponse) => {
          console.log(`🔍 Renderizando questão ${questao.id} (${questao.texto})`);
          
          // Para Estrutura, Pesquisa e Infraestrutura, sempre usar renderização normal
          if (tipoItemAvaliado === "Estrutura" || tipoItemAvaliado === "Pesquisa" || tipoItemAvaliado === "Infraestrutura") {
            return renderNormalQuestion(questao);
          }
          
          // Para todos os outros tipos, usar estrutura agrupada quando há itens avaliados
          if (shouldUseGroupedStructure) {
            return renderGroupedQuestion(questao);
          } else {
            return renderNormalQuestion(questao);
          }
        })}
        
        {/* Botões de Ação */}
        <Box textAlign="center" mt={6}>
          {/* Indicador de progresso das questões obrigatórias */}
          {!areAllRequiredQuestionsAnswered() && (
            <Box mb={4} p={3} bg="yellow.50" borderRadius="md" border="1px solid" borderColor="yellow.200">
              <Text fontSize="sm" color="yellow.800" textAlign="center">
                ⚠️ Responda todas as questões obrigatórias para enviar o questionário
              </Text>
            </Box>
          )}
          
          <HStack spacing={4} justify="center">
            {/* Botão de salvar manual */}
            {/* TEMPORÁRIO: Desabilitar botão de salvar manual */}
            
            {/* Botão de enviar */}
            <Button
              bg="blue.500"
              color="white"
              size="lg"
              onClick={handleSubmit}
              disabled={!areAllRequiredQuestionsAnswered() || submitting}
              isLoading={submitting}
              loadingText="Enviando..."
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
              {submitting ? "Enviando..." : "Enviar Respostas"}
            </Button>
          </HStack>
        </Box>
      </Stack>
    </Box>
  );
}
