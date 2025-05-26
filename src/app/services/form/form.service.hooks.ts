import { useQuery } from "@tanstack/react-query";
import { FormGetParams, FormServices } from ".";

const STALE_TIME = 10 * 1000;
const GET_FORM_QUERY_KEY = "";

export const useGetForm = (param: FormGetParams) => {
  return useQuery({
    queryKey: [GET_FORM_QUERY_KEY],
    queryFn: async () => FormServices.get(param),
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
  });
};
