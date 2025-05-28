export interface AnswerPostParams {
  questionarioId: number;
  alunoId: number;
  respostasQuestoes: Answer[];
}

export interface Answer {
  questaoId: number;
  opcaoId: number;
  valor: string;
}
