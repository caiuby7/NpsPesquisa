import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

export interface Avaliacao {
  id: number;
  titulo: string;
  descricao?: string;
  tipo: string;
  tipoItemAvaliado?: string;
  nomeItemEspecifico?: string;
  dataInicio?: string;
  dataFim?: string;
  dataCriacao: string;
  ativo: boolean;
  permitirComentarios: boolean;
  permitirSalvarAndamento: boolean;
  textoBoasVindas?: string;
  templateEmailConvite?: string;
  templateEmailLembrete?: string;
  lembrarACadaXDias?: number;
  enviarLembreteAutomatico: boolean;
  enviarLembreteParaTodos: boolean;
  // Campos para instituição
  instituicaoId: number;
  nomeInstituicao?: string;
  // Campos para estatísticas (opcionais pois podem não vir do endpoint de busca por ID)
  totalParticipantes?: number;
  totalRespostas?: number;
}

export function useGetAvaliacoes() {
  return useQuery({
    queryKey: ["avaliacoes"],
    queryFn: async () => {
      const response = await api.get<Avaliacao[]>("/Questionario/com-estatisticas");
      return response.data;
    },
  });
}

export function useGetAvaliacaoById(id: number) {
  return useQuery({
    queryKey: ["avaliacao", id],
    queryFn: async () => {
      const response = await api.get<Avaliacao>(`/Questionario/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export interface DashboardAdminStats {
  totalAvaliacoes: number;
  avaliacoesAtivas: number;
  totalParticipantes: number;
  taxaRespostaGeral: number;
  questionariosRespondidos: number;
  usuariosAtivos: number;
}

export function useGetDashboardAdminStats() {
  return useQuery({
    queryKey: ["dashboard-admin-stats"],
    queryFn: async () => {
      const response = await api.get<DashboardAdminStats>("/Questionario/dashboard-admin");
      return response.data;
    },
  });
}

export interface AvaliacaoAtiva {
  id: number;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  tipoItemAvaliado: string;
  nomeItemEspecifico: string;
  ativo: boolean;
  dataCriacao: string;
  instituicaoId: number;
  nomeInstituicao: string;
  totalParticipantes: number;
  totalRespostas: number;
  taxaResposta: number;
  status: 'ativa' | 'finalizada' | 'aguardando';
}

export function useGetAvaliacoesAtivas() {
  return useQuery({
    queryKey: ["avaliacoes-ativas"],
    queryFn: async () => {
      const response = await api.get<AvaliacaoAtiva[]>("/Questionario/avaliacoes-ativas");
      return response.data;
    },
  });
}
