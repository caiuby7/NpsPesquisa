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
  // Campos para estatísticas (se disponíveis)
  totalParticipantes?: number;
  participantesResponderam?: number;
}

export function useGetAvaliacoes() {
  return useQuery({
    queryKey: ["avaliacoes"],
    queryFn: async () => {
      const response = await api.get<Avaliacao[]>("/Questionario");
      // Filtrar apenas avaliações institucionais
      return response.data.filter((questionario: any) => 
        questionario.tipo === "AvaliacaoInstitucional"
      );
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
