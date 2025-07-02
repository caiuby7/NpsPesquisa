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
  textoBoasVindas?: string;
  templateEmailConvite?: string;
  templateEmailLembrete?: string;
  lembrarACadaXDias?: number;
  enviarLembreteAutomatico?: boolean;
  enviarLembreteParaTodos?: boolean;
}

export interface FormResponse {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string; // ISO Date string
  dataExpiracao: string; // ISO Date string
  ordemAleatoria: boolean;
  dataInicio: string | null;
  dataFim: string | null;
  questoesQuestionarios: QuestoesQuestionario[];
  questoes: any; 
  respostas: any; 
}

export interface QuestionResponse {
  id: number;
  texto: string;
  tipo: QuestionTypeEnum;
  opcoes?: OptionItem[];
  colunas?: OptionItem[];
  coluna?: OptionItem[];
  obrigatorio?: boolean;
}

export interface OptionItem {
  texto: string;
  id: string | number;
  ordem: number;
  peso: number;
  valor?: string;
  ehColuna?: boolean
}

export const QUESTIONS_TYPES = [
  { value: QuestionTypeEnum.MULTIPLE_CHOICE, label: "Múltipla Escolha" },
  { value: QuestionTypeEnum.TEXT_BOX, label: "Caixa de texto" },
  { value: QuestionTypeEnum.MENU, label: "Menu suspenso" },
  { value: QuestionTypeEnum.LINEAR_SCALE, label: "Escala linear" },
  { value: QuestionTypeEnum.MATRIX, label: "Matriz" },
];


export interface QuestoesQuestionario {
  id: number;
  questaoId: number;
  questionarioId: number;
  ordem: number;
  questao: QuestionResponse;
  tipo: QuestionTypeEnum
}


