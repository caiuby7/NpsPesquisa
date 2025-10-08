import { useQuery } from "@tanstack/react-query";
import { api } from "../../../services/api";

export interface NivelEnsino {
  id: number;
  nome: string;
}

export interface Turno {
  id: number;
  nome: string;
}

export interface TipoMatricula {
  id: number;
  nome: string;
}

export interface TipoDisciplina {
  id: number;
  nome: string;
}

export interface TipoTurma {
  id: number;
  nome: string;
}

export interface TipoProfessor {
  id: number;
  nome: string;
}

export function useGetNiveisEnsino() {
  return useQuery({
    queryKey: ["niveis-ensino"],
    queryFn: async () => {
      const response = await api.get<NivelEnsino[]>("/NivelEnsino");
      return response.data;
    },
  });
}

export function useGetTurnos() {
  return useQuery({
    queryKey: ["turnos"],
    queryFn: async () => {
      const response = await api.get<Turno[]>("/Turno");
      return response.data;
    },
  });
}

export function useGetTiposMatricula() {
  return useQuery({
    queryKey: ["tipos-matricula"],
    queryFn: async () => {
      try {
        console.log('🔍 useGetTiposMatricula - Tentando buscar da API...');
        const response = await api.get<TipoMatricula[]>("/TipoMatricula");
        console.log('✅ useGetTiposMatricula - Resposta da API:', response.data);
        return response.data;
      } catch (error) {
        console.log('❌ useGetTiposMatricula - Endpoint /TipoMatricula falhou:', error);
        console.log('🔄 useGetTiposMatricula - Usando dados hardcoded');
        // Fallback para dados hardcoded
        return [
          { id: 1, nome: "Regular" },
          { id: 2, nome: "Especial" },
          { id: 3, nome: "Transferência" },
          { id: 4, nome: "Reingresso" }
        ];
      }
    },
  });
}

export function useGetTiposDisciplina() {
  return useQuery({
    queryKey: ["tipos-disciplina"],
    queryFn: async () => {
      const response = await api.get<TipoDisciplina[]>("/TipoDisciplina");
      return response.data;
    },
  });
}

export function useGetTiposTurma() {
  return useQuery({
    queryKey: ["tipos-turma"],
    queryFn: async () => {
      const response = await api.get<TipoTurma[]>("/TipoTurma");
      return response.data;
    },
  });
}

export function useGetTiposProfessor() {
  return useQuery({
    queryKey: ["tipos-professor"],
    queryFn: async () => {
      try {
        console.log('🔍 useGetTiposProfessor - Tentando buscar da API...');
        // Tentar o endpoint real primeiro
        const response = await api.get<TipoProfessor[]>("/TipoProfessor");
        console.log('✅ useGetTiposProfessor - Resposta da API:', response.data);
        return response.data;
      } catch (error) {
        console.log('❌ useGetTiposProfessor - Endpoint /TipoProfessor falhou:', error);
        console.log('🔄 useGetTiposProfessor - Usando dados hardcoded');
        // Fallback para dados hardcoded
        return [
          { id: 1, nome: "Titular" },
          { id: 2, nome: "Tutor" },
          { id: 3, nome: "Coordenador" }
        ];
      }
    },
  });
}

