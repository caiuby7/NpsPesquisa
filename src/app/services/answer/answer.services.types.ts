export interface AnswerPostParams {
  questionarioId: number;
  alunoId: number;
  respostasQuestoes: Answer[];
}

export interface Answer {
  questaoId: number;
  opcaoId?: number |  string;
  valor?: string;
}

export interface RespostaQuestao {
  questaoId: number;
  valor: string;
}
