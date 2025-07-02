export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = "MultiplaEscolha",
  TEXT_BOX = "CaixaTexto",
  LINEAR_SCALE = "EscalaLinear",
  MENU = "MenuSuspenso",
  MATRIX = "Matriz",
}

export type QuestionType = QuestionTypeEnum;

export interface QuestionPostParams {
  texto: string;
  tipo: QuestionTypeEnum;
  opcoes?: OptionItem[];
  colunas?: OptionItem[];
  obrigatorio?: boolean;
}

export interface OptionItem {
  texto: string;
  idOpcao: string;
  ordem: number;
  peso: number;
  valor?: string;
  ehColuna?: boolean;
}

export const QUESTIONS_TYPES = [
  { value: QuestionTypeEnum.MULTIPLE_CHOICE, label: "Múltipla Escolha" },
  { value: QuestionTypeEnum.TEXT_BOX, label: "Caixa de texto" },
  { value: QuestionTypeEnum.MENU, label: "Menu suspenso" },
  { value: QuestionTypeEnum.LINEAR_SCALE, label: "Escala linear" },
  { value: QuestionTypeEnum.MATRIX, label: "Matriz" },
];
