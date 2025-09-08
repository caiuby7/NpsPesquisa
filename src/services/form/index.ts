import { api } from '../api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QuestionService } from '../../app/services/question/question.services';

const QUESTION_GET_KEY = "question-get-key";

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
  dataInicio: string;
  dataFim: string;
  tipo: string;
  permitirComentarios: boolean;
  permitirSalvarAndamento: boolean;
  textoBoasVindas: string;
  templateEmailConvite: string;
  templateEmailLembrete: string;
  lembrarACadaXDias: number;
  enviarLembreteAutomatico: boolean;
  enviarLembreteParaTodos: boolean;
  questoes: any[];
}

export const useGetForms = () => {
  return useQuery<Form[]>({
    queryKey: ['forms'],
    queryFn: () => api.get('/Questionario').then(res => res.data),
  });
};

export const useFormPutMutate = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Form> }) =>
      api.put(`/Questionario/${id}`, data),
  });
};

export const useFormDeleteMutate = () => {
  return useMutation({
    mutationFn: (id: string) => api.delete(`/Questionario/${id}`),
  });
};

export const useGetQuestions = () => {
  return useQuery({
    queryKey: [QUESTION_GET_KEY],
    queryFn: async () => {
      const response = await QuestionService.get();
      return Array.isArray(response) ? response : [];
    },
    refetchOnWindowFocus: false,
  });
}; 