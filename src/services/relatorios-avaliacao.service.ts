import { api } from './api';
import { API_URLS } from '../config/api-urls';
import { ENVIRONMENT } from '../config/environment';

export interface RelatorioAvaliacaoRequest {
  questionarioId: number;
  cursoIds?: number[];
  turmaIds?: number[];
  disciplinaIds?: number[];
  professorIds?: number[];
  instituicaoIds?: number[];
  incluirRespostasTextuais?: boolean;
  incluirAnaliseSentimentos?: boolean;
}

export interface RelatorioAvaliacaoContagemDto {
  quantidade: number;
  percentual: number;
}

export interface RelatorioAvaliacaoOpcaoDto {
  opcaoId?: number | null;
  rotulo: string;
  total: number;
  percentualGeral: number;
  porTipoParticipante: Record<string, RelatorioAvaliacaoContagemDto>;
}

export interface RelatorioAvaliacaoRespostaTextoDto {
  respostaId: number;
  participanteId: number;
  participanteNome: string;
  tipoParticipante: string;
  texto: string;
  dataResposta: string;
  sentimento?: string | null;
}

export interface RelatorioAvaliacaoSentimentoAgregadoDto {
  sentimento: string;
  quantidade: number;
  percentual: number;
}

export interface RelatorioAvaliacaoCategoriaSentimentoDto {
  categoria: string;
  total: number;
  sentimentos: RelatorioAvaliacaoSentimentoAgregadoDto[];
}

export interface RelatorioAvaliacaoPerguntaDto {
  questaoId: number;
  enunciado: string;
  tipo: string;
  ordem: number;
  totalRespostas: number;
  opcoes: RelatorioAvaliacaoOpcaoDto[];
  respostasTextuais: RelatorioAvaliacaoRespostaTextoDto[];
  analiseSentimentoAgregada?: RelatorioAvaliacaoSentimentoAgregadoDto[];
  analiseSentimentoPorCategoria?: RelatorioAvaliacaoCategoriaSentimentoDto[];
}

export interface RelatorioAvaliacaoResumoParticipantesDto {
  totalConvites: number;
  totalRespondentes: number;
  totalPendentes: number;
  percentualResposta: number;
  porTipoParticipante: Record<string, RelatorioAvaliacaoContagemDto>;
}

export interface RelatorioAvaliacaoGeralDto {
  questionarioId: number;
  titulo: string;
  descricao?: string | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  resumoParticipantes: RelatorioAvaliacaoResumoParticipantesDto;
  perguntas: RelatorioAvaliacaoPerguntaDto[];
  metadados: Record<string, unknown>;
}

export interface RelatorioAvaliacaoAgrupadoDto {
  chaveAgrupamento: string;
  nomeAgrupamento: string;
  nomeSecundario?: string | null;
  relatorio: RelatorioAvaliacaoGeralDto;
}

