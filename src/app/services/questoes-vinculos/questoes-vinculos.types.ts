export interface QuestaoResumo {
  id: number;
  texto: string;
}

export interface QuestaoVinculoDto {
  id: number;
  questaoAlunoId: number;
  questaoAluno: QuestaoResumo;
  questaoProfessorId?: number;
  questaoProfessor?: QuestaoResumo | null;
  questaoCoordenadorId?: number;
  questaoCoordenador?: QuestaoResumo | null;
  observacao?: string | null;
}

export interface QuestionarioVinculoResponse {
  id: number;
  avaliacaoAlunoId: number;
  avaliacaoProfessorId?: number | null;
  avaliacaoCoordenadorId?: number | null;
  tipoComparacao: string;
  criadoEm: string;
  atualizadoEm?: string | null;
  questoes: QuestaoVinculoDto[];
}

export interface QuestionarioVinculoFiltro {
  avaliacaoAlunoId?: number;
  avaliacaoProfessorId?: number;
  avaliacaoCoordenadorId?: number;
  tipoComparacao?: string;
}

export interface QuestaoVinculoSalvar {
  questaoAlunoId: number;
  questaoProfessorId?: number | null;
  questaoCoordenadorId?: number | null;
  observacao?: string | null;
}

export interface SalvarQuestionarioVinculoPayload {
  avaliacaoAlunoId: number;
  avaliacaoProfessorId?: number | null;
  avaliacaoCoordenadorId?: number | null;
  tipoComparacao?: string;
  questoes: QuestaoVinculoSalvar[];
}

export interface ExcluirQuestaoVinculoPayload {
  vinculoId: number;
  questaoAlunoId: number;
}

export interface QuestionarioVinculoListaItem {
  id: number;
  avaliacaoAlunoId: number;
  avaliacaoProfessorId?: number | null;
  avaliacaoCoordenadorId?: number | null;
  tipoComparacao: string;
  ativo: boolean;
  totalQuestoes: number;
  criadoEm: string;
  atualizadoEm?: string | null;
}


