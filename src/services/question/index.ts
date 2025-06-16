import { api } from '../api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QuestionResponse, QuestionType } from '../form';

export interface QuestionPostParams {
  texto: string;
  tipo: QuestionType;
  opcoes?: Array<{
    texto: string;
    valor?: string;
    ehColuna?: boolean;
  }>;
}

export const useGetQuestions = () => {
  return useQuery<QuestionResponse[]>({
    queryKey: ['questions'],
    queryFn: () => api.get('/questoes').then(res => res.data),
  });
};

export const useQuestionPostMutate = () => {
  return useMutation({
    mutationFn: (data: QuestionPostParams) => api.post('/questoes', data),
  });
};

export const useQuestionPutMutate = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuestionPostParams }) =>
      api.put(`/questoes/${id}`, data),
  });
};

export const useQuestionDeleteMutate = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/questoes/${id}`),
  });
}; 