import { QuestionPostParams } from ".";
import { api } from "../api";
import { QuestionResponse } from "../form";

export const QuestionService = {
  post: async (payload: QuestionPostParams): Promise<void> => {
    const BASE_PATH = "/Questao";
    return await api.post(BASE_PATH, payload);
  },
  get: async (): Promise<QuestionResponse[]> => {
    const BASE_PATH = "/Questao";
    const response = await api.get(BASE_PATH);
    return response.data;
  },
  getById: async (id?: string): Promise<QuestionResponse> => {
    const BASE_PATH = `/Questao/${id}`;
    const response = await api.get(BASE_PATH);
    return response.data;
  },
  put: async (id: string, payload: QuestionPostParams): Promise<void> => {
    const BASE_PATH = `/Questao/${id}`;
    return await api.put(BASE_PATH, payload);
  },
  delete: async (id: string): Promise<void> => {
    const BASE_PATH = `/Questao/${id}`;
    return await api.delete(BASE_PATH);
  },
};
