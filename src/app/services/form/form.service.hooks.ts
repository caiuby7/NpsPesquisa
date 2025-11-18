import { useMutation, useQuery } from "@tanstack/react-query";
import { FormGetParams, FormPostParams } from "./form.services.types";
import { FormServices } from "./form.services";

const STALE_TIME = 10 * 1000;
const POST_FORM_KEY = "post-form-key";

export const useGetForm = (param: FormGetParams) => {
  return useQuery({
    queryKey: ["form", param.id],
    queryFn: async () => FormServices.get(param),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    enabled: Boolean(param?.id),
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
