export interface FormGetParams {
  id: string;
}

export interface FormResponse {
  titulo: string;
  dataExpiracao: string;
  questoes: QuestionResponse[]
}

export interface QuestionResponse {
  texto: string;
  tipo: QuestionType;
  opcoes?: OptionItem[];
  colunas?: OptionItem[];
}
export interface OptionItem {
  texto: string;
  idOpcao: string;
  ordem: number;
  peso: number;
}

export const QUESTIONS_TYPES = [
  { value: "MultiplaEscolha", label: "Múltipla Escolha" },
  { value: "CaixaTexto", label: "Caixa de texto" },
  { value: "MenuSuspenso", label: "Menu suspenso" },
  { value: "EscalaLinear", label: "Pior Melhor" },
  { value: "Matriz", label: "Matriz" },
];

export type QuestionType =
  | "MultiplaEscolha"
  | "CaixaTexto"
  | "MenuSuspenso"
  | "EscalaLinear"
  | "Matriz";

export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = "MultiplaEscolha",
  TEXT_BOX = "CaixaTexto",
  LINEAR_SCALE = "EscalaLinear",
  MENU = "MenuSuspenso",
  MATRIX = "Matriz",
}
