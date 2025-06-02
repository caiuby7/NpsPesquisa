import { AnswerPostParams } from ".";
import { api } from "../api";

export const AnserServices = {
  post: async (payload: AnswerPostParams): Promise<void> => {
    const BASE_PATH = "/Resposta";

    await api.post(BASE_PATH, payload);
    return;
  },
};
