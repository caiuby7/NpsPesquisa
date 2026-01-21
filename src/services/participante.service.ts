import { api } from './api';
import { ENVIRONMENT } from '../config/environment';

export interface ParticipanteDadosRelatorioDto {
  participanteId: number;
  tipo: string;
  email: string;
  nome: string;
  cursoIds: number[];
  turmaIds: number[];
  disciplinaIds: number[];
}

export const participanteService = {
  async obterMeusDados(): Promise<ParticipanteDadosRelatorioDto> {
    const response = await api.get(`${ENVIRONMENT.API_URL}/Participante/meus-dados`);
    return response.data;
  },
};

