import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

export interface LoginParams {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
}

export function useLoginMutate(
  onSuccess?: (data: LoginResponse) => void,
  onError?: (error: any) => void
) {
  return useMutation({
    mutationFn: async (data: LoginParams) => {
      const response = await api.post<LoginResponse>("/Auth/login", data);
      return response.data;
    },
    onSuccess,
    onError,
  });
} 
