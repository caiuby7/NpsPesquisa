import { api } from '../api';
import { useMutation, useQuery } from '@tanstack/react-query';

export interface OptionItem {
  id: string;
  texto: string;
  valor?: string;
  ehColuna?: boolean;
}

export interface QuestionResponse {
  id: string;
  texto: string;
  tipo: QuestionType;
  opcoes?: OptionItem[];
  colunas?: OptionItem[];
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  LINEAR_SCALE = 'LINEAR_SCALE',
  MATRIX = 'MATRIX',
  SHORT_ANSWER = 'SHORT_ANSWER',
  PARAGRAPH = 'PARAGRAPH',
  DROPDOWN = 'DROPDOWN'
}

export interface Form {
  id: string;
  titulo: string;
  descricao: string;
  questoes: QuestionResponse[];
}

export const useGetForms = () => {
  return useQuery<Form[]>({
    queryKey: ['forms'],
    queryFn: () => api.get('/formularios').then(res => res.data),
  });
};

export const useFormPostMutate = () => {
  return useMutation({
    mutationFn: (data: Partial<Form>) => api.post('/formularios', data),
  });
};

export const useFormPutMutate = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Form> }) =>
      api.put(`/formularios/${id}`, data),
  });
};

export const useFormDeleteMutate = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/formularios/${id}`),
  });
}; 