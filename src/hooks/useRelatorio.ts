import { useQuery } from '@tanstack/react-query';
import { relatorioService, RelatorioRespondentesData, DashboardAdminStats, QuestionarioComEstatisticas, QuestionarioEstatisticas } from '../services/relatorio.service';

export interface RelatorioFilters {
  dataInicio?: string;
  dataFim?: string;
  instituicaoId?: number;
  nivelEnsinoId?: number;
}

/**
 * Hook para buscar relatório de respondentes
 */
export const useRelatorioRespondentes = (filtros?: RelatorioFilters) => {
  return useQuery<RelatorioRespondentesData, Error>({
    queryKey: ['relatorio-respondentes', filtros],
    queryFn: () => relatorioService.getRelatorioRespondentes(filtros),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para buscar estatísticas do dashboard admin
 */
export const useDashboardAdminStats = () => {
  return useQuery<DashboardAdminStats, Error>({
    queryKey: ['dashboard-admin-stats'],
    queryFn: () => relatorioService.getDashboardAdminStats(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para buscar questionários com estatísticas
 */
export const useQuestionariosComEstatisticas = () => {
  return useQuery<QuestionarioComEstatisticas[], Error>({
    queryKey: ['questionarios-com-estatisticas'],
    queryFn: () => relatorioService.getQuestionariosComEstatisticas(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para buscar estatísticas de um questionário específico
 */
export const useEstatisticasQuestionario = (questionarioId: number) => {
  return useQuery<QuestionarioEstatisticas, Error>({
    queryKey: ['estatisticas-questionario', questionarioId],
    queryFn: () => relatorioService.getEstatisticasQuestionario(questionarioId),
    enabled: !!questionarioId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para buscar dados parciais de convites
 */
export const useParcialConvites = (questionarioId: number) => {
  return useQuery({
    queryKey: ['parcial-convites', questionarioId],
    queryFn: () => relatorioService.getParcialConvites(questionarioId),
    enabled: !!questionarioId,
    staleTime: 2 * 60 * 1000, // 2 minutos (dados mais dinâmicos)
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
};
