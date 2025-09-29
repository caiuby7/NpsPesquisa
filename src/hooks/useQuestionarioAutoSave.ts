import { useState, useEffect, useCallback } from 'react';
import { useAutoSave } from './useAutoSave';

interface QuestionarioAutoSaveOptions {
  questionarioId: string | number;
  participanteId: number;
  chave: string;
  tipoItemAvaliado?: string;
  itensAvaliados?: any[];
}

interface SavedResponseData {
  responses: Record<string | number, any>;
  questionarioId: string | number;
  participanteId: number;
  chave: string;
  tipoItemAvaliado?: string;
  itensAvaliados?: any[];
  timestamp: number;
  version: string;
}

export function useQuestionarioAutoSave(options: QuestionarioAutoSaveOptions) {
  const { questionarioId, participanteId, chave, tipoItemAvaliado, itensAvaliados } = options;
  
  const [responses, setResponses] = useState<Record<string | number, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Chave única para este questionário e participante
  const storageKey = `questionario_responses_${questionarioId}_${participanteId}_${chave}`;

  // Dados para auto-save
  const autoSaveData = {
    responses,
    questionarioId,
    participanteId,
    chave,
    tipoItemAvaliado,
    itensAvaliados
  };

  // Hook de auto-save
  const { loadData, clearData, saveData } = useAutoSave(autoSaveData, {
    delay: 30000, // 30 segundos de delay - não bloqueia interação
    storageKey,
    onSave: (data) => {
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      console.log('✅ Respostas salvas automaticamente');
    },
    onLoad: (data) => {
      console.log('📂 Respostas recuperadas do auto-save');
    }
  });

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = loadData() as SavedResponseData | null;
        
        if (savedData && savedData.responses) {
          console.log('🔄 Recuperando respostas salvas:', {
            questionarioId: savedData.questionarioId,
            participanteId: savedData.participanteId,
            chave: savedData.chave,
            responsesCount: Object.keys(savedData.responses).length,
            timestamp: new Date(savedData.timestamp).toLocaleString()
          });
          
          setResponses(savedData.responses);
          setHasUnsavedChanges(false);
          setLastSaved(new Date(savedData.timestamp));
        }
      } catch (error) {
        console.error('❌ Erro ao carregar respostas salvas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, [loadData]);

  // Função para atualizar resposta
  const updateResponse = useCallback((questionId: string | number, value: any) => {
    console.log('🔄 updateResponse chamado:', { questionId, value, currentResponses: responses });
    
    setResponses(prev => {
      console.log('📊 Estado anterior:', { prev, questionId, currentValue: prev[questionId] });
      
      const newResponses = {
        ...prev,
        [questionId]: value
      };
      
      console.log('📝 Nova resposta:', { 
        questionId, 
        value, 
        prevCount: Object.keys(prev).length,
        newCount: Object.keys(newResponses).length,
        newResponses,
        prevValue: prev[questionId],
        newValue: newResponses[questionId]
      });
      
      // Verificar se há mudanças não salvas (comparação mais simples)
      const hasChanges = newResponses[questionId] !== prev[questionId];
      setHasUnsavedChanges(hasChanges);
      
      console.log('🔍 Verificação de mudanças:', {
        questionId,
        oldValue: prev[questionId],
        newValue: newResponses[questionId],
        hasChanges,
        isEqual: newResponses[questionId] === prev[questionId]
      });
      
      return newResponses;
    });
  }, []);

  // Função para limpar respostas (após envio bem-sucedido)
  const clearResponses = useCallback(() => {
    setResponses({});
    setHasUnsavedChanges(false);
    setLastSaved(null);
    clearData();
    console.log('🗑️ Respostas limpas após envio');
  }, [clearData]);

  // Função para salvar manualmente
  const saveManually = useCallback(() => {
    saveData();
    console.log('💾 Salvamento manual executado');
  }, [saveData]);

  // Função para verificar se há respostas salvas
  const hasSavedResponses = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      return !!savedData;
    } catch {
      return false;
    }
  }, [storageKey]);

  // Função para mostrar notificação de recuperação
  const showRecoveryNotification = useCallback(() => {
    if (hasSavedResponses() && Object.keys(responses).length > 0) {
      return {
        title: 'Respostas Recuperadas',
        message: 'Suas respostas anteriores foram recuperadas automaticamente.',
        type: 'info' as const
      };
    }
    return null;
  }, [hasSavedResponses, responses]);

  return {
    responses,
    updateResponse,
    clearResponses,
    saveManually,
    isLoading,
    hasUnsavedChanges,
    lastSaved,
    hasSavedResponses: hasSavedResponses(),
    showRecoveryNotification: showRecoveryNotification()
  };
}
