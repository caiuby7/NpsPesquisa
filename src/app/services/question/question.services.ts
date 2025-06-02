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

    return (await api.get(BASE_PATH)).data;
  },
};
