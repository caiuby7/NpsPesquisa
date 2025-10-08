import { useState, useEffect, useMemo } from 'react';
import { useGetNiveisEnsino, useGetTiposTurma, useGetTiposDisciplina, useGetTiposProfessor, useGetTiposMatricula } from '../app/services/lookup/lookup.service.hooks';
import { useGetRegrasCascata as useGetRegrasCascataAPI } from '../app/services/regras-cascata/regras-cascata.service.hooks';

export interface RegraCascata {
  id: string;
  nome: string;
  ativa: boolean;
  combinacoes: CombinacaoRegra[];
}

export interface CombinacaoRegra {
  id: string;
  origem: string;
  destino: string | string[];
  permitido: boolean;
  opcoes?: string[];
}

interface UseRegrasCascataReturn {
  regras: RegraCascata[];
  opcoesFiltradas: {
    niveisEnsino: string[];
    tiposTurma: string[];
    tiposProfessor: string[];
    tiposDisciplina: string[];
    tiposMatricula: string[];
    tiposAvaliado: string[];
  };
  aplicarRegrasCascata: (selecoes: {
    nivelEnsino?: string;
    tipoTurma?: string;
    tipoAvaliado?: string;
  }) => any;
  adicionarRegra: (novaRegra: Omit<RegraCascata, 'id'>) => void;
  atualizarRegra: (id: string, atualizacoes: Partial<RegraCascata>) => void;
  removerRegra: (id: string) => void;
  setRegras: React.Dispatch<React.SetStateAction<RegraCascata[]>>;
}

