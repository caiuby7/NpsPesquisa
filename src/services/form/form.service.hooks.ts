import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export interface Form {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
}

export function useGetForms() {
  return useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const response = await api.get<Form[]>("/Questionario");
      return response.data;
    },
  });
}

export function useGetDashboardData(formId: string) {
  return useQuery({
    queryKey: ["dashboard-data", formId],
    queryFn: async () => {
      const response = await api.get(`/Questionario/${formId}/dashboard`);
      return response.data;
    },
    enabled: !!formId,
  });
} 