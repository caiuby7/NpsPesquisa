import { useMutation, useQuery } from "@tanstack/react-query";
import { FormGetParams, FormPostParams } from "./form.services.types";
import { FormServices } from "./form.services";

const STALE_TIME = 10 * 1000;
const GET_FORM_QUERY_KEY = "";
const POST_FORM_KEY = "post-form-key";

export const useGetForm = (param: FormGetParams) => {
  return useQuery({
    queryKey: [GET_FORM_QUERY_KEY],
    queryFn: async () => FormServices.get(param),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useGetForms = () => {
  return useQuery({
    queryKey: ["forms-list"],
    queryFn: async () => FormServices.list(),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useFormPostMutate = (
  handleMutationSuccess: () => void,
  handleMutationError: () => void,
  handleOnMutate?: () => void
) => {
  return useMutation({
    mutationKey: [POST_FORM_KEY],
    mutationFn: async (params: FormPostParams) =>
      await FormServices.post(params),
    onError: () => handleMutationError(),
    onMutate: () => handleOnMutate && handleOnMutate(),
    onSuccess: () =>
      handleMutationSuccess(),
  })
}

export const useUpdateForm = () => {
  return useMutation({
    mutationFn: async ({ id, ...payload }: any) => await FormServices.put(id, payload),
  });
};
