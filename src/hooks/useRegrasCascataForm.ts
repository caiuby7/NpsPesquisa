import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import type { RegraCascata } from './useRegrasCascata';

interface UseRegrasCascataFormProps {
  regrasIniciais?: RegraCascata[];
  questionarioId?: number;
  onRegrasChange?: (regras: RegraCascata[]) => void;
}

interface UseRegrasCascataFormReturn {
  regras: RegraCascata[];
  setRegras: (regras: RegraCascata[]) => void;
  adicionarRegra: (novaRegra: Omit<RegraCascata, 'id'>) => void;
  atualizarRegra: (id: string, atualizacoes: Partial<RegraCascata>) => void;
  removerRegra: (id: string) => void;
  salvarRegras: () => Promise<void>;
  carregando: boolean;
  erro: string | null;
  hasChanges: boolean;
  resetRegras: () => void;
}

export const useRegrasCascataForm = ({
  regrasIniciais = [],
  questionarioId,
  onRegrasChange
}: UseRegrasCascataFormProps = {}): UseRegrasCascataFormReturn => {
  const [regras, setRegrasState] = useState<RegraCascata[]>(regrasIniciais);
  const [regrasOriginais] = useState<RegraCascata[]>(regrasIniciais);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const toast = useToast();

  const setRegras = useCallback((novasRegras: RegraCascata[]) => {
    setRegrasState(novasRegras);
    onRegrasChange?.(novasRegras);
  }, [onRegrasChange]);

  const adicionarRegra = useCallback((novaRegra: Omit<RegraCascata, 'id'>) => {
    const regraComId: RegraCascata = {
      ...novaRegra,
      id: crypto.randomUUID()
    };
    
    const novasRegras = [...regras, regraComId];
    setRegras(novasRegras);
  }, [regras, setRegras]);

  const atualizarRegra = useCallback((id: string, atualizacoes: Partial<RegraCascata>) => {
    const novasRegras = regras.map(regra => 
      regra.id === id ? { ...regra, ...atualizacoes } : regra
    );
    setRegras(novasRegras);
  }, [regras, setRegras]);

  const removerRegra = useCallback((id: string) => {
    const novasRegras = regras.filter(regra => regra.id !== id);
    setRegras(novasRegras);
  }, [regras, setRegras]);

  const salvarRegras = useCallback(async () => {
    if (!questionarioId) {
      const erroMsg = 'ID do questionário não fornecido para salvar as regras';
      setErro(erroMsg);
      toast({
        title: 'Erro!',
        description: erroMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      // Converter regras para JSON string
      const regrasJson = JSON.stringify(regras);

      // Fazer requisição para atualizar o questionário
      const response = await fetch(`/api/Questionario/${questionarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          regrasCascata: regrasJson
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar regras em cascata');
      }

      toast({
        title: 'Sucesso!',
        description: 'Regras em cascata salvas com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      const erroMsg = error instanceof Error ? error.message : 'Erro desconhecido ao salvar regras';
      setErro(erroMsg);

      toast({
        title: 'Erro!',
        description: erroMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setCarregando(false);
    }
  }, [regras, questionarioId, toast]);

  const resetRegras = useCallback(() => {
    setRegras(regrasOriginais);
    setErro(null);
  }, [regrasOriginais, setRegras]);

  // Verificar se houve mudanças comparando com as regras originais
  const hasChanges = JSON.stringify(regras) !== JSON.stringify(regrasOriginais);

  return {
    regras,
    setRegras,
    adicionarRegra,
    atualizarRegra,
    removerRegra,
    salvarRegras,
    carregando,
    erro,
    hasChanges,
    resetRegras
  };
};

export default useRegrasCascataForm;

