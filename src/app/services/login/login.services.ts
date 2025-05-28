import { LoginParams, LoginResponse } from ".";
import { api } from "../api";

export const LoginServices = {
  post: async (payload: LoginParams): Promise<LoginResponse> => {
    const BASE_PATH = "/Auth/login";

    const result = await api.post(BASE_PATH, payload);

    if (!result.status) throw new Error("Login inválido");
     
    return result.data
  },
};