export const useRegrasCascata = (): UseRegrasCascataReturn => {
  const { data: niveisEnsino = [], isLoading: loadingNiveis } = useGetNiveisEnsino();
  const { data: tiposTurma = [], isLoading: loadingTurmas } = useGetTiposTurma();
  const { data: tiposDisciplina = [], isLoading: loadingDisciplinas } = useGetTiposDisciplina();
  const { data: tiposProfessor = [], isLoading: loadingProfessores } = useGetTiposProfessor();
  const { data: tiposMatricula = [], isLoading: loadingMatriculas } = useGetTiposMatricula();
  
  // Buscar regras do banco
  const { data: regrasDoBanco = [], isLoading: loadingRegras } = useGetRegrasCascataAPI(true);
  
  // Debug: forçar dados hardcoded para teste
  const tiposProfessorDebug = useMemo(() => {
    return tiposProfessor.length === 0 ? [
      { id: 1, nome: "Titular" },
      { id: 2, nome: "Tutor" },
      { id: 3, nome: "Coordenador" }
    ] : tiposProfessor;
  }, [tiposProfessor]);

  console.log('🔍 useRegrasCascata - Dados da API:', {
    niveisEnsino,
    tiposTurma,
    tiposDisciplina,
    tiposProfessor,
    loadingNiveis,
    loadingTurmas,
    loadingDisciplinas,
    loadingProfessores
  });

  console.log('🔍 useRegrasCascata - Tipos de Professor específicos:', {
    tiposProfessorArray: tiposProfessor,
    tiposProfessorNomes: tiposProfessor.map(p => p.nome),
    tiposProfessorLength: tiposProfessor.length,
    tiposProfessorDebug: tiposProfessorDebug,
    tiposProfessorDebugNomes: tiposProfessorDebug.map(p => p.nome)
  });

  console.log('🔍 useRegrasCascata - Regras do banco:', {
    regrasDoBanco,
    loadingRegras,
    quantidade: regrasDoBanco?.length || 0
  });

  // Fallback: usar regras hardcoded se não houver regras no banco
  const regrasHardcoded: RegraCascata[] = [
    {
      id: 'nivel-ensino-tipo-professor',
      nome: 'Nível de Ensino × Tipo de Professor',
      ativa: true,
      combinacoes: [
        {
          id: 'graduacao-presencial-titular',
          origem: 'Graduação Presencial',
          destino: ['Titular'],
          permitido: true
        },
        {
          id: 'graduacao-presencial-tutor',
          origem: 'Graduação Presencial',
          destino: ['Tutor'],
          permitido: true
        },
        {
          id: 'pos-graduacao-titular',
          origem: 'Pós-Graduação',
          destino: ['Titular'],
          permitido: true
        },
        {
          id: 'pos-graduacao-coordenador',
          origem: 'Pós-Graduação',
          destino: ['Coordenador'],
          permitido: true
        }
      ]
    },
    {
      id: 'nivel-ensino-tipo-matricula',
      nome: 'Nível de Ensino × Tipo de Matrícula',
      ativa: true,
      combinacoes: [
        {
          id: 'graduacao-regular',
          origem: 'Graduação Presencial',
          destino: ['Regular'],
          permitido: true
        },
        {
          id: 'graduacao-especial',
          origem: 'Graduação Presencial',
          destino: ['Especial'],
          permitido: true
        },
        {
          id: 'pos-graduacao-regular',
          origem: 'Pós-Graduação',
          destino: ['Regular'],
          permitido: true
        },
        {
          id: 'pos-graduacao-especial',
          origem: 'Pós-Graduação',
          destino: ['Especial'],
          permitido: true
        }
      ]
    },
    {
      id: 'nivel-ensino-tipo-turma',
      nome: 'Nível de Ensino × Tipo de Turma',
      ativa: true,
      combinacoes: [
        {
          id: 'graduacao-presencial-presencial',
          origem: 'Graduação Presencial',
          destino: ['Presencial'],
          permitido: true
        },
        {
          id: 'graduacao-presencial-ead',
          origem: 'Graduação Presencial',
          destino: ['EAD'],
          permitido: true
        },
        {
          id: 'pos-graduacao-presencial',
          origem: 'Pós-Graduação',
          destino: ['Presencial'],
          permitido: true
        },
        {
          id: 'pos-graduacao-semipresencial',
          origem: 'Pós-Graduação',
          destino: ['Semipresencial'],
          permitido: true
        }
      ]
    },
    {
      id: 'nivel-ensino-tipo-disciplina',
      nome: 'Nível de Ensino × Tipo de Disciplina',
      ativa: true,
      combinacoes: [
        {
          id: 'graduacao-teorica',
          origem: 'Graduação Presencial',
          destino: ['Teórica'],
          permitido: true
        },
        {
          id: 'graduacao-pratica',
          origem: 'Graduação Presencial',
          destino: ['Prática'],
          permitido: true
        },
        {
          id: 'pos-graduacao-teorica',
          origem: 'Pós-Graduação',
          destino: ['Teórica'],
          permitido: true
        },
        {
          id: 'pos-graduacao-pratica',
          origem: 'Pós-Graduação',
          destino: ['Prática'],
          permitido: true
        }
      ]
    },
    {
      id: 'tipo-turma-tipo-disciplina',
      nome: 'Tipo de Turma × Tipo de Disciplina',
      ativa: true,
      combinacoes: [
        {
          id: 'presencial-teorica',
          origem: 'Presencial',
          destino: ['Teórica'],
          permitido: true
        },
        {
          id: 'presencial-pratica',
          origem: 'Presencial',
          destino: ['Prática'],
          permitido: true
        },
        {
          id: 'ead-teorica',
          origem: 'EAD',
          destino: ['Teórica'],
          permitido: true
        },
        {
          id: 'ead-pratica',
          origem: 'EAD',
          destino: ['Prática'],
          permitido: false
        }
      ]
    },
    {
      id: 'tipo-turma-tipo-professor',
      nome: 'Tipo de Turma × Tipo de Professor',
      ativa: true,
      combinacoes: [
        {
          id: 'presencial-titular',
          origem: 'Presencial',
          destino: ['Titular'],
          permitido: true
        },
        {
          id: 'presencial-tutor',
          origem: 'Presencial',
          destino: ['Tutor'],
          permitido: true
        },
        {
          id: 'ead-tutor',
          origem: 'EAD',
          destino: ['Tutor'],
          permitido: true
        },
        {
          id: 'ead-titular',
          origem: 'EAD',
          destino: ['Titular'],
          permitido: false
        }
      ]
    },
    {
      id: 'item-avaliado-tipo-professor',
      nome: 'Item Avaliado × Tipo de Professor',
      ativa: true,
      combinacoes: [
        {
          id: 'disciplina-titular',
          origem: 'Disciplina',
          destino: ['Titular'],
          permitido: true
        },
        {
          id: 'disciplina-tutor',
          origem: 'Disciplina',
          destino: ['Tutor'],
          permitido: true
        },
        {
          id: 'curso-coordenador',
          origem: 'Curso',
          destino: ['Coordenador'],
          permitido: true
        },
        {
          id: 'turma-titular',
          origem: 'Turma',
          destino: ['Titular'],
          permitido: true
        }
      ]
    },
    {
      id: 'item-avaliado-tipo-turma',
      nome: 'Item Avaliado × Tipo de Turma',
      ativa: true,
      combinacoes: [
        {
          id: 'disciplina-presencial',
          origem: 'Disciplina',
          destino: ['Presencial'],
          permitido: true
        },
        {
          id: 'disciplina-ead',
          origem: 'Disciplina',
          destino: ['EAD'],
          permitido: true
        },
        {
          id: 'curso-presencial',
          origem: 'Curso',
          destino: ['Presencial'],
          permitido: true
        },
        {
          id: 'turma-presencial',
          origem: 'Turma',
          destino: ['Presencial'],
          permitido: true
        }
      ]
    },
    {
      id: 'item-avaliado-tipo-disciplina',
      nome: 'Item Avaliado × Tipo de Disciplina',
      ativa: true,
      combinacoes: [
        {
          id: 'disciplina-teorica',
          origem: 'Disciplina',
          destino: ['Teórica'],
          permitido: true
        },
        {
          id: 'disciplina-pratica',
          origem: 'Disciplina',
          destino: ['Prática'],
          permitido: true
        },
        {
          id: 'curso-teorica',
          origem: 'Curso',
          destino: ['Teórica'],
          permitido: true
        },
        {
          id: 'turma-pratica',
          origem: 'Turma',
          destino: ['Prática'],
          permitido: true
        }
      ]
    },
    {
      id: 'item-avaliado-tipo-matricula',
      nome: 'Item Avaliado × Tipo de Matrícula',
      ativa: true,
      combinacoes: [
        {
          id: 'disciplina-regular',
          origem: 'Disciplina',
          destino: ['Regular'],
          permitido: true
        },
        {
          id: 'disciplina-especial',
          origem: 'Disciplina',
          destino: ['Especial'],
          permitido: true
        },
        {
          id: 'curso-regular',
          origem: 'Curso',
          destino: ['Regular'],
          permitido: true
        },
        {
          id: 'turma-regular',
          origem: 'Turma',
          destino: ['Regular'],
          permitido: true
        }
      ]
    }
  ];

  // Usar regras do banco se disponíveis, caso contrário usar hardcoded
  const regrasParaUsar = useMemo(() => {
    if (loadingRegras) {
      return regrasHardcoded; // Usar hardcoded enquanto carrega
    }
    
    if (regrasDoBanco && regrasDoBanco.length > 0) {
      // Converter formato da API para formato do hook
      return regrasDoBanco.map(regra => ({
        id: regra.identificador,
        nome: regra.nome,
        ativa: regra.ativa,
        combinacoes: regra.combinacoes.map(comb => ({
          id: comb.id,
          origem: comb.origem,
          destino: comb.destino,
          permitido: comb.permitido,
          opcoes: comb.opcoes
        }))
      }));
    }
    
    // Fallback para hardcoded
    return regrasHardcoded;
  }, [regrasDoBanco, loadingRegras]);

  const [regras, setRegras] = useState<RegraCascata[]>(regrasParaUsar);

  // Atualizar regras quando mudar
  useEffect(() => {
    setRegras(regrasParaUsar);
  }, [regrasParaUsar]);

  const [opcoesFiltradas, setOpcoesFiltradas] = useState({
    niveisEnsino: [] as string[],
    tiposTurma: [] as string[],
    tiposProfessor: [] as string[],
    tiposDisciplina: [] as string[],
    tiposMatricula: [] as string[],
    tiposAvaliado: ['Disciplina', 'Curso', 'Turma'] // Manter hardcoded por enquanto
  });

  // Atualizar opções quando os dados da API chegarem
  useEffect(() => {
    console.log('🔄 useEffect - Atualizando opções filtradas:', {
      niveisEnsino: niveisEnsino.map(n => n.nome),
      tiposTurma: tiposTurma.map(t => t.nome),
      tiposProfessor: tiposProfessorDebug.map(p => p.nome),
      tiposDisciplina: tiposDisciplina.map(d => d.nome),
      tiposMatricula: tiposMatricula.map(m => m.nome),
      loadingStates: { loadingNiveis, loadingTurmas, loadingDisciplinas, loadingProfessores, loadingMatriculas }
    });
    
    setOpcoesFiltradas({
      niveisEnsino: niveisEnsino.map(n => n.nome),
      tiposTurma: tiposTurma.map(t => t.nome),
      tiposProfessor: tiposProfessorDebug.map(p => p.nome),
      tiposDisciplina: tiposDisciplina.map(d => d.nome),
      tiposMatricula: tiposMatricula.map(m => m.nome),
      tiposAvaliado: ['Disciplina', 'Curso', 'Turma']
    });
  }, [niveisEnsino, tiposTurma, tiposDisciplina, tiposProfessorDebug, tiposMatricula, loadingNiveis, loadingTurmas, loadingDisciplinas, loadingProfessores, loadingMatriculas]);

  const aplicarRegrasCascata = (selecoes: {
    nivelEnsino?: string;
    tipoTurma?: string;
    tipoAvaliado?: string;
  }) => {
    let opcoesDisponiveis = {
      niveisEnsino: niveisEnsino.map(n => n.nome),
      tiposTurma: tiposTurma.map(t => t.nome),
      tiposProfessor: tiposProfessorDebug.map(p => p.nome),
      tiposDisciplina: tiposDisciplina.map(d => d.nome),
      tiposMatricula: tiposMatricula.map(m => m.nome),
      tiposAvaliado: ['Disciplina', 'Curso', 'Turma']
    };

    // Aplicar regra: Nível de Ensino × Tipo de Turma
    const regraNivelTurma = regras.find(r => r.id === 'nivel-ensino-tipo-turma');
    if (regraNivelTurma?.ativa && selecoes.nivelEnsino) {
      const combinacoesPermitidas = regraNivelTurma.combinacoes
        .filter(c => c.origem === selecoes.nivelEnsino && c.permitido)
        .map(c => c.destino);
      
      opcoesDisponiveis.tiposTurma = opcoesDisponiveis.tiposTurma.filter(tipo => 
        combinacoesPermitidas.includes(tipo)
      );
    }

    // Aplicar regra: Tipo de Turma × Tipo de Professor
    const regraTurmaProfessor = regras.find(r => r.id === 'tipo-turma-tipo-professor');
    if (regraTurmaProfessor?.ativa && selecoes.tipoTurma) {
      const combinacoesPermitidas = regraTurmaProfessor.combinacoes
        .filter(c => c.origem === selecoes.tipoTurma && c.permitido)
        .map(c => c.destino);
      
      opcoesDisponiveis.tiposProfessor = opcoesDisponiveis.tiposProfessor.filter(tipo => 
        combinacoesPermitidas.includes(tipo)
      );
    }

    // Aplicar regra: Tipo Avaliado × Tipo de Professor
    const regraAvaliadoProfessor = regras.find(r => r.id === 'tipo-avaliado-tipo-professor');
    if (regraAvaliadoProfessor?.ativa && selecoes.tipoAvaliado) {
      const combinacoesPermitidas = regraAvaliadoProfessor.combinacoes
        .filter(c => c.origem === selecoes.tipoAvaliado && c.permitido)
        .map(c => c.destino);
      
      opcoesDisponiveis.tiposProfessor = opcoesDisponiveis.tiposProfessor.filter(tipo => 
        combinacoesPermitidas.includes(tipo)
      );
    }

    setOpcoesFiltradas(opcoesDisponiveis);
    return opcoesDisponiveis;
  };

  const adicionarRegra = (novaRegra: Omit<RegraCascata, 'id'>) => {
    const regraComId = {
      ...novaRegra,
      id: `regra-${Date.now()}`
    };
    setRegras(prev => [...prev, regraComId]);
  };

  const atualizarRegra = (id: string, atualizacoes: Partial<RegraCascata>) => {
    setRegras(prev => prev.map(regra => 
      regra.id === id ? { ...regra, ...atualizacoes } : regra
    ));
  };

  const removerRegra = (id: string) => {
    setRegras(prev => prev.filter(regra => regra.id !== id));
  };

  return {
    regras,
    opcoesFiltradas,
    aplicarRegrasCascata,
    adicionarRegra,
    atualizarRegra,
    removerRegra,
    setRegras
  };
};
