import { api } from "../api";
import {
  ExcluirQuestaoVinculoPayload,
  QuestionarioVinculoFiltro,
  QuestionarioVinculoListaItem,
  QuestionarioVinculoResponse,
  SalvarQuestionarioVinculoPayload,
} from "./questoes-vinculos.types";

const BASE_PATH = "/questionario/vinculos";

export const QuestoesVinculosService = {
  async listar(): Promise<QuestionarioVinculoListaItem[]> {
    const response = await api.get<QuestionarioVinculoListaItem[]>(`${BASE_PATH}/lista`);
    return response.data;
  },

  async obter(params: QuestionarioVinculoFiltro): Promise<QuestionarioVinculoResponse> {
    const response = await api.get<QuestionarioVinculoResponse>(BASE_PATH, {
      params,
    });
    return response.data;
  },

  async obterPorId(id: number): Promise<QuestionarioVinculoResponse> {
    const response = await api.get<QuestionarioVinculoResponse>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  async salvar(payload: SalvarQuestionarioVinculoPayload): Promise<QuestionarioVinculoResponse> {
    const response = await api.post<QuestionarioVinculoResponse>(BASE_PATH, payload);
    return response.data;
  },

  async excluirQuestao(payload: ExcluirQuestaoVinculoPayload): Promise<void> {
    await api.delete(`${BASE_PATH}/${payload.vinculoId}/questoes/${payload.questaoAlunoId}`);
  },
};

