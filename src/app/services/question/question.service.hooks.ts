import { useMutation } from "@tanstack/react-query"
import { QuestionPostParams, QuestionService } from "./"

const QUESTION_POST_KEY = "question-post-key"

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
