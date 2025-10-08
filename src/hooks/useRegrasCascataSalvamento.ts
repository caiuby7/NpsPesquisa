import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import type { RegraCascata } from './useRegrasCascata';

interface UseRegrasCascataSalvamentoProps {
  questionarioId?: number;
  onSalvarSucesso?: (regras: RegraCascata[]) => void;
  onSalvarErro?: (erro: string) => void;
}

interface UseRegrasCascataSalvamentoReturn {
  salvarRegras: (regras: RegraCascata[]) => Promise<void>;
  carregando: boolean;
  erro: string | null;
}

export const useRegrasCascataSalvamento = ({
  questionarioId,
  onSalvarSucesso,
  onSalvarErro
}: UseRegrasCascataSalvamentoProps = {}): UseRegrasCascataSalvamentoReturn => {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const toast = useToast();

  const salvarRegras = async (regras: RegraCascata[]): Promise<void> => {
    if (!questionarioId) {
      const erroMsg = 'ID do questionário não fornecido';
      setErro(erroMsg);
      onSalvarErro?.(erroMsg);
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      // Converter regras para JSON string
      const regrasJson = JSON.stringify(regras);

      // Fazer requisição para atualizar o questionário com as regras
      const response = await fetch(`/api/Questionario/${questionarioId}/com-questoes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assumindo que o token está no localStorage
        },
        body: JSON.stringify({
          // Manter outros campos existentes do questionário
          // Apenas atualizar o campo RegrasCascata
          regrasCascata: regrasJson
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar regras em cascata');
      }

      // Sucesso
      toast({
        title: 'Sucesso!',
        description: 'Regras em cascata salvas com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onSalvarSucesso?.(regras);

    } catch (error) {
      const erroMsg = error instanceof Error ? error.message : 'Erro desconhecido ao salvar regras';
      setErro(erroMsg);
      onSalvarErro?.(erroMsg);

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
  };

  return {
    salvarRegras,
    carregando,
    erro
  };
};

export default useRegrasCascataSalvamento;

