export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = "MultiplaEscolha",
  TEXT_BOX = "CaixaTexto",
  LINEAR_SCALE = "EscalaLinear",
  MENU = "MenuSuspenso",
  MATRIX = "Matriz",
}

export type QuestionType = QuestionTypeEnum;

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
  tipo: QuestionTypeEnum;
  opcoes?: OptionItem[];
  colunas?: OptionItem[];
  coluna?: OptionItem[];
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
  { value: QuestionTypeEnum.MULTIPLE_CHOICE, label: "Múltipla Escolha" },
  { value: QuestionTypeEnum.TEXT_BOX, label: "Caixa de texto" },
  { value: QuestionTypeEnum.MENU, label: "Menu suspenso" },
  { value: QuestionTypeEnum.LINEAR_SCALE, label: "Pior Melhor" },
  { value: QuestionTypeEnum.MATRIX, label: "Matriz" },
];

