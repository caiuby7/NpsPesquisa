// ========================================
// CONFIGURAÇÃO CENTRALIZADA DE URLs DA API
// ========================================

import { ENVIRONMENT } from './environment';

/**
 * URLs centralizadas da API
 * Use estas constantes em vez de URLs hardcoded
 */
export const API_URLS = {
  // URLs baseadas na configuração de ambiente
  BASE: ENVIRONMENT.API_URL,
  
  // Endpoints específicos
  AVALIACOES: `${ENVIRONMENT.API_URL}/Questionario/com-estatisticas`,
  AVALIACOES_DISPONIVEIS: `${ENVIRONMENT.API_URL}/AvaliacoesDisponiveis`,
  INSTITUICOES: `${ENVIRONMENT.API_URL}/instituicoes`,
  PERIODOS_LETIVOS: `${ENVIRONMENT.API_URL}/periodosletivos`,
  CURSOS: `${ENVIRONMENT.API_URL}/cursos`,
  TURMAS: `${ENVIRONMENT.API_URL}/turmas`,
  DISCIPLINAS: `${ENVIRONMENT.API_URL}/disciplinas`,
  PROFESSORES: `${ENVIRONMENT.API_URL}/professores`,
  COORDENADORES: `${ENVIRONMENT.API_URL}/coordenadores`,
  AVALIACAO_CRIAR: `${ENVIRONMENT.API_URL}/avaliacao/criar`,
  AVALIACAO_FILTROS: `${ENVIRONMENT.API_URL}/avaliacao/filtros/participantes`,
  
  // Endpoints de questionário
  QUESTIONARIO: `${ENVIRONMENT.API_URL}/Questionario`,
  QUESTIONARIO_POR_CHAVE: (chave: string) => `${ENVIRONMENT.API_URL}/Questionario/por-chave/${chave}`,
  QUESTIONARIO_ESTATISTICAS: (id: number) => `${ENVIRONMENT.API_URL}/Questionario/${id}/estatisticas`,
  QUESTIONARIO_PARTICIPANTES: (id: number) => `${ENVIRONMENT.API_URL}/Questionario/${id}/participantes`,
  
  // Endpoints de resposta
  RESPOSTA: `${ENVIRONMENT.API_URL}/Resposta`,
  RESPOSTA_ENVIAR: `${ENVIRONMENT.API_URL}/Resposta/enviar`,
  
  // Endpoints de autenticação
  LOGIN: `${ENVIRONMENT.API_URL}/Auth/login`,
  LOGIN_TOTVS: `${ENVIRONMENT.API_URL}/Auth/login-totvs`,
  
  // Endpoints de participante
  PARTICIPANTE: `${ENVIRONMENT.API_URL}/Participante`,
  PARTICIPANTE_BUSCAR_TOTVS: `${ENVIRONMENT.API_URL}/Participante/buscar-e-adicionar-totvs`,
  
  // Endpoints de relatório
  RELATORIO_DASHBOARD: `${ENVIRONMENT.API_URL}/Questionario/dashboard-admin`,
  RELATORIO_ESTATISTICAS: `${ENVIRONMENT.API_URL}/Questionario/com-estatisticas`,
  RELATORIO_POR_CURSO: `${ENVIRONMENT.API_URL}/Questionario/relatorio-por-curso`,
  RELATORIO_POR_TURNO: `${ENVIRONMENT.API_URL}/Questionario/relatorio-por-turno`,
  RELATORIO_POR_CAMPUS: `${ENVIRONMENT.API_URL}/Questionario/relatorio-por-campus`,
  RELATORIO_ACOMPANHAMENTO: `${ENVIRONMENT.API_URL}/Questionario/relatorio-acompanhamento`,
  RELATORIO_ACOMPANHAMENTO_EXCEL: `${ENVIRONMENT.API_URL}/Questionario/relatorio-acompanhamento/excel`,
};

/**
 * Função para criar URLs dinâmicas
 * @param endpoint - Endpoint base
 * @param params - Parâmetros para substituir
 * @returns URL completa
 */
export function createApiUrl(endpoint: string, params: Record<string, string | number> = {}): string {
  let url = endpoint;
  
  // Substituir parâmetros na URL
  Object.keys(params).forEach(key => {
    url = url.replace(`{${key}}`, String(params[key]));
  });
  
  return url;
}

/**
 * Função para fazer requisições com configuração padrão
 * @param url - URL da requisição
 * @param options - Opções adicionais do fetch
 * @returns Promise da resposta
 */
export async function apiRequest(url: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
}

// Log da configuração atual
console.log('🔗 URLs da API configuradas:', {
  BASE: API_URLS.BASE,
  ENVIRONMENT: ENVIRONMENT.IS_PRODUCTION ? 'PRODUÇÃO' : 'DESENVOLVIMENTO',
  AVALIACOES_DISPONIVEIS: API_URLS.AVALIACOES_DISPONIVEIS,
  INSTITUICOES: API_URLS.INSTITUICOES,
});
