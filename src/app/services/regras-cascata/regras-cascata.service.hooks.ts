import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { 
  regrasCascataService, 
  RegraCascataResponse, 
  RegraCascataRequest,
  ReordenacaoDto 
} from './regras-cascata.service';

/**
 * Hook para buscar todas as regras em cascata
 */
export function useGetRegrasCascata(apenasAtivas: boolean = true): UseQueryResult<RegraCascataResponse[], Error> {
  return useQuery({
    queryKey: ['regras-cascata', apenasAtivas],
    queryFn: () => regrasCascataService.getAll(apenasAtivas),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar uma regra específica por ID
 */
export function useGetRegraCascataById(id: number): UseQueryResult<RegraCascataResponse, Error> {
  return useQuery({
    queryKey: ['regras-cascata', id],
    queryFn: () => regrasCascataService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para buscar uma regra específica por identificador
 */
export function useGetRegraCascataByIdentificador(identificador: string): UseQueryResult<RegraCascataResponse, Error> {
  return useQuery({
    queryKey: ['regras-cascata', 'identificador', identificador],
    queryFn: () => regrasCascataService.getByIdentificador(identificador),
    enabled: !!identificador,
  });
}

/**
 * Hook para criar uma nova regra
 */
export function useCreateRegraCascata(): UseMutationResult<RegraCascataResponse, Error, RegraCascataRequest> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (regra: RegraCascataRequest) => regrasCascataService.create(regra),
    onSuccess: () => {
      // Invalidar cache para forçar recarga
      queryClient.invalidateQueries({ queryKey: ['regras-cascata'] });
    },
  });
}

/**
 * Hook para atualizar uma regra existente
 */
export function useUpdateRegraCascata(): UseMutationResult<
  RegraCascataResponse, 
  Error, 
  { id: number; regra: RegraCascataRequest }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, regra }) => regrasCascataService.update(id, regra),
    onSuccess: (_, variables) => {
      // Invalidar cache específico e geral
      queryClient.invalidateQueries({ queryKey: ['regras-cascata', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['regras-cascata'] });
    },
  });
}

/**
 * Hook para ativar/desativar uma regra
 */
export function useToggleAtivaRegraCascata(): UseMutationResult<
  { message: string; ativa: boolean }, 
  Error, 
  number
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => regrasCascataService.toggleAtiva(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['regras-cascata', id] });
      queryClient.invalidateQueries({ queryKey: ['regras-cascata'] });
    },
  });
}

/**
 * Hook para excluir uma regra (soft delete)
 */
export function useDeleteRegraCascata(): UseMutationResult<{ message: string }, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => regrasCascataService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras-cascata'] });
    },
  });
}

/**
 * Hook para excluir permanentemente uma regra
 */
export function useDeletePermanenteRegraCascata(): UseMutationResult<{ message: string }, Error, number> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => regrasCascataService.deletePermanente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras-cascata'] });
    },
  });
}

/**
 * Hook para reordenar regras
 */
export function useReordenarRegrasCascata(): UseMutationResult<{ message: string }, Error, ReordenacaoDto[]> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reordenacoes: ReordenacaoDto[]) => regrasCascataService.reordenar(reordenacoes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regras-cascata'] });
    },
  });
}

