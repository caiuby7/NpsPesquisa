import { useState, useEffect, useCallback } from 'react';

export interface Disciplina {
  id: number;
  nome: string;
  codigo: string;
  avaliacoes: AvaliacaoDisciplina[];
}

export interface AvaliacaoDisciplina {
  criterio: string;
  valor: number | null;
}

export interface AvaliacaoInstitucionalState {
  disciplinas: Disciplina[];
  progresso: number;
  secoesCompletas: number;
  totalSecoes: number;
  loading: boolean;
  error: string | null;
}

export const criteriosAvaliacao = [
  'Qualidade do conteúdo',
  'Metodologia de ensino',
  'Disponibilidade do professor',
  'Recursos disponíveis',
  'Avaliação e feedback'
];

export const opcoesAvaliacao = [
  { valor: 5, label: 'Excelente', cor: 'green' },
  { valor: 4, label: 'Bom', cor: 'blue' },
  { valor: 3, label: 'Regular', cor: 'yellow' },
  { valor: 2, label: 'Ruim', cor: 'orange' },
  { valor: 1, label: 'Muito Ruim', cor: 'red' }
];

export const useAvaliacaoInstitucional = (questionarioId: string) => {
  const [state, setState] = useState<AvaliacaoInstitucionalState>({
    disciplinas: [],
    progresso: 0,
    secoesCompletas: 0,
    totalSecoes: 0,
    loading: true,
    error: null
  });

  // Carregar disciplinas do participante
  const carregarDisciplinas = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // TODO: Integrar com a API real
      // const response = await api.get(`/questionarios/${questionarioId}/disciplinas-participante`);
      // const disciplinas = response.data;
      
      // Mock data para demonstração
      const disciplinasMock: Disciplina[] = [
        {
          id: 1,
          nome: 'Programação Orientada a Objetos',
          codigo: 'POO001',
          avaliacoes: criteriosAvaliacao.map(criterio => ({
            criterio,
            valor: null
          }))
        },
        {
          id: 2,
          nome: 'Banco de Dados',
          codigo: 'BD001',
          avaliacoes: criteriosAvaliacao.map(criterio => ({
            criterio,
            valor: null
          }))
        },
        {
          id: 3,
          nome: 'Estrutura de Dados',
          codigo: 'ED001',
          avaliacoes: criteriosAvaliacao.map(criterio => ({
            criterio,
            valor: null
          }))
        },
        {
          id: 4,
          nome: 'Redes de Computadores',
          codigo: 'RC001',
          avaliacoes: criteriosAvaliacao.map(criterio => ({
            criterio,
            valor: null
          }))
        },
        {
          id: 5,
          nome: 'Sistemas Operacionais',
          codigo: 'SO001',
          avaliacoes: criteriosAvaliacao.map(criterio => ({
            criterio,
            valor: null
          }))
        },
        {
          id: 6,
          nome: 'Inteligência Artificial',
          codigo: 'IA001',
          avaliacoes: criteriosAvaliacao.map(criterio => ({
            criterio,
            valor: null
          }))
        },
        {
          id: 7,
          nome: 'Desenvolvimento Web',
          codigo: 'DW001',
          avaliacoes: criteriosAvaliacao.map(criterio => ({
            criterio,
            valor: null
          }))
        }
      ];

      setState(prev => ({
        ...prev,
        disciplinas: disciplinasMock,
        totalSecoes: disciplinasMock.length,
        loading: false
      }));

      calcularProgresso(disciplinasMock);
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
      setState(prev => ({
        ...prev,
        error: 'Erro ao carregar disciplinas. Tente novamente.',
        loading: false
      }));
    }
  }, [questionarioId]);

  // Atualizar avaliação de um critério específico
  const atualizarAvaliacao = useCallback((disciplinaId: number, criterio: string, valor: number) => {
    setState(prev => {
      const disciplinasAtualizadas = prev.disciplinas.map(disc => {
        if (disc.id === disciplinaId) {
          return {
            ...disc,
            avaliacoes: disc.avaliacoes.map(av => 
              av.criterio === criterio ? { ...av, valor } : av
            )
          };
        }
        return disc;
      });

      return {
        ...prev,
        disciplinas: disciplinasAtualizadas
      };
    });
  }, []);

  // Calcular progresso geral
  const calcularProgresso = useCallback((disciplinas: Disciplina[]) => {
    let totalAvaliacoes = 0;
    let avaliacoesCompletas = 0;

    disciplinas.forEach(disc => {
      disc.avaliacoes.forEach(av => {
        totalAvaliacoes++;
        if (av.valor !== null) {
          avaliacoesCompletas++;
        }
      });
    });

    const progressoCalculado = totalAvaliacoes > 0 ? (avaliacoesCompletas / totalAvaliacoes) * 100 : 0;
    
    // Calcular seções completas (disciplinas com todas as avaliações preenchidas)
    const secoesCompletas = disciplinas.filter(disc => 
      disc.avaliacoes.every(av => av.valor !== null)
    ).length;

    setState(prev => ({
      ...prev,
      progresso: progressoCalculado,
      secoesCompletas
    }));
  }, []);

  // Salvar avaliação completa
  const salvarAvaliacao = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // TODO: Integrar com a API real
      // const response = await api.post(`/questionarios/${questionarioId}/avaliacoes`, {
      //   disciplinas: state.disciplinas
      // });
      
      // Simular envio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({ ...prev, loading: false }));
      return { success: true, message: 'Avaliação salva com sucesso!' };
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      const errorMessage = 'Erro ao salvar avaliação. Tente novamente.';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, message: errorMessage };
    }
  }, [questionarioId, state.disciplinas]);

  // Verificar se todas as avaliações estão completas
  const todasAvaliacoesCompletas = useCallback(() => {
    return state.disciplinas.every(disc => 
      disc.avaliacoes.every(av => av.valor !== null)
    );
  }, [state.disciplinas]);

  // Resetar avaliações
  const resetarAvaliacao = useCallback(() => {
    setState(prev => ({
      ...prev,
      disciplinas: prev.disciplinas.map(disc => ({
        ...disc,
        avaliacoes: disc.avaliacoes.map(av => ({ ...av, valor: null }))
      })),
      progresso: 0,
      secoesCompletas: 0
    }));
  }, []);

  // Carregar disciplinas quando o componente montar
  useEffect(() => {
    carregarDisciplinas();
  }, [carregarDisciplinas]);

  // Calcular progresso sempre que as disciplinas mudarem
  useEffect(() => {
    if (state.disciplinas.length > 0) {
      calcularProgresso(state.disciplinas);
    }
  }, [state.disciplinas, calcularProgresso]);

  return {
    ...state,
    atualizarAvaliacao,
    salvarAvaliacao,
    resetarAvaliacao,
    todasAvaliacoesCompletas,
    carregarDisciplinas
  };
};
