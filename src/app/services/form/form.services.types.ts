export interface FormGetParams {
  id: string;
}

export interface FormPostParams {
  titulo: string;
  dataExpiracao: string;
  descricao: string;
  ordemAleatoria: boolean;
  questoes: { questaoId: number; ordem: number }[];
}

export interface FormResponse {
  titulo: string;
  dataExpiracao: string;
  descricao: string;
  questoesQuestionarios: QuestionResponse[];
}

export interface QuestionResponse {
  id: number;
  texto: string;
  tipo: QuestionType;
  opcoes?: OptionItem[];
  colunas?: OptionItem[];
}
export interface OptionItem {
  texto: string;
  id: string;
  ordem: number;
  peso: number;
  valor?: string;
  ehColuna?: boolean
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