// DTOs para Relatório Comparativo
export interface VinculoComparavelDto {
  id: number;
  avaliacaoAlunoId: number;
  avaliacaoAlunoTitulo: string;
  avaliacaoProfessorId?: number;
  avaliacaoProfessorTitulo?: string;
  avaliacaoCoordenadorId?: number;
  avaliacaoCoordenadorTitulo?: string;
  tipoComparacao: string;
  totalQuestoesVinculadas: number;
  temRespostas: boolean;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface ComparacaoPercentualDto {
  quantidade: number;
  percentual: number;
}

export interface ComparacaoTotalDto {
  aluno: number;
  professor?: number;
  coordenador?: number;
}

export interface OpcaoComparativaDto {
  opcaoId?: number;
  rotulo: string;
  aluno: ComparacaoPercentualDto;
  professor?: ComparacaoPercentualDto;
  coordenador?: ComparacaoPercentualDto;
}

export interface QuestaoComparativaDto {
  questaoAlunoId: number;
  enunciadoAluno: string;
  questaoProfessorId?: number;
  enunciadoProfessor?: string;
  questaoCoordenadorId?: number;
  enunciadoCoordenador?: string;
  tipo: string;
  ordem: number;
  observacao?: string;
  opcoes: OpcaoComparativaDto[];
  totalRespostas: ComparacaoTotalDto;
}

export interface RelatorioComparativoResumoDto {
  totalRespondentes: ComparacaoTotalDto;
  totalConvites: ComparacaoTotalDto;
  totalPendentes: ComparacaoTotalDto;
}

export interface QuestaoVinculoDto {
  id: number;
  questaoAlunoId: number;
  questaoAluno: { id: number; texto: string };
  questaoProfessorId?: number;
  questaoProfessor?: { id: number; texto: string };
  questaoCoordenadorId?: number;
  questaoCoordenador?: { id: number; texto: string };
  observacao?: string;
}

export interface QuestionarioVinculoDto {
  id: number;
  avaliacaoAlunoId: number;
  avaliacaoProfessorId?: number;
  avaliacaoCoordenadorId?: number;
  tipoComparacao: string;
  criadoEm: string;
  atualizadoEm?: string;
  questoes: QuestaoVinculoDto[];
}

export interface RelatorioComparativoDto {
  vinculo: QuestionarioVinculoDto;
  questoes: QuestaoComparativaDto[];
  resumo: RelatorioComparativoResumoDto;
}

export interface RelatorioComparativoRequest {
  vinculoId?: number;
  cursoIds?: number[];
  turmaIds?: number[];
  disciplinaIds?: number[];
  professorIds?: number[];
  instituicaoIds?: number[];
  participanteIds?: number[];
  periodoLetivoId?: number;
}

export interface RelatorioComparativoAgrupadoDto {
  chaveAgrupamento: string;
  nomeAgrupamento: string;
  nomeSecundario?: string | null;
  relatorio: RelatorioComparativoDto;
}

export const relatoriosAvaliacaoService = {
  async obterRelatorioGeral(payload: RelatorioAvaliacaoRequest): Promise<RelatorioAvaliacaoGeralDto> {
    const response = await api.post(API_URLS.RELATORIO_AVALIACAO_GERAL, payload);
    return response.data;
  },
  async obterRelatorioPorCurso(payload: RelatorioAvaliacaoRequest): Promise<RelatorioAvaliacaoAgrupadoDto[]> {
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-curso')}`, payload);
    return response.data;
  },
  async obterRelatorioPorCursoTurno(payload: RelatorioAvaliacaoRequest): Promise<RelatorioAvaliacaoAgrupadoDto[]> {
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-curso-turno')}`, payload);
    return response.data;
  },
  async obterRelatorioPorTurma(payload: RelatorioAvaliacaoRequest): Promise<RelatorioAvaliacaoAgrupadoDto[]> {
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-turma')}`, payload);
    return response.data;
  },
  async obterRelatorioPorDisciplina(payload: RelatorioAvaliacaoRequest): Promise<RelatorioAvaliacaoAgrupadoDto[]> {
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-disciplina')}`, payload);
    return response.data;
  },
  async exportarRelatorioGeralExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(API_URLS.RELATORIO_AVALIACAO_GERAL_EXCEL, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorCursoExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const baseUrl = API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-curso');
    const response = await api.post(`${baseUrl}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorCursoTurnoExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const baseUrl = API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-curso-turno');
    const response = await api.post(`${baseUrl}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorTurmaExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const baseUrl = API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-turma');
    const response = await api.post(`${baseUrl}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorDisciplinaExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const baseUrl = API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-disciplina');
    const response = await api.post(`${baseUrl}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  // Relatório Comparativo
  async listarVinculosComparaveis(): Promise<VinculoComparavelDto[]> {
    const response = await api.get(`${ENVIRONMENT.API_URL}/relatorios/comparativo/vinculos`);
    return response.data;
  },
  async obterRelatorioComparativo(vinculoId: number, request?: RelatorioComparativoRequest): Promise<RelatorioComparativoDto> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  async exportarRelatorioComparativoExcel(vinculoId: number, request?: RelatorioComparativoRequest): Promise<Blob> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/excel${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },
  async obterRelatorioComparativoPorCurso(vinculoId: number, request?: RelatorioComparativoRequest): Promise<RelatorioComparativoAgrupadoDto[]> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/por-curso${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  async obterRelatorioComparativoPorCursoTurno(vinculoId: number, request?: RelatorioComparativoRequest): Promise<RelatorioComparativoAgrupadoDto[]> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/por-curso-turno${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  async obterRelatorioComparativoPorTurma(vinculoId: number, request?: RelatorioComparativoRequest): Promise<RelatorioComparativoAgrupadoDto[]> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/por-turma${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  async obterRelatorioComparativoPorDisciplina(vinculoId: number, request?: RelatorioComparativoRequest): Promise<RelatorioComparativoAgrupadoDto[]> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/por-disciplina${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url);
    return response.data;
  },
  async exportarRelatorioComparativoAgrupadoExcel(vinculoId: number, tipoAgrupamento: string, request?: RelatorioComparativoRequest): Promise<Blob> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/${tipoAgrupamento}/excel${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioGeralPdf(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${ENVIRONMENT.API_URL}/RelatoriosAvaliacao/geral-avaliacao/pdf`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorCursoPdf(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${ENVIRONMENT.API_URL}/RelatoriosAvaliacao/por-curso/pdf`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorCursoTurnoPdf(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${ENVIRONMENT.API_URL}/RelatoriosAvaliacao/por-curso-turno/pdf`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorTurmaPdf(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${ENVIRONMENT.API_URL}/RelatoriosAvaliacao/por-turma/pdf`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorDisciplinaPdf(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${ENVIRONMENT.API_URL}/RelatoriosAvaliacao/por-disciplina/pdf`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioComparativoPdf(vinculoId: number, request?: RelatorioComparativoRequest): Promise<Blob> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/pdf${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioComparativoAgrupadoPdf(vinculoId: number, tipoAgrupamento: string, request?: RelatorioComparativoRequest): Promise<Blob> {
    const params = new URLSearchParams();
    if (request) {
      if (request.cursoIds?.length) request.cursoIds.forEach(id => params.append('cursoIds', id.toString()));
      if (request.turmaIds?.length) request.turmaIds.forEach(id => params.append('turmaIds', id.toString()));
      if (request.disciplinaIds?.length) request.disciplinaIds.forEach(id => params.append('disciplinaIds', id.toString()));
      if (request.professorIds?.length) request.professorIds.forEach(id => params.append('professorIds', id.toString()));
      if (request.instituicaoIds?.length) request.instituicaoIds.forEach(id => params.append('instituicaoIds', id.toString()));
      if (request.participanteIds?.length) request.participanteIds.forEach(id => params.append('participanteIds', id.toString()));
      if (request.periodoLetivoId) params.append('periodoLetivoId', request.periodoLetivoId.toString());
    }
    const queryString = params.toString();
    const url = `${ENVIRONMENT.API_URL}/relatorios/comparativo/${vinculoId}/${tipoAgrupamento}/pdf${queryString ? '?' + queryString : ''}`;
    const response = await api.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },
};


