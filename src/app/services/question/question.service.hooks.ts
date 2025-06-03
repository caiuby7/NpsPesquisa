import { useMutation, useQuery } from "@tanstack/react-query"
import { QuestionPostParams, QuestionService } from "."

const QUESTION_POST_KEY = "question-post-key"
const QUESTION_GET_KEY = "question-get-key"
const QUESTION_GET_BY_ID_KEY = "question-get-key"
const QUESTION_PUT_KEY = "question-put-key"

export const useQuestionPostMutate = (
  handleMutationSuccess: () => void,
  handleMutationError: () => void,
  handleOnMutate?: () => void
) => {
  return useMutation({
    mutationKey: [QUESTION_POST_KEY],
    mutationFn: async (params: QuestionPostParams) =>
      await QuestionService.post(params),
    onError: () => handleMutationError(),
    onMutate: () => handleOnMutate && handleOnMutate(),
    onSuccess: () =>
      handleMutationSuccess(),
  })
}

export const useQuestionPutMutate = (
  handleMutationSuccess: () => void,
  handleMutationError: () => void,
  handleOnMutate?: () => void
) => {
  return useMutation({
    mutationKey: [QUESTION_PUT_KEY],
    mutationFn: async (data: {id: string, payload: QuestionPostParams}) =>
      await QuestionService.put(data.id, data.payload),
    onError: () => handleMutationError(),
    onMutate: () => handleOnMutate && handleOnMutate(),
    onSuccess: () =>
      handleMutationSuccess(),
  })
}

export const useGetQuestions = () => {
  return useQuery({
    queryKey: [QUESTION_GET_KEY],
    queryFn: async () => QuestionService.get(),
    refetchOnWindowFocus: false,
  });
};

export const useGetQuestionById = (id: string) => {
  return useQuery({
    queryKey: [QUESTION_GET_BY_ID_KEY],
    queryFn: async () => QuestionService.getById(id),
    refetchOnWindowFocus: false,
    enabled: !!id
  });
};
