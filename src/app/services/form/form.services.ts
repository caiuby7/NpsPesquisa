import { FormGetParams, FormPostParams, FormResponse } from ".";
import { api } from "../api";

export const FormServices = {
  get: async (payload: FormGetParams): Promise<FormResponse> => {
      const BASE_PATH = `/Questionario`;
  
      return (await api.get(BASE_PATH)).data;
    },
  post: async (payload: FormPostParams): Promise<void> => {
    const BASE_PATH = "/Questionario/com-questoes";

    return await api.post(BASE_PATH, payload);
  },
};
