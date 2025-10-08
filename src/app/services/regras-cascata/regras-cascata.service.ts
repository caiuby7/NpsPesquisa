import { api } from '../api';

export interface CombinacaoRegra {
  id: string;
  origem: string;
  destino: string[];
  permitido: boolean;
  opcoes?: string[];
}

export interface RegraCascataResponse {
  id: number;
  nome: string;
  descricao?: string;
  identificador: string;
  ativa: boolean;
  tipoOrigem: string;
  tipoDestino: string;
  combinacoes: CombinacaoRegra[];
  ordem: number;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface RegraCascataRequest {
  id?: number;
  nome: string;
  descricao?: string;
  identificador: string;
  ativa: boolean;
  tipoOrigem: string;
  tipoDestino: string;
  combinacoes: CombinacaoRegra[];
  ordem: number;
}

export interface ReordenacaoDto {
  id: number;
  ordem: number;
}

/**
 * Serviço para gerenciar regras em cascata globais
 */
class RegrasCascataService {
  private baseUrl = '/RegrasCascata';

  /**
   * Busca todas as regras em cascata
   * @param apenasAtivas Se deve retornar apenas regras ativas
   */
  async getAll(apenasAtivas: boolean = true): Promise<RegraCascataResponse[]> {
    const response = await api.get<RegraCascataResponse[]>(this.baseUrl, {
      params: { apenasAtivas }
    });
    return response.data;
  }

  /**
   * Busca uma regra específica por ID
   */
  async getById(id: number): Promise<RegraCascataResponse> {
    const response = await api.get<RegraCascataResponse>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Busca uma regra específica por identificador
   */
  async getByIdentificador(identificador: string): Promise<RegraCascataResponse> {
    const response = await api.get<RegraCascataResponse>(
      `${this.baseUrl}/por-identificador/${identificador}`
    );
    return response.data;
  }

  /**
   * Cria uma nova regra
   */
  async create(regra: RegraCascataRequest): Promise<RegraCascataResponse> {
    const response = await api.post<RegraCascataResponse>(this.baseUrl, regra);
    return response.data;
  }

  /**
   * Atualiza uma regra existente
   */
  async update(id: number, regra: RegraCascataRequest): Promise<RegraCascataResponse> {
    const response = await api.put<RegraCascataResponse>(`${this.baseUrl}/${id}`, regra);
    return response.data;
  }

  /**
   * Ativa ou desativa uma regra
   */
  async toggleAtiva(id: number): Promise<{ message: string; ativa: boolean }> {
    const response = await api.patch<{ message: string; ativa: boolean }>(
      `${this.baseUrl}/${id}/toggle-ativa`
    );
    return response.data;
  }

  /**
   * Exclui uma regra (soft delete)
   */
  async delete(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Exclui permanentemente uma regra
   */
  async deletePermanente(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`${this.baseUrl}/${id}/permanente`);
    return response.data;
  }

  /**
   * Reordena as regras
   */
  async reordenar(reordenacoes: ReordenacaoDto[]): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(
      `${this.baseUrl}/reordenar`,
      reordenacoes
    );
    return response.data;
  }
}

export const regrasCascataService = new RegrasCascataService();

