import { useEffect, useCallback, useRef } from 'react';

interface AutoSaveOptions {
  delay?: number; // Delay em ms antes de salvar
  storageKey: string; // Chave para localStorage
  onSave?: (data: any) => void; // Callback quando salva
  onLoad?: (data: any) => void; // Callback quando carrega
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions
) {
  const {
    delay = 30000, // 30 segundos de delay padrão
    storageKey,
    onSave,
    onLoad
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<T>();

  // Função para salvar dados
  const saveData = useCallback((dataToSave: T) => {
    try {
      const serializedData = JSON.stringify({
        data: dataToSave,
        timestamp: Date.now(),
        version: '1.0'
      });
      
      localStorage.setItem(storageKey, serializedData);
      lastSavedRef.current = dataToSave;
      
      console.log(`💾 Auto-save: Dados salvos em ${storageKey}`, {
        timestamp: new Date().toLocaleTimeString(),
        dataSize: serializedData.length
      });
      
      onSave?.(dataToSave);
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
    }
  }, [storageKey, onSave]);

  // Função para carregar dados
  const loadData = useCallback(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Verificar se os dados não são muito antigos (24 horas)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        
        if (isExpired) {
          console.log('🗑️ Auto-save: Dados expirados, removendo...');
          localStorage.removeItem(storageKey);
          return null;
        }
        
        console.log(`📂 Auto-save: Dados carregados de ${storageKey}`, {
          timestamp: new Date(parsed.timestamp).toLocaleTimeString(),
          dataSize: savedData.length
        });
        
        onLoad?.(parsed.data);
        return parsed.data;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
    }
    return null;
  }, [storageKey, onLoad]);

  // Função para limpar dados salvos
  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      lastSavedRef.current = undefined;
      console.log(`🗑️ Auto-save: Dados removidos de ${storageKey}`);
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }, [storageKey]);

  // Auto-save com debounce - não bloqueia interação
  useEffect(() => {
    // Verificar se os dados mudaram
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedRef.current);
    
    if (hasChanged) {
      console.log('⏰ useAutoSave - Agendando salvamento em', delay / 1000, 'segundos (não bloqueia interação)');
      
      // Limpar timeout anterior
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Criar novo timeout - executa em background
      timeoutRef.current = setTimeout(() => {
        console.log('💾 useAutoSave - Executando salvamento automático em background');
        saveData(data);
      }, delay);
    }
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, saveData]);

  // Salvar antes de sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Salvar imediatamente antes de sair
      if (JSON.stringify(data) !== JSON.stringify(lastSavedRef.current)) {
        saveData(data);
      }
    };

    const handleVisibilityChange = () => {
      // Salvar quando a aba fica oculta
      if (document.hidden && JSON.stringify(data) !== JSON.stringify(lastSavedRef.current)) {
        saveData(data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [data, saveData]);

  return {
    loadData,
    clearData,
    saveData: () => saveData(data)
  };
}
