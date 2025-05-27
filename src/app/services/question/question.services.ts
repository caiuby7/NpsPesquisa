import { QuestionPostParams } from "."

export const QuestionService = {
  post: async (payload: QuestionPostParams): Promise<void> => {
    const BASE_PATH = 'api/Questao'
    console.log(payload, BASE_PATH)
    return 
    //return (await HTTP.post(BASE_PATH, payload)).data
  },
}
