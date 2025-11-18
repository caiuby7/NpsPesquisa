import { api } from './api';
import { API_URLS } from '../config/api-urls';

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

export interface RelatorioAvaliacaoPerguntaDto {
  questaoId: number;
  enunciado: string;
  tipo: string;
  ordem: number;
  totalRespostas: number;
  opcoes: RelatorioAvaliacaoOpcaoDto[];
  respostasTextuais: RelatorioAvaliacaoRespostaTextoDto[];
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
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-curso')}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorCursoTurnoExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-curso-turno')}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorTurmaExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-turma')}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
  async exportarRelatorioPorDisciplinaExcel(payload: RelatorioAvaliacaoRequest): Promise<Blob> {
    const response = await api.post(`${API_URLS.RELATORIO_AVALIACAO_GERAL.replace('geral-avaliacao', 'por-disciplina')}/excel`, payload, {
      responseType: 'blob',
    });
    return response.data;
  },
};


