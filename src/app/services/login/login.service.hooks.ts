import { useMutation } from "@tanstack/react-query";
import { LoginServices } from "./login.services";
import { LoginParams, LoginResponse } from "./login.services.types";

const LOGIN_POST_KEY = "login-post-key";

export const useLoginMutate = (
  handleMutationSuccess?: (data: LoginResponse) => void,
  handleMutationError?: (error: any) => void,
  handleOnMutate?: () => void
) => {
  return useMutation({
    mutationKey: [LOGIN_POST_KEY],
    mutationFn: async (params: LoginParams) => await LoginServices.post(params),
    onError: (error) => handleMutationError && handleMutationError(error),
    onMutate: () => handleOnMutate && handleOnMutate(),
    onSuccess: (data: LoginResponse) => handleMutationSuccess && handleMutationSuccess(data),
  });
};
