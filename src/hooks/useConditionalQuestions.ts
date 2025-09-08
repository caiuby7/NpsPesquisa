import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { QuestionResponse, OptionItem } from '../app/services/form/form.services.types';

export interface ConditionalQuestionState {
  visibleQuestions: Set<number>;
  answeredQuestions: Map<number, any>;
}

export const useConditionalQuestions = (questions: QuestionResponse[] = []) => {
  // Extrair todas as questões condicionais das opções e criar uma lista completa
  const allQuestions = useMemo(() => {
    const extractedQuestions: QuestionResponse[] = [...questions];
    
    questions.forEach(q => {
      if (q.opcoes) {
        q.opcoes.forEach(opcao => {
          if (opcao.ativaCondicao && opcao.questaoCondicionalId) {
            // Buscar a questão condicional na lista de questões principais primeiro
            let questaoCondicional = questions.find(existing => existing.id === opcao.questaoCondicionalId);
            
            // Se não encontrou nas questões principais, verificar se está aninhada na opção
            if (!questaoCondicional && (opcao as any).questaoCondicional) {
              questaoCondicional = (opcao as any).questaoCondicional;
            }
            
            if (questaoCondicional && !extractedQuestions.find(existing => existing.id === questaoCondicional.id)) {
              extractedQuestions.push(questaoCondicional);
            }
          }
        });
      }
      if (q.colunas) {
        q.colunas.forEach(coluna => {
          if (coluna.ativaCondicao && coluna.questaoCondicionalId) {
            // Buscar a questão condicional na lista de questões principais primeiro
            let questaoCondicional = questions.find(existing => existing.id === coluna.questaoCondicionalId);
            
            // Se não encontrou nas questões principais, verificar se está aninhada na coluna
            if (!questaoCondicional && (coluna as any).questaoCondicional) {
              questaoCondicional = (coluna as any).questaoCondicional;
            }
            
            if (questaoCondicional && !extractedQuestions.find(existing => existing.id === questaoCondicional.id)) {
              extractedQuestions.push(questaoCondicional);
            }
          }
        });
      }
    });
    
    return extractedQuestions;
  }, [questions]);

  // Inicializar com todas as questões principais visíveis
  // isCondicional indica que a questão TEM opções que ativam questões condicionais
  const initialVisibleQuestions = new Set(
    questions?.filter(q => q && q.id).map(q => q.id) || []
  );
  
  const [state, setState] = useState<ConditionalQuestionState>(() => ({
    visibleQuestions: initialVisibleQuestions,
    answeredQuestions: new Map()
  }));

  // Atualizar questões visíveis quando a lista de questões mudar
  useEffect(() => {
    const newVisibleQuestions = new Set(
      questions?.filter(q => q && q.id).map(q => q.id) || []
    );
    
    setState(prevState => ({
      ...prevState,
      visibleQuestions: newVisibleQuestions
    }));
  }, [questions]);

  // Debug: Log inicial do hook
  console.log('🔍 useConditionalQuestions - Inicializando:', {
    questionsCount: questions.length,
    questions: questions.map((q: QuestionResponse) => ({ id: q.id, texto: q.texto, isCondicional: q.isCondicional })),
    allQuestionsCount: allQuestions.length,
    allQuestions: allQuestions.map((q: QuestionResponse) => ({ id: q.id, texto: q.texto, isCondicional: q.isCondicional })),
    initialVisibleQuestions: Array.from(initialVisibleQuestions),
    visibleQuestions: Array.from(state.visibleQuestions)
  });

  // Função para verificar se uma questão deve ser exibida
  const shouldShowQuestion = useCallback((questionId: number): boolean => {
    const shouldShow = state.visibleQuestions.has(questionId);
    console.log(`🔍 shouldShowQuestion(${questionId}): ${shouldShow}`, {
      visibleQuestions: Array.from(state.visibleQuestions),
      questionId
    });
    return shouldShow;
  }, [state.visibleQuestions]);

  // Função para processar resposta e atualizar questões visíveis
  const handleAnswer = useCallback((questionId: number, answer: any) => {
    if (!questions || !Array.isArray(questions)) return;
    
    setState(prevState => {
      const newAnsweredQuestions = new Map(prevState.answeredQuestions);
      newAnsweredQuestions.set(questionId, answer);

      // Encontrar a questão que foi respondida
      const answeredQuestion = questions.find(q => q && q.id === questionId);
      if (!answeredQuestion) return prevState;

      const newVisibleQuestions = new Set(prevState.visibleQuestions);

      // SEMPRE manter a questão principal visível
      newVisibleQuestions.add(questionId);

      // Se a questão tem isCondicional = true, ela é uma questão principal que pode ativar outras
      if (answeredQuestion.isCondicional && answeredQuestion.opcoes) {
        // Primeiro, remover TODAS as questões condicionais desta questão principal
        // Buscar questões condicionais que podem ser ativadas por esta questão principal
        const questoesCondicionaisDestaPrincipal: number[] = [];
        answeredQuestion.opcoes.forEach(opcao => {
          if (opcao.ativaCondicao && opcao.questaoCondicionalId) {
            questoesCondicionaisDestaPrincipal.push(opcao.questaoCondicionalId);
          }
        });
        
        questoesCondicionaisDestaPrincipal.forEach(condId => {
          newVisibleQuestions.delete(condId);
          console.log('🗑️ Removendo questão condicional (reset):', condId);
        });

        // Depois, verificar se alguma opção ativa condição e adicionar apenas as necessárias
        answeredQuestion.opcoes.forEach(opcao => {
          if (opcao.ativaCondicao && opcao.questaoCondicionalId) {
            // Verificar se a resposta inclui esta opção
            const isOptionSelected = Array.isArray(answer) 
              ? answer.includes(String(opcao.id)) 
              : String(answer) === String(opcao.id);

            console.log('🔍 Debug Condicional:', {
              questionId,
              answer,
              opcaoId: opcao.id,
              opcaoTexto: opcao.texto,
              ativaCondicao: opcao.ativaCondicao,
              questaoCondicionalId: opcao.questaoCondicionalId,
              isOptionSelected
            });

            if (isOptionSelected) {
              // Mostrar questão condicional
              newVisibleQuestions.add(opcao.questaoCondicionalId);
              console.log('✅ Adicionando questão condicional:', opcao.questaoCondicionalId);
            }
          }
        });
      }

      return {
        visibleQuestions: newVisibleQuestions,
        answeredQuestions: newAnsweredQuestions
      };
    });
  }, [questions]);

  // Função para obter questões visíveis ordenadas
  const getVisibleQuestions = useCallback((): QuestionResponse[] => {
    if (!allQuestions || !Array.isArray(allQuestions)) return [];
    
    const visibleQuestions = allQuestions.filter(q => q && q.id && shouldShowQuestion(q.id));
    
    console.log('🔍 Debug - getVisibleQuestions:', {
      totalQuestions: allQuestions.length,
      visibleQuestions: visibleQuestions.map(q => ({ id: q.id, texto: q.texto, isCondicional: q.isCondicional })),
      visibleQuestionsSet: Array.from(state.visibleQuestions)
    });
    
    // Ordenar questões para que as condicionais apareçam logo após a principal
    return visibleQuestions.sort((a, b) => {
      // Se uma questão é condicional de outra, colocar logo após
      const aIsConditional = questions.some(q => 
        q && q.opcoes?.some(opcao => 
          opcao.ativaCondicao && opcao.questaoCondicionalId === a.id
        )
      );
      const bIsConditional = questions.some(q => 
        q && q.opcoes?.some(opcao => 
          opcao.ativaCondicao && opcao.questaoCondicionalId === b.id
        )
      );
      
      if (aIsConditional && !bIsConditional) return 1;
      if (!aIsConditional && bIsConditional) return -1;
      
      return a.id - b.id;
    });
  }, [allQuestions, questions, shouldShowQuestion, state.visibleQuestions]);

  // Função para resetar estado
  const reset = useCallback(() => {
    setState({
      visibleQuestions: new Set(questions?.filter(q => q && q.id).map(q => q.id) || []),
      answeredQuestions: new Map()
    });
  }, [questions]);

  return {
    shouldShowQuestion,
    handleAnswer,
    getVisibleQuestions,
    reset,
    answeredQuestions: state.answeredQuestions,
    visibleQuestions: state.visibleQuestions
  };
};
