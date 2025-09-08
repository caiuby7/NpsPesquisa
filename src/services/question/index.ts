import { api } from '../api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QuestionResponse, QuestionType } from '../../app/services/form/form.services.types';

export interface QuestionPostParams {
  texto: string;
  tipo: QuestionType;
  isCondicional?: boolean;
  opcoes?: Array<{
    texto: string;
    valor?: string;
    ehColuna?: boolean;
    ativaCondicao?: boolean;
    questaoCondicionalId?: number;
  }>;
}

export const useGetQuestions = () => {
  return useQuery<QuestionResponse[]>({
    queryKey: ['questions'],
    queryFn: () => api.get('/questao').then(res => res.data),
  });
};

export const useGetQuestionById = (id?: string) => {
  return useQuery<QuestionResponse>({
    queryKey: ['question', id],
    queryFn: () => api.get(`/questao/${id}`).then(res => res.data),
    enabled: !!id,
  });
};

export const useQuestionPostMutate = (onSuccess?: () => void, onError?: (error?: any) => void) => {
  return useMutation({
    mutationFn: (data: QuestionPostParams) => api.post('/questao', data),
    onSuccess,
    onError,
  });
};

export const useQuestionPutMutate = (onSuccess?: () => void, onError?: (error?: any) => void) => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: QuestionPostParams }) =>
      api.put(`/questao/${id}`, payload),
    onSuccess,
    onError,
  });
};

export const useQuestionDeleteMutate = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/questao/${id}`),
  });
}; 