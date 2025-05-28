import { useMutation } from "@tanstack/react-query";
import { AnswerPostParams } from "./answer.services.types";
import { AnserServices } from "./answer.services";

const ANSWER_POST_KEY = "answer-post-key";

export const useAnswerMutate = (
  handleMutationSuccess: () => void,
  handleMutationError: () => void,
  handleOnMutate?: () => void
) => {
  return useMutation({
    mutationKey: [ANSWER_POST_KEY],
    mutationFn: async (params: AnswerPostParams) => await AnserServices.post(params),
    onError: () => handleMutationError(),
    onMutate: () => handleOnMutate && handleOnMutate(),
    onSuccess: () => handleMutationSuccess(),
  });
};

