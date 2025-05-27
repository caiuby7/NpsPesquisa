import { FormGetParams, FormResponse } from ".";

export const FormServices = {
  get: async (payload: FormGetParams): Promise<FormResponse> => {
    const BASE_PATH = "api/questionario";

    return {
      titulo: "Pesquisa de Satisfação",
      dataExpiracao: "2024-12-31T23:59:59Z",
      questoes: [
        {
          id: "1",
          texto: "Como você avalia os seguintes aspectos?",
          tipo: "CaixaTexto",
        },
        {
          id: "2",
          texto: "Como você avalia os seguintes aspectos?",
          tipo: "MultiplaEscolha",
          opcoes: [
            {
              texto: "opcão 1",
              idOpcao: "1",
              ordem: 1,
              peso: 1,
            },
            {
              texto: "opcão 2",
              idOpcao: "2",
              ordem: 2,
              peso: 1,
            },
          ],
        },
        {
          id: "3",
          texto: "Como você avalia os seguintes aspectos?",
          tipo: "MenuSuspenso",
          opcoes: [
            {
              texto: "opcão 1",
              idOpcao: "1",
              ordem: 1,
              peso: 1,
            },
            {
              texto: "opcão 2",
              idOpcao: "2",
              ordem: 2,
              peso: 1,
            },
          ],
        },
        {
          id: "4",
          texto: "Como você avalia os seguintes aspectos?",
          tipo: "EscalaLinear",
          opcoes: [
            {
              texto: "Ruim",
              idOpcao: "1",
              ordem: 0,
              peso: 1,
            },
            {
              texto: "Bom",
              idOpcao: "2",
              ordem: 10,
              peso: 1,
            },
          ],
        },
        {
          id: "5",
          texto: "Como você avalia os seguintes aspectos?",
          tipo: "Matriz",
          opcoes: [
            {
              texto: "Linha 1",
              idOpcao: "1",
              ordem: 1,
              peso: 1,
            },
            {
              texto: "Linha 2",
              idOpcao: "2",
              ordem: 2,
              peso: 1,
            },
          ],
          colunas: [
            {
              texto: "Coluna 1",
              idOpcao: "1",
              ordem: 1,
              peso: 1,
            },
            {
              texto: "Coluna 2",
              idOpcao: "2",
              ordem: 2,
              peso: 1,
            },
          ],
        },
      ],
    };

    return (await HTTP.post(BASE_PATH, payload)).data;
  },
};
