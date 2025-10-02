export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = "MultiplaEscolha",
  TEXT_BOX = "CaixaTexto",
  LINEAR_SCALE = "EscalaLinear",
  MENU = "MenuSuspenso",
  MATRIX = "Matriz",
  CHECKBOX = "CaixaSelecao",
}

export type QuestionType = QuestionTypeEnum;

// Novo enum para TipoQuestionario
export enum TipoQuestionarioEnum {
  NPS = "NPS",
  AVALIACAO_INSTITUCIONAL = "AvaliacaoInstitucional"
}

// Novo enum para TipoItemAvaliado
export enum TipoItemAvaliadoEnum {
  PROFESSOR = "Professor",
  DISCIPLINA = "Disciplina",
  TURMADISCIPLINA = "TurmaDisciplina",
  CURSO = "Curso",
  ESTAGIO = "Estagio",
  PROJETOEXTENSIONISTA = "ProjetoExtensionista",
  ESTRUTURA = "Estrutura",
  COORDENADOR = "Coordenador",
  ALUNOS = "Alunos",
  TURMA = "Turma",
  INFRAESTRUTURA = "Infraestrutura",
  TCC = "TCC",
  PACEXTENSIONISTA = "PACExtensionista"
}

export enum TipoTurmaEnum {
  PRESENCIAL = "Presencial",
  SEMIPRESENCIAL = "Semipresencial",
  EAD = "EAD"
}

export const TIPO_TURMA_OPTIONS = [
  { value: TipoTurmaEnum.PRESENCIAL, label: "Aulas Presenciais" },
  { value: TipoTurmaEnum.SEMIPRESENCIAL, label: "Aulas Semipresenciais" },
  { value: TipoTurmaEnum.EAD, label: "Aulas à Distância" }
];

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
  { value: QuestionTypeEnum.CHECKBOX, label: "Caixa de Seleção" },
];

// Novos tipos para questionários
export const QUESTIONARIO_TYPES = [
  { value: TipoQuestionarioEnum.NPS, label: "NPS" },
  { value: TipoQuestionarioEnum.AVALIACAO_INSTITUCIONAL, label: "Avaliação Institucional" },
];

export const ITEM_AVALIADO_TYPES = [
  { value: TipoItemAvaliadoEnum.PROFESSOR, label: "Professor" },
  { value: TipoItemAvaliadoEnum.DISCIPLINA, label: "Disciplina" },
  { value: TipoItemAvaliadoEnum.TURMADISCIPLINA, label: "Turma/Disciplina" },
  { value: TipoItemAvaliadoEnum.CURSO, label: "Curso" },
  { value: TipoItemAvaliadoEnum.ESTAGIO, label: "Estágio" },
  { value: TipoItemAvaliadoEnum.PROJETOEXTENSIONISTA, label: "Projeto Extensionista" },
  { value: TipoItemAvaliadoEnum.ESTRUTURA, label: "Estrutura" },
  { value: TipoItemAvaliadoEnum.COORDENADOR, label: "Coordenador" },
  { value: TipoItemAvaliadoEnum.ALUNOS, label: "Alunos" },
  { value: TipoItemAvaliadoEnum.TURMA, label: "Turma" },
  { value: TipoItemAvaliadoEnum.INFRAESTRUTURA, label: "Infraestrutura" },
  { value: TipoItemAvaliadoEnum.TCC, label: "TCC" },
  { value: TipoItemAvaliadoEnum.PACEXTENSIONISTA, label: "PAC Extensionista" },
];

export interface QuestoesQuestionario {
  id: number;
  questaoId: number;
  questionarioId: number;
  ordem: number;
  questao: QuestionResponse;
  tipo: QuestionTypeEnum
}


