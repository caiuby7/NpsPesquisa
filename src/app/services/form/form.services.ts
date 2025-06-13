import { FormGetParams, FormPostParams, FormResponse } from ".";
import { api } from "../api";
import { QuestionTypeEnum } from "../question";

export const FormServices = {
  get: async (payload: FormGetParams): Promise<FormResponse> => {
    const BASE_PATH = `/Questionario/${payload.id}`;
    const result = (await api.get(BASE_PATH)).data

    return {
      ...result,
      questoesQuestionarios: result.questoesQuestionarios.map((item: import("./form.services.types").QuestoesQuestionario) => {
        const { questao } = item
        if(questao.tipo === QuestionTypeEnum.MATRIX) {
          return {
            ...questao,
            opcoes: questao.opcoes?.filter((item) => !item.ehColuna) || [],
            colunas: questao.opcoes?.filter((item) => item.ehColuna) || [],
          }
        }
        return questao
      })
    };
  },
  post: async (payload: FormPostParams): Promise<void> => {
    const BASE_PATH = "/Questionario/com-questoes";

    return await api.post(BASE_PATH, payload);
  },
  list: async (): Promise<FormResponse[]> => {
    const BASE_PATH = "/Questionario";
    const response = await api.get(BASE_PATH);
    return response.data;
  },
  put: async (id: string | number, payload: Partial<FormPostParams>): Promise<void> => {
    const BASE_PATH = `/Questionario/${id}`;
    return await api.put(BASE_PATH, payload);
  },
};
