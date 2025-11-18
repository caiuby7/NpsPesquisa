import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExcluirQuestaoVinculoPayload,
  QuestionarioVinculoFiltro,
  QuestionarioVinculoListaItem,
  QuestionarioVinculoResponse,
  SalvarQuestionarioVinculoPayload,
} from "./questoes-vinculos.types";
import { QuestoesVinculosService } from "./questoes-vinculos.service";

const QUERY_KEY = "questoes-vinculos";

export const useListarQuestionarioVinculos = () => {
  return useQuery<QuestionarioVinculoListaItem[]>({
    queryKey: [QUERY_KEY, "lista"],
    queryFn: () => QuestoesVinculosService.listar(),
  });
};

export const useQuestionarioVinculo = (filtro: QuestionarioVinculoFiltro) => {
  return useQuery<QuestionarioVinculoResponse>({
    queryKey: [QUERY_KEY, filtro],
    queryFn: async () => QuestoesVinculosService.obter(filtro),
    enabled: Boolean(filtro.avaliacaoAlunoId),
  });
};

export const useQuestionarioVinculoById = (id?: number) => {
  return useQuery<QuestionarioVinculoResponse>({
    queryKey: [QUERY_KEY, "detalhe", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("É necessário informar o identificador do vínculo.");
      }
      return QuestoesVinculosService.obterPorId(id);
    },
    enabled: Boolean(id),
  });
};

export const useSalvarQuestionarioVinculo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: SalvarQuestionarioVinculoPayload) =>
      QuestoesVinculosService.salvar(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, {
          avaliacaoAlunoId: variables.avaliacaoAlunoId,
          avaliacaoProfessorId: variables.avaliacaoProfessorId ?? undefined,
          avaliacaoCoordenadorId: variables.avaliacaoCoordenadorId ?? undefined,
        }],
      });
    },
  });
};

export const useExcluirQuestaoVinculo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExcluirQuestaoVinculoPayload & { filtro: QuestionarioVinculoFiltro }) => {
      await QuestoesVinculosService.excluirQuestao(payload);
      return payload.filtro;
    },
    onSuccess: (filtro) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, filtro] });
    },
  });
};

