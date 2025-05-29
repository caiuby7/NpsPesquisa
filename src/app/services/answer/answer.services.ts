import { AnswerPostParams } from ".";
import { api } from "../api";

export const AnserServices = {
  post: async (payload: AnswerPostParams): Promise<void> => {
    const BASE_PATH = "/Questionario";

    await api.post(BASE_PATH, payload);
    return;
  },
};
