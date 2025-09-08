export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = "MultiplaEscolha",
  TEXT_BOX = "CaixaTexto",
  LINEAR_SCALE = "EscalaLinear",
  MENU = "MenuSuspenso",
  MATRIX = "Matriz",
}

export type QuestionType = QuestionTypeEnum;

// Novo enum para TipoQuestionario
export enum TipoQuestionarioEnum {
  NPS = "NPS",
  AVALIACAO_INSTITUCIONAL = "AvaliacaoInstitucional"
}

// Novo enum para TipoItemAvaliado
export enum TipoItemAvaliadoEnum {
  CURSO = "Curso",
  TURMA = "Turma",
  DISCIPLINA = "Disciplina",
  COORDENADOR = "Coordenador",
  ESTRUTURA = "Estrutura",
  INFRAESTRUTURA = "Infraestrutura"
}

export interface FormGetParams {
  id: string;
}

export interface FormPostParams {
  titulo: string;
  descricao: string;
  dataInicio: string; // Mudou de dataExpiracao para dataInicio
  dataFim: string;    // Novo campo obrigatório
  tipo: TipoQuestionarioEnum; // Campo obrigatório novo
  permitirComentarios?: boolean; // Campo novo
  permitirSalvarAndamento?: boolean; // Campo novo
  tipoItemAvaliado?: TipoItemAvaliadoEnum; // Campo novo
  nomeItemEspecifico?: string; // Campo novo
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
  dataInicio: string | null; // Mudou de dataExpiracao
  dataFim: string | null;    // Novo campo
  tipo: TipoQuestionarioEnum; // Campo novo
  permitirComentarios: boolean; // Campo novo
  permitirSalvarAndamento: boolean; // Campo novo
  tipoItemAvaliado?: TipoItemAvaliadoEnum; // Campo novo
  nomeItemEspecifico?: string; // Campo novo
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
  isCondicional?: boolean;
}

export interface OptionItem {
  texto: string;
  id: string | number;
  ordem: number;
  peso: number;
  valor?: string;
  ehColuna?: boolean;
  ativaCondicao?: boolean;
  questaoCondicionalId?: number;
}

export const QUESTIONS_TYPES = [
  { value: QuestionTypeEnum.MULTIPLE_CHOICE, label: "Múltipla Escolha" },
  { value: QuestionTypeEnum.TEXT_BOX, label: "Caixa de texto" },
  { value: QuestionTypeEnum.MENU, label: "Menu suspenso" },
  { value: QuestionTypeEnum.LINEAR_SCALE, label: "Escala linear" },
  { value: QuestionTypeEnum.MATRIX, label: "Matriz" },
];

// Novos tipos para questionários
export const QUESTIONARIO_TYPES = [
  { value: TipoQuestionarioEnum.NPS, label: "NPS" },
  { value: TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL, label: "Avaliação Institucional" },
];

export const ITEM_AVALIADO_TYPES = [
  { value: TipoItemAvaliadoEnum.CURSO, label: "Curso" },
  { value: TipoItemAvaliadoEnum.TURMA, label: "Turma" },
  { value: TipoItemAvaliadoEnum.DISCIPLINA, label: "Disciplina" },
  { value: TipoItemAvaliadoEnum.COORDENADOR, label: "Coordenador" },
  { value: TipoItemAvaliadoEnum.ESTRUTURA, label: "Estrutura" },
  { value: TipoItemAvaliadoEnum.INFRAESTRUTURA, label: "Infraestrutura" },
];

export interface QuestoesQuestionario {
  id: number;
  questaoId: number;
  questionarioId: number;
  ordem: number;
  questao: QuestionResponse;
  tipo: QuestionTypeEnum
}


